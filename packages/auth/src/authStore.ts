import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';
import { 
  syncSessionAcrossApps, 
  restoreSharedSession, 
  shouldRedirectToMainApp,
  redirectToMainApp,
  handleReturnFromMainApp,
  handleMainAppReturn,
  getCurrentDomainType
} from './shared-auth';
import {
  startSessionCleanupService,
  setupVisibilityChangeHandler,
  setupStorageEventHandler,
  validateAndCleanupCurrentSession
} from './sessionCleanup';

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any, context: string) => {
  console.error(`❌ ${context}:`, error);
  if (error?.message) {
    console.error(`Error message: ${error.message}`);
  }
  if (error?.details) {
    console.error(`Error details: ${error.details}`);
  }
};

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'candidate' | 'recruiter' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitializing?: boolean;
  error?: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string, role?: 'candidate' | 'recruiter') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  initialize: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const supabase = getSupabaseClient();
      console.log('Starting login process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        handleSupabaseError(error, 'login');
      }

      if (data.user) {
        console.log('User authenticated successfully:', data.user.id);
        set({ user: data.user, isAuthenticated: true });
        
        // Sync session across apps
        await syncSessionAcrossApps(supabase);
        
        // Wait for auth state to settle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch user profile
        await get().refreshProfile();
      }
    } catch (error) {
      console.error('Login process failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, firstName: string, lastName: string, role: 'candidate' | 'recruiter' = 'candidate') => {
    set({ isLoading: true });
    try {
      const supabase = getSupabaseClient();
      console.log('Starting signup process...');
      
      // Step 1: Create the auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        handleSupabaseError(authError, 'signup');
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      console.log('Auth user created successfully:', authData.user.id);
      set({ user: authData.user, isAuthenticated: true });

      // Step 2: Create profile manually
      console.log('Creating profile manually...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          role: role,
        })
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        set({ profile: null, isLoading: false });
        return;
      }

      console.log('Profile created successfully:', newProfile);
      set({ profile: newProfile as Profile, isLoading: false });

    } catch (error) {
      console.error('Signup process failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const supabase = getSupabaseClient();
      console.log('Starting logout process...');
      
      // Clear shared session storage first
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('reelapps-shared-auth');
        
        // Broadcast logout event to other apps
        const channel = new BroadcastChannel('reelapps-auth-sync');
        channel.postMessage({ type: 'logout' });
        channel.close();
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        handleSupabaseError(error, 'logout');
      }
      
      set({ user: null, profile: null, isAuthenticated: false });
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear the local state
      set({ user: null, profile: null, isAuthenticated: false });
    }
  },
  
  setUser: (user) => {
    console.log('Setting user:', user?.id || 'null');
    set({ user, isAuthenticated: !!user });
  },

  setProfile: (profile) => {
    console.log('Setting profile:', profile?.id || 'null');
    set({ profile });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) {
      console.log('No user found, skipping profile refresh');
      set({ isLoading: false });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      console.log('Refreshing profile for user:', user.id);
      
      // Add a small delay to ensure the database has processed the user creation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error refreshing profile:', error);
        set({ isLoading: false });
        return;
      }

      if (!profile) {
        console.log('No profile found, attempting to create one...');
        
        // Try to create a profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
            role: user.user_metadata?.role || 'candidate',
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Failed to create profile:', createError);
          set({ profile: null, isAuthenticated: true, isLoading: false });
        } else {
          console.log('Profile created successfully:', newProfile);
          set({ profile: newProfile as Profile, isAuthenticated: true, isLoading: false });
        }
      } else {
        console.log('Profile found:', profile);
        set({ profile: profile as Profile, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      set({ isLoading: false });
    }
  },

  initialize: async () => {
    set({ isInitializing: true, error: null });
    console.log('🔄 AUTH STORE: Initializing auth store...');
      const supabase = getSupabaseClient();
    if (!supabase) {
        console.error("AUTH STORE: Supabase client not initialized before auth store.");
        set({ isInitializing: false, error: "Supabase client not available." });
        return;
    }
      console.log('✅ AUTH STORE: Got Supabase client');
    startSessionCleanupService(supabase);

    // Check for session info in the URL hash first (coming from SSO redirect)
    if (window.location.hash.includes('access_token')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token && refresh_token) {
            console.log('🔑 AUTH STORE: Found session in URL hash, setting session...');
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });

            if (error) {
                console.error('AUTH STORE: Error setting session from hash:', error);
                set({ error: 'Failed to set session from redirect.' });
            } else {
                console.log('✅ AUTH STORE: Session set successfully from hash.');
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
        }
    }

    // Now, continue with standard initialization
        const shouldRedirect = await shouldRedirectToMainApp(supabase);
        
        if (shouldRedirect) {
      console.log('🔄 AUTH STORE: No valid session, redirecting to main app for authentication');
          redirectToMainApp();
      return;
    }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log(`✅ AUTH STORE: Found existing session for user: ${session.user.id}`);
        set({
            isAuthenticated: true,
            user: session.user,
            isInitializing: false,
        });
        await get().refreshProfile();
        await syncSessionAcrossApps(supabase);
      } else {
        console.log('⚠️ AUTH STORE: No session found after checks.');
        set({ isAuthenticated: false, user: null, isInitializing: false });
      }
      
      console.log('✅ AUTH STORE: Initialization completed successfully');
  },

  sendPasswordResetEmail: async (email: string) => {
    set({ isLoading: true });
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
      });

      if (error) {
        handleSupabaseError(error, 'sendPasswordResetEmail');
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Function to set up auth state listener
export const setupAuthListener = () => {
  const supabase = getSupabaseClient();
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state change:', event, session?.user?.id || 'no user');
    
    const { setUser, refreshProfile } = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' && session?.user) {
      setUser(session.user);
      await refreshProfile();
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
      useAuthStore.setState({ profile: null });
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      setUser(session.user);
    }
  });
};

// Session watcher for token refresh
export const startSessionWatcher = () => {
  const FIFTY_MINUTES = 50 * 60 * 1000;
  setInterval(async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn('Silent session refresh failed', error.message);
        return;
      }
      if (data?.session?.user) {
        useAuthStore.getState().setUser(data.session.user);
      }
    } catch (err) {
      console.warn('Silent session refresh threw', err);
    }
  }, FIFTY_MINUTES);
}; 
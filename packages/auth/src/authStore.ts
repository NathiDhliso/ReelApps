import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase';
import { 
  syncSessionAcrossApps
} from './shared-auth';
import {
  startSessionCleanupService
} from './sessionCleanup';
import { 
  secureLogin, 
  securePasswordReset, 
  securePasswordUpdate,
  validateSessionSecurity 
} from './secureAuth';
import { 
  setupApplicationCSRFProtection,
  clearCSRFProtection
} from './csrfProtection';

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
  csrfProtection?: any;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string, role?: 'candidate' | 'recruiter') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  initialize: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  validateSecurity: () => Promise<{ isValid: boolean; reasons: string[]; recommendations: string[] }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  csrfProtection: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      console.log('Starting secure login process...');
      
      // Use secure login with session fixation prevention
      const { data: _data, error: _error } = await secureLogin(supabase, email, password);

      if (_error) {
        console.error('Secure login error:', _error);
        handleSupabaseError(_error, 'secure login');
        set({ error: _error.message, isLoading: false });
        throw _error;
      }

      if (_data.user) {
        console.log('User authenticated securely:', _data.user.id);
        set({ user: _data.user, isAuthenticated: true });
        
        // Sync session across apps
        await syncSessionAcrossApps(supabase);
        
        // Wait for auth state to settle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch user profile
        await get().refreshProfile();
        
        console.log('✅ Secure login completed successfully');
      }
    } catch (error) {
      console.error('Secure login process failed:', error);
      set({ error: error instanceof Error ? error.message : 'Login failed', isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email: string, password: string, firstName: string, lastName: string, role: 'candidate' | 'recruiter' = 'candidate') => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      console.log('Starting secure signup process...');
      
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
        set({ error: authError.message, isLoading: false });
        throw authError;
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
        set({ profile: null, error: 'Profile creation failed', isLoading: false });
        return;
      }

      console.log('Profile created successfully:', newProfile);
      set({ profile: newProfile as Profile });
      
      // Initialize CSRF protection for new user
      const { csrfProtection } = get();
      if (csrfProtection) {
        csrfProtection.refreshToken();
      }

    } catch (error) {
      console.error('Secure signup process failed:', error);
      set({ error: error instanceof Error ? error.message : 'Signup failed', isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  logout: async () => {
    try {
      const supabase = getSupabaseClient();
      console.log('Starting secure logout process...');
      
      // Clear CSRF protection first
      clearCSRFProtection();
      
      // Clear shared session storage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('reelapps-shared-auth');
        
        // Broadcast logout event to other apps
        const channel = new BroadcastChannel('reelapps-auth-sync');
        channel.postMessage({ type: 'logout' });
        channel.close();
      }
      
      const { error: _error } = await supabase.auth.signOut();
      if (_error) {
        console.error('Logout error:', _error);
        handleSupabaseError(_error, 'logout');
      }
      
      set({ 
        user: null, 
        profile: null, 
        isAuthenticated: false,
        csrfProtection: null,
        error: null
      });
      console.log('✅ Secure logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear the local state
      set({ 
        user: null, 
        profile: null, 
        isAuthenticated: false,
        csrfProtection: null,
        error: null
      });
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
      
      const { data: profile, error: _error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (_error && _error.code !== 'PGRST116') {
        console.error('Error refreshing profile:', _error);
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
    console.log('🔄 AUTH STORE: Initializing secure auth store...');
      const supabase = getSupabaseClient();
    if (!supabase) {
        console.error("AUTH STORE: Supabase client not initialized before auth store.");
        set({ isInitializing: false, error: "Supabase client not available." });
        return;
    }
      console.log('✅ AUTH STORE: Got Supabase client');
    
    // Initialize CSRF protection
    console.log('🛡️ AUTH STORE: Setting up CSRF protection...');
    const csrfProtection = setupApplicationCSRFProtection();
    set({ csrfProtection });
    
    startSessionCleanupService(supabase);

    // Check for session info in the URL hash first (coming from SSO redirect)
    if (window.location.hash.includes('access_token')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token && refresh_token) {
            console.log('🔑 AUTH STORE: Found session in URL hash, setting session...');
            const { error: _error } = await supabase.auth.setSession({ access_token, refresh_token });

            if (_error) {
                console.error('AUTH STORE: Error setting session from hash:', _error);
                set({ error: 'Failed to set session from redirect.' });
            } else {
                console.log('✅ AUTH STORE: Session set successfully from hash.');
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
        }
    }

    // Check session and update state only - no navigation
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log(`✅ AUTH STORE: Found existing session for user: ${session.user.id}`);
        
        // Validate session security
        const securityCheck = await validateSessionSecurity(supabase);
        if (!securityCheck.isValid) {
          console.warn('⚠️ AUTH STORE: Session security validation failed:', securityCheck.reasons);
          // Force logout for security
          await get().logout();
          set({ 
            isInitializing: false, 
            error: 'Session security validation failed. Please log in again.' 
          });
          return;
        }
        
        set({
            isAuthenticated: true,
            user: session.user,
            isInitializing: false,
        });
        await get().refreshProfile();
        await syncSessionAcrossApps(supabase);
      } else {
        console.log('⚠️ AUTH STORE: No session found');
        set({ isAuthenticated: false, user: null, isInitializing: false });
      }
      
    console.log('✅ AUTH STORE: Secure initialization completed successfully');
  },

  sendPasswordResetEmail: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      console.log('Sending secure password reset email...');
      
      // Use secure password reset to prevent user enumeration
      const { message: _message, error: _error } = await securePasswordReset(supabase, email);

      if (_error) {
        handleSupabaseError(_error, 'sendPasswordResetEmail');
        set({ error: _error.message });
        throw _error;
      }
      
      console.log('✅ Secure password reset email sent');
      // Don't set success message in state to maintain security
      
    } catch (error) {
      console.error('Secure password reset failed:', error);
      // Don't expose the actual error for security
      set({ error: 'Unable to process password reset request' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = getSupabaseClient();
      console.log('Starting secure password update...');
      
      // Use secure password update with session invalidation
      const { data: _data, error: _error } = await securePasswordUpdate(supabase, newPassword);
      
      if (_error) {
        handleSupabaseError(_error, 'updatePassword');
        set({ error: _error.message, isLoading: false });
        throw _error;
      }
      
      console.log('✅ Password updated securely');
      
      // Refresh CSRF token after password change
      const { csrfProtection } = get();
      if (csrfProtection) {
        csrfProtection.refreshToken();
      }
      
    } catch (error) {
      console.error('Secure password update failed:', error);
      set({ error: error instanceof Error ? error.message : 'Password update failed', isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  validateSecurity: async () => {
    try {
      const supabase = getSupabaseClient();
      console.log('Validating session security...');
      
      const result = await validateSessionSecurity(supabase);
      
      if (!result.isValid) {
        console.warn('⚠️ Security validation failed:', result.reasons);
        // Could trigger logout here if validation fails
      }
      
      return result;
    } catch (error) {
      console.error('Security validation error:', error);
      return {
        isValid: false,
        reasons: ['Security validation failed'],
        recommendations: ['Please log in again']
      };
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
      const { data: _data, error: _error } = await supabase.auth.refreshSession();
      if (_error) {
        console.warn('Silent session refresh failed', _error.message);
        return;
      }
      if (_data?.session?.user) {
        const session = _data.session;
        useAuthStore.getState().setUser(session.user);
      }
    } catch (err) {
      console.warn('Silent session refresh threw', err);
    }
  }, FIFTY_MINUTES);
}; 

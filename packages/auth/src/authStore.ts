import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient, handleSupabaseError } from './supabase';
import { syncSessionAcrossApps, restoreSharedSession, setupCrossAppAuthListener } from './shared-auth';

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
        handleSupabaseError(error);
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
        handleSupabaseError(authError);
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        handleSupabaseError(error);
      }
      set({ user: null, profile: null, isAuthenticated: false });
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
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
        console.log('No profile found');
        set({ profile: null, isAuthenticated: true, isLoading: false });
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
    set({ isLoading: true });
    try {
      console.log('Initializing auth store...');
      
      const supabase = getSupabaseClient();
      
      // First try to restore shared session
      const restoredSession = await restoreSharedSession(supabase);
      
      if (restoredSession) {
        console.log('Restored shared session for user:', restoredSession.user.id);
        set({ user: restoredSession.user, isAuthenticated: true });
        await get().refreshProfile();
      } else {
        // Fall back to getting session normally
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          set({ isLoading: false });
          return;
        }

        if (session?.user) {
          console.log('Found existing session for user:', session.user.id);
          set({ user: session.user, isAuthenticated: true });
          await get().refreshProfile();
          // Sync this session across apps
          await syncSessionAcrossApps(supabase);
        } else {
          console.log('No existing session found');
          set({ isLoading: false });
        }
      }
      
      // Set up cross-app auth listener
      setupCrossAppAuthListener(supabase);
    } catch (error) {
      console.error('Initialize error:', error);
      set({ isLoading: false });
    }
  },

  sendPasswordResetEmail: async (email: string) => {
    set({ isLoading: true });
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
      });

      if (error) {
        handleSupabaseError(error);
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
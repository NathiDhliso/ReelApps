import { create } from 'zustand';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        handleSupabaseError(error);
      }

      if (data.user) {
        // Wait for auth state to settle
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Fetch user profile
        await get().refreshProfile();
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, firstName: string, lastName: string, role: 'candidate' | 'recruiter' = 'candidate') => {
    set({ isLoading: true });
    try {
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

      // Step 2: Wait for the database trigger to create the profile
      // The trigger should automatically create a profile based on the metadata
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Fetch the created profile
      let retries = 0;
      let profile = null;
      
      while (retries < 5 && !profile) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        }

        profile = profileData;
        
        if (!profile) {
          console.log(`Profile not found yet, retry ${retries + 1}/5`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries++;
        }
      }

      // If profile still doesn't exist after retries, create it manually
      if (!profile) {
        console.log('Profile not created by trigger, creating manually...');
        
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
          console.error('Manual profile creation error:', createError);
          // Don't throw here - user is created, just profile failed
          // The user can still use the app and profile can be created later
        }

        profile = newProfile;
      }

      console.log('Signup completed with profile:', profile);

      set({ 
        user: authData.user, 
        profile: profile,
        isAuthenticated: true, 
        isLoading: false 
      });

    } catch (error) {
      console.error('Signup process failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        handleSupabaseError(error);
      }
      set({ user: null, profile: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error refreshing profile:', error);
        return;
      }

      // If no profile exists, create one with default values
      if (!profile) {
        console.log('No profile found, creating default profile...');
        
        const userData = user.user_metadata || {};
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            first_name: userData.first_name || 'User',
            last_name: userData.last_name || 'Name',
            role: (userData.role as 'candidate' | 'recruiter') || 'candidate'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating default profile:', createError);
          set({ profile: null, isAuthenticated: true, isLoading: false });
          return;
        }

        set({ profile: newProfile, isAuthenticated: true, isLoading: false });
      } else {
        set({ profile, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      set({ isLoading: false });
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        set({ isLoading: false });
        return;
      }

      if (session?.user) {
        set({ user: session.user });
        await get().refreshProfile();
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Initialize error:', error);
      set({ isLoading: false });
    }
  },
}));

/*****************************************************************
 * Session watcher – silently refresh JWT every 50 minutes so that
 * background tabs do not lose authentication.                    *
 *****************************************************************/
let sessionWatcherStarted = false;
export const startSessionWatcher = () => {
  if (sessionWatcherStarted) return;
  sessionWatcherStarted = true;
  // Refresh right before the typical 60-minute expiry window.
  const FIFTY_MINUTES = 50 * 60 * 1000;
  setInterval(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn('Silent session refresh failed', error.message);
        return;
      }
      if (data?.session?.user) {
        // Update store so that latest user metadata is available.
        useAuthStore.getState().setUser(data.session.user);
      }
    } catch (err) {
      console.warn('Silent session refresh threw', err);
    }
  }, FIFTY_MINUTES);
};

// Listen for auth changes with improved error handling
supabase.auth.onAuthStateChange(async (event, session) => {
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
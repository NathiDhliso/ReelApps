import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@reelapps/auth';
import { Database } from '@reelapps/types';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  role?: 'candidate' | 'recruiter' | 'admin';
};

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (_email: string, _password: string) => Promise<void>;
  signup: (_email: string, _password: string, _firstName: string, _lastName: string, _role?: 'candidate' | 'recruiter') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (_user: User | null) => void;
  setProfile: (_profile: Profile | null) => void;
  initialize: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendPasswordResetEmail: (_email: string) => Promise<void>;
}

// Helper function for error handling
const handleSupabaseError = (error: any, context: string) => {
  console.error(`❌ ${context}:`, error);
  if (error?.message) {
    throw new Error(error.message);
  }
  throw error;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  
  login: async (_email: string, _password: string) => {
    set({ isLoading: true });
    try {
      console.log('Starting login process...');
      
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: _email,
        password: _password,
      });

      if (error) {
        console.error('Login error:', error);
        handleSupabaseError(error, 'login');
      }

      if (data.user) {
        console.log('User authenticated successfully:', data.user.id);
        set({ user: data.user, isAuthenticated: true });
        
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

  signup: async (_email: string, _password: string, _firstName: string, _lastName: string, _role: 'candidate' | 'recruiter' = 'candidate') => {
    set({ isLoading: true });
    try {
      console.log('Starting signup process...');
      
      // Step 1: Create the auth user with metadata
      const supabase = getSupabaseClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: _email,
        password: _password,
        options: {
          data: {
            first_name: _firstName,
            last_name: _lastName,
            role: _role
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

      // Step 2: Create profile manually since we can't rely on triggers
      console.log('Creating profile manually...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: _firstName,
          last_name: _lastName,
          email: authData.user.email
        })
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        // Don't throw here - user is created, just profile failed
        // The user can still use the app and profile can be created later
        set({ profile: null, isLoading: false });
        return;
      }

      console.log('Profile created successfully:', newProfile);
      // Add role to the profile for UI purposes
      const profileWithRole: Profile = {
        ...newProfile,
        role: _role || 'candidate'
      };
      set({ profile: profileWithRole, isLoading: false });

      // If session is null (e.g., email confirmation flow is enabled) automatically sign the user in so that
      // subsequent API calls have a valid JWT.
      if (!authData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: _email,
          password: _password,
        });

        if (signInError) {
          console.error('Auto sign-in after signup failed:', signInError);
        }

        if (signInData?.user) {
          set({ user: signInData.user, isAuthenticated: true });
        }
      }

    } catch (error) {
      console.error('Signup process failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      console.log('Starting logout process...');
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        handleSupabaseError(error, 'logout');
      }
      set({ user: null, profile: null, isAuthenticated: false });
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
  
  setUser: (_user) => {
    console.log('Setting user:', _user?.id || 'null');
    set({ user: _user, isAuthenticated: !!_user });
  },

  setProfile: (_profile) => {
    console.log('Setting profile:', _profile?.id || 'null');
    set({ profile: _profile });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) {
      console.log('No user found, skipping profile refresh');
      set({ isLoading: false });
      return;
    }

    try {
      console.log('🔍 DEBUG: Refreshing profile for user:', user.id);
      console.log('🔍 DEBUG: User metadata:', user.user_metadata);
      
      const supabase = getSupabaseClient();
      console.log('🔍 DEBUG: Got Supabase client, about to query profiles table...');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('🔍 DEBUG: Profile query completed');
      console.log('🔍 DEBUG: Profile data:', profile);
      console.log('🔍 DEBUG: Profile error:', error);

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error refreshing profile:', error);
        set({ isLoading: false });
        return;
      }

      if (!profile) {
        console.log('📝 No profile found, creating default profile...');
        const userData = user.user_metadata || {};
        console.log('🔍 DEBUG: User metadata for profile creation:', userData);
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            first_name: userData.first_name || 'User',
            last_name: userData.last_name || 'Name',
            email: user.email
          })
          .select()
          .single();

        console.log('🔍 DEBUG: Profile creation completed');
        console.log('🔍 DEBUG: New profile data:', newProfile);
        console.log('🔍 DEBUG: Profile creation error:', createError);

        if (createError) {
          console.error('❌ Error creating default profile:', createError);
          // Create a minimal profile object with role for the UI
          const fallbackProfile: Profile = {
            id: user.id,
            first_name: userData.first_name || 'User',
            last_name: userData.last_name || 'Name',
            email: user.email || null,
            role: (userData.role as 'candidate' | 'recruiter') || 'candidate',
            updated_at: null,
            username: null,
            avatar_url: null,
            bio: null,
            location: null,
            website: null,
            github_url: null,
            linkedin_url: null,
            twitter_url: null,
            years_experience: null,
            hourly_rate: null,
            availability: null,
            created_at: new Date().toISOString()
          };
          console.log('🔄 Setting fallback profile:', fallbackProfile);
          set({ profile: fallbackProfile, isAuthenticated: true, isLoading: false });
          return;
        }

        console.log('✅ Default profile created:', newProfile);
        // Add role to the profile for UI purposes
        const profileWithRole = {
          ...newProfile,
          role: (userData.role as 'candidate' | 'recruiter') || 'candidate'
        };
        console.log('🔄 Setting new profile with role:', profileWithRole);
        set({ profile: profileWithRole, isAuthenticated: true, isLoading: false });
      } else {
        console.log('✅ Profile found:', profile);
        // Add role to the profile for UI purposes
        const profileWithRole = {
          ...profile,
          role: (user.user_metadata?.role as 'candidate' | 'recruiter') || 'candidate'
        };
        console.log('🔄 Setting existing profile with role:', profileWithRole);
        set({ profile: profileWithRole, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      console.error('❌ Profile refresh error:', error);
      set({ isLoading: false });
    }
  },

  initialize: async () => {
    const { isLoading } = get();
    if (isLoading) {
      console.log('Initialization already in progress, skipping...');
      return;
    }

    set({ isLoading: true });
    try {
      console.log('Initializing auth store...');
      
      const supabase = getSupabaseClient();
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
      } else {
        console.log('No existing session found');
        set({ isLoading: false });
      }

      // Initialize Supabase auth listener
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
    } catch (error) {
      console.error('Initialize error:', error);
      set({ isLoading: false });
    }
  },

  sendPasswordResetEmail: async (_email: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(_email);
      if (error) {
        console.error('Password reset error:', error);
        handleSupabaseError(error, 'password reset');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
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
      const supabase = getSupabaseClient();
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
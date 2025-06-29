import { create } from 'zustand';
import { supabase } from './supabase';

export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: 'candidate' | 'recruiter' | 'admin';
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  profile: Profile | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: any) => void;
  setProfile: (profile: Profile | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      console.log('🔄 Initializing auth store...');
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ isAuthenticated: false, user: null, profile: null, loading: false });
        return;
      }

      if (session?.user) {
        console.log('✅ User authenticated:', session.user.email);
        
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        }

        set({
          isAuthenticated: true,
          user: session.user,
          profile: profile || null,
          loading: false,
        });
      } else {
        console.log('❌ No authenticated user');
        set({ isAuthenticated: false, user: null, profile: null, loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isAuthenticated: false, user: null, profile: null, loading: false });
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      set({ isAuthenticated: false, user: null, profile: null });
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setProfile: (profile) => {
    set({ profile });
  },
}));

// Setup auth listener
export const setupAuthListener = () => {
  console.log('🔗 Setting up auth listener...');
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth state changed:', event, session?.user?.email);
    
    const { setUser, setProfile } = useAuthStore.getState();
    
    if (event === 'SIGNED_IN' && session?.user) {
      // Fetch user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile after sign in:', error);
      }

      setUser(session.user);
      setProfile(profile || null);
    } else if (event === 'SIGNED_OUT') {
      setUser(null);
      setProfile(null);
    }
  });
};

// Session watcher (simplified version)
export const startSessionWatcher = () => {
  console.log('👀 Starting session watcher...');
  
  // Check session every minute
  setInterval(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        return;
      }

      const { isAuthenticated, setUser, setProfile } = useAuthStore.getState();
      
      // If we think we're authenticated but have no session, sign out
      if (isAuthenticated && !session) {
        console.log('🚪 Session expired, signing out...');
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Session watcher error:', error);
    }
  }, 60000); // Check every minute
};

// Initialize auth (to be called on app startup)
export const initializeAuth = async () => {
  const { initialize } = useAuthStore.getState();
  await initialize();
  setupAuthListener();
  startSessionWatcher();
}; 
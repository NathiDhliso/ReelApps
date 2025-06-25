import { initializeSupabase, setupAuthListener, startSessionWatcher } from '@reelapps/auth';

// Initialize Supabase with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Initialize the Supabase client
export const supabase = initializeSupabase(supabaseUrl, supabaseAnonKey);

// Set up auth listener and session watcher
if (typeof window !== 'undefined') {
  setupAuthListener();
  startSessionWatcher();
}

// Re-export everything from the auth package for convenience
export * from '@reelapps/auth'; 
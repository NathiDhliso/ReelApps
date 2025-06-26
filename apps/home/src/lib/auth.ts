import { initializeSupabase } from '@reelapps/auth';

// Initialize Supabase with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Initialize the Supabase client FIRST
initializeSupabase(supabaseUrl, supabaseAnonKey);

// Now import the rest after initialization
export { 
  useAuthStore, 
  setupAuthListener, 
  startSessionWatcher,
  type Profile 
} from '@reelapps/auth';

// Set up auth listener and session watcher after initialization
if (typeof window !== 'undefined') {
  // Import dynamically to ensure initialization order
  import('@reelapps/auth').then(({ setupAuthListener, startSessionWatcher }) => {
    setupAuthListener();
    startSessionWatcher();
  });
} 
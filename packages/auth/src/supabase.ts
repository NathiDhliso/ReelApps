import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AUTH_CONFIG } from './shared-auth';

// Define minimal database types needed for auth
interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          role: 'candidate' | 'recruiter' | 'admin';
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}

// Use a global key to persist client across hot reloads in development
const GLOBAL_SUPABASE_KEY = '__reelapps_supabase_client__';

let supabaseClient: SupabaseClient<Database> | null = null;

// Check for existing client in global scope (helps with hot reloading)
if (typeof window !== 'undefined' && (window as any)[GLOBAL_SUPABASE_KEY]) {
  supabaseClient = (window as any)[GLOBAL_SUPABASE_KEY];
  console.log('🔧 SUPABASE: Restored client from global scope (hot reload recovery)');
}

export const initializeSupabase = (url: string, anonKey: string) => {
  // If the client is already created, return the existing instance.
  // This prevents re-initialization when React Strict Mode runs useEffect twice.
  if (supabaseClient) {
    console.log('🔧 SUPABASE: Client already exists, returning existing instance');
    return supabaseClient;
  }

  console.log('🔧 SUPABASE: initializeSupabase called');
  console.log('🔧 SUPABASE: url present:', !!url);
  console.log('🔧 SUPABASE: anonKey present:', !!anonKey);
  console.log('🔧 SUPABASE: url length:', url?.length || 0);
  console.log('🔧 SUPABASE: anonKey length:', anonKey?.length || 0);
  
  if (!url || !anonKey) {
    console.error('🔧 SUPABASE: Missing environment variables!');
    throw new Error('Missing Supabase environment variables');
  }

  console.log('🔧 SUPABASE: Creating Supabase client...');
  supabaseClient = createClient<Database>(url, anonKey, {
    auth: AUTH_CONFIG.sessionOptions,
    global: {
      headers: {
        apikey: anonKey
      }
    }
  });

  // Store in global scope to persist across hot reloads in development
  if (typeof window !== 'undefined') {
    (window as any)[GLOBAL_SUPABASE_KEY] = supabaseClient;
  }

  console.log('🔧 SUPABASE: Supabase client created successfully:', !!supabaseClient);
  return supabaseClient;
};

export const getSupabaseClient = () => {
  console.log('🔍 SUPABASE: getSupabaseClient called');
  console.log('🔍 SUPABASE: supabaseClient exists:', !!supabaseClient);
  console.log('🔍 SUPABASE: current timestamp:', new Date().toISOString());
  console.log('🔍 SUPABASE: calling function stack:', new Error().stack?.split('\n').slice(1, 4).join('\n'));
  
  if (!supabaseClient) {
    console.error('🔍 SUPABASE: supabaseClient is null/undefined!');
    console.error('🔍 SUPABASE: This means initializeSupabase() was not called yet or failed');
    console.error('🔍 SUPABASE: Check the following:');
    console.error('  1. Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
    console.error('  2. initializeSupabase() is called before any SSO operations');
    console.error('  3. No errors occurred during client creation');
    
    // Check if we have environment variables available at this point
    if (typeof window !== 'undefined' && window.location) {
      console.error('🔍 SUPABASE: Current URL:', window.location.href);
    }
    
    throw new Error('Supabase client not initialized. Call initializeSupabase first.');
  }
  
  console.log('🔍 SUPABASE: Returning supabaseClient successfully');
  return supabaseClient;
};

/**
 * Helper function to handle Supabase errors consistently
 */
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`❌ ${context}:`, error);
  if (error?.message) {
    console.error(`Error message: ${error.message}`);
  }
  if (error?.details) {
    console.error(`Error details: ${error.details}`);
  }
};

// Helper function to get current user profile
export const getCurrentUserProfile = async () => {
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    handleSupabaseError(authError, 'Authentication');
  }
  
  if (!user) {
    throw new Error('No authenticated user found');
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (profileError) {
    handleSupabaseError(profileError, 'Profile retrieval');
  }
  
  return { user, profile };
};

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const supabase = getSupabaseClient();
    console.log('Testing Supabase connection...');
    
    // Simple health check query - just select first profile with limit
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return false;
  }
}; 
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

let supabaseClient: SupabaseClient<Database> | null = null;

export const initializeSupabase = (url: string, anonKey: string) => {
  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseClient = createClient<Database>(url, anonKey, {
    auth: AUTH_CONFIG.sessionOptions,
    global: {
      headers: {
        apikey: anonKey
      }
    }
  });

  return supabaseClient;
};

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initializeSupabase first.');
  }
  return supabaseClient;
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: { message?: string } | unknown) => {
  console.error('Supabase error:', error);
  
  if (error && typeof error === 'object' && 'message' in error) {
    throw new Error((error as { message: string }).message);
  }
  
  throw new Error('An unexpected error occurred');
};

// Helper function to get current user profile
export const getCurrentUserProfile = async () => {
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    handleSupabaseError(authError);
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
    handleSupabaseError(profileError);
  }
  
  return { user, profile };
};

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const supabase = getSupabaseClient();
    console.log('Testing Supabase connection...');
    
    // Simple health check query
    const { error } = await supabase
      .from('profiles')
      .select('count')
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
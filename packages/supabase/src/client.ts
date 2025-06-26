import { createClient } from '@supabase/supabase-js';
import type { Database } from '@reelapps/types';

// Helper function to get environment variables from different contexts
function getEnvVar(name: string): string | undefined {
  // Check if we're in a Vite context (browser/dev)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[name];
  }
  
  // Check if we're in a Node.js context
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  
  return undefined;
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Create a factory function for the client
export function createSupabaseClient(url?: string, anonKey?: string) {
  const finalUrl = url || supabaseUrl;
  const finalKey = anonKey || supabaseAnonKey;
  
  if (!finalUrl || !finalKey) {
    throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
  }

  return createClient<Database>(finalUrl, finalKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
}

// Default client instance
export const supabase = createSupabaseClient();

// Export a function to get the supabase client
export const getSupabaseClient = () => supabase;

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error) {
    console.error('Supabase error:', error.message);
    return error.message as string;
  }
  console.error('Unknown Supabase error:', error);
  return 'An unknown error occurred';
};

// Helper function to get current user profile
export const getCurrentUserProfile = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      return null;
    }

    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    return null;
  }
};

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful!');
    console.log('Current session:', session ? 'Active' : 'None');
    
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

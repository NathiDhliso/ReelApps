import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key present:', !!supabaseAnonKey);
console.log('Supabase Key length:', supabaseAnonKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      apikey: supabaseAnonKey
    }
  }
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: unknown) => {
  console.error('Supabase error:', error);
  
  if (error instanceof Error && error.message) {
    throw error;
  }
  
  throw new Error('An unexpected error occurred');
};

// Helper function to get current user profile
export const getCurrentUserProfile = async () => {
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
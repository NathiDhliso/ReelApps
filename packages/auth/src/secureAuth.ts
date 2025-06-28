import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Secure Authentication Utilities
 * Implements security best practices for authentication flows
 */

interface SecureSessionConfig {
  regenerateOnLogin: boolean;
  invalidateAllOnPasswordReset: boolean;
  useGenericResetResponses: boolean;
}

const DEFAULT_CONFIG: SecureSessionConfig = {
  regenerateOnLogin: true,
  invalidateAllOnPasswordReset: true,
  useGenericResetResponses: true,
};

/**
 * Prevents session fixation by ensuring session regeneration on login
 */
export const secureLogin = async (
  supabase: SupabaseClient,
  email: string,
  password: string,
  config: Partial<SecureSessionConfig> = {}
): Promise<{ data: any; error: any }> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // Step 1: Perform the login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user && data.session) {
      // Step 2: Session fixation prevention
      if (finalConfig.regenerateOnLogin) {
        console.log('🔄 Regenerating session for security...');
        
        // Force a token refresh to get a new session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.warn('⚠️ Session regeneration failed, but login succeeded:', refreshError.message);
          // Don't fail the login if session refresh fails
        } else if (refreshData.session) {
          console.log('✅ Session regenerated successfully');
          return { data: { user: refreshData.user, session: refreshData.session }, error: null };
        }
      }
      
      // Step 3: Update session activity in database
      await updateSecureSessionActivity(supabase, data.user.id);
      
      return { data, error: null };
    }

    throw new Error('Login succeeded but no user/session data received');
    
  } catch (error) {
    console.error('❌ Secure login failed:', error);
    return { data: null, error };
  }
};

/**
 * Secure password reset with user enumeration prevention
 */
export const securePasswordReset = async (
  supabase: SupabaseClient,
  email: string,
  config: Partial<SecureSessionConfig> = {}
): Promise<{ message: string; error: any }> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    // Always return a generic success message to prevent user enumeration
    const genericMessage = 'If an account with that email exists, a password reset link has been sent.';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset?secure=true`,
    });

    // Log the actual error for debugging but don't expose it to the user
    if (error) {
      console.warn('Password reset error (not exposed to user):', error.message);
    }

    // Always return success to prevent user enumeration
    if (finalConfig.useGenericResetResponses) {
      return { message: genericMessage, error: null };
    }

    // If not using generic responses, return the actual error
    return { message: error ? '' : genericMessage, error };
    
  } catch (error) {
    console.error('❌ Secure password reset failed:', error);
    
    // Always return generic message even on unexpected errors
    if (finalConfig.useGenericResetResponses) {
      return { 
        message: 'If an account with that email exists, a password reset link has been sent.', 
        error: null 
      };
    }
    
    return { message: '', error };
  }
};

/**
 * Secure password update with session invalidation
 */
export const securePasswordUpdate = async (
  supabase: SupabaseClient,
  newPassword: string,
  config: Partial<SecureSessionConfig> = {}
): Promise<{ data: any; error: any }> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // Step 1: Update the password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    // Step 2: Invalidate all existing sessions for security
    if (finalConfig.invalidateAllOnPasswordReset) {
      console.log('🔄 Invalidating all user sessions for security...');
      
      // Mark all sessions as inactive in the database
      await invalidateAllUserSessions(supabase, user.id);
      
      // Sign out from all devices (current session will remain active)
      await supabase.auth.signOut({ scope: 'others' });
      
      console.log('✅ All other sessions invalidated');
    }

    // Step 3: Update current session activity
    await updateSecureSessionActivity(supabase, user.id);

    return { data, error: null };
    
  } catch (error) {
    console.error('❌ Secure password update failed:', error);
    return { data: null, error };
  }
};

/**
 * Updates session activity with security metadata
 */
const updateSecureSessionActivity = async (supabase: SupabaseClient, userId: string) => {
  try {
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(); // 7 days
    
    // Get basic security metadata
    const securityMetadata = getSecurityMetadata();
    
    const { error } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        last_activity: now,
        expires_at: expiresAt,
        is_active: true,
        updated_at: now,
        // Security metadata
        ip_address: securityMetadata.ipAddress,
        user_agent: securityMetadata.userAgent,
        session_id: securityMetadata.sessionId,
      }, {
        onConflict: 'user_id',
      });
    
    if (error) {
      console.warn('⚠️ Could not update secure session activity:', error.message);
    }
  } catch (error) {
    console.warn('⚠️ Error updating secure session activity:', error);
  }
};

/**
 * Invalidates all sessions for a user
 */
const invalidateAllUserSessions = async (supabase: SupabaseClient, userId: string) => {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ is_active: false, invalidated_at: new Date().toISOString() })
      .eq('user_id', userId);
    
    if (error) {
      console.warn('⚠️ Could not invalidate user sessions:', error.message);
    }
  } catch (error) {
    console.warn('⚠️ Error invalidating user sessions:', error);
  }
};

/**
 * Gets basic security metadata for session tracking
 */
const getSecurityMetadata = () => {
  const sessionId = generateSessionId();
  
  return {
    sessionId,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    ipAddress: 'client-side', // IP will be logged server-side
    timestamp: new Date().toISOString(),
  };
};

/**
 * Generates a secure session identifier
 */
const generateSessionId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Validates session security and detects potential attacks
 */
export const validateSessionSecurity = async (supabase: SupabaseClient): Promise<{
  isValid: boolean;
  reasons: string[];
  recommendations: string[];
}> => {
  const reasons: string[] = [];
  const recommendations: string[] = [];
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      reasons.push('No valid session found');
      return { isValid: false, reasons, recommendations: ['Please log in again'] };
    }

    // Check session in database
    const { data: sessionData, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (sessionError || !sessionData) {
      reasons.push('Session not found in database');
      recommendations.push('Session may have been invalidated');
    } else {
      // Check if session is expired
      if (new Date(sessionData.expires_at) < new Date()) {
        reasons.push('Session has expired');
        recommendations.push('Please log in again');
      }
      
      // Check if session is marked as inactive
      if (!sessionData.is_active) {
        reasons.push('Session has been invalidated');
        recommendations.push('Please log in again');
      }
      
      // Check for suspicious activity (basic checks)
      const currentUserAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      if (sessionData.user_agent && sessionData.user_agent !== currentUserAgent) {
        reasons.push('User agent mismatch detected');
        recommendations.push('Possible session hijacking - please verify your account');
      }
    }

    const isValid = reasons.length === 0;
    
    return { isValid, reasons, recommendations };
    
  } catch (error) {
    console.error('❌ Session security validation failed:', error);
    return {
      isValid: false,
      reasons: ['Security validation failed'],
      recommendations: ['Please log in again for security']
    };
  }
};

export default {
  secureLogin,
  securePasswordReset,
  securePasswordUpdate,
  validateSessionSecurity,
}; 
import { SupabaseClient } from '@supabase/supabase-js';
import { SHARED_SESSION_KEY } from './shared-auth';

/**
 * Enhanced session cleanup utilities for ReelApps SSO system
 */

// Session cleanup configuration
const CLEANUP_CONFIG = {
  // How often to run cleanup (in milliseconds)
  cleanupInterval: 60 * 60 * 1000, // 1 hour
  
  // Grace period before marking session as expired (in milliseconds)
  gracePeriod: 5 * 60 * 1000, // 5 minutes
  
  // Maximum number of inactive sessions to keep per user
  maxInactiveSessions: 3,
};

/**
 * Clean up expired sessions from the database
 */
export const cleanupExpiredSessions = async (supabase: SupabaseClient<any>): Promise<void> => {
  try {
    console.log('🧹 SESSION CLEANUP: Starting expired session cleanup...');
    
    const now = new Date();
    const gracePeriodAgo = new Date(now.getTime() - CLEANUP_CONFIG.gracePeriod);
    
    // Mark sessions as inactive if they're past expiry + grace period
    const { data: expiredSessions, error: selectError } = await supabase
      .from('user_sessions')
      .select('user_id, id')
      .eq('is_active', true)
      .lt('expires_at', gracePeriodAgo.toISOString());
    
    if (selectError) {
      console.error('❌ SESSION CLEANUP: Error selecting expired sessions:', selectError);
      return;
    }
    
    if (expiredSessions && expiredSessions.length > 0) {
      console.log(`🧹 SESSION CLEANUP: Found ${expiredSessions.length} expired sessions to clean up`);
      
      // Mark sessions as inactive
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          updated_at: now.toISOString()
        })
        .eq('is_active', true)
        .lt('expires_at', gracePeriodAgo.toISOString());
      
      if (updateError) {
        console.error('❌ SESSION CLEANUP: Error updating expired sessions:', updateError);
      } else {
        console.log(`✅ SESSION CLEANUP: Successfully marked ${expiredSessions.length} sessions as inactive`);
      }
    } else {
      console.log('✅ SESSION CLEANUP: No expired sessions found');
    }
    
  } catch (error) {
    console.error('❌ SESSION CLEANUP: Unexpected error during cleanup:', error);
  }
};

/**
 * Validate current session and clean up if invalid
 */
export const validateAndCleanupCurrentSession = async (supabase: SupabaseClient<any>): Promise<boolean> => {
  try {
    console.log('🔍 SESSION CLEANUP: Validating current session...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ SESSION CLEANUP: Error getting current session:', error);
      return false;
    }
    
    if (!session?.user) {
      console.log('📭 SESSION CLEANUP: No current session found');
      return false;
    }
    
    // Check if session exists and is valid in database
    const { data: dbSession, error: dbError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (dbError || !dbSession || !dbSession.is_active || new Date(dbSession.expires_at) < new Date()) {
      console.log('⚠️ SESSION CLEANUP: Current session is invalid in database, cleaning up...');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SHARED_SESSION_KEY);
      }
      
      return false;
    }
    
    console.log('✅ SESSION CLEANUP: Current session is valid');
    return true;
    
  } catch (error) {
    console.error('❌ SESSION CLEANUP: Error validating current session:', error);
    return false;
  }
};

/**
 * Start the session cleanup service
 */
export const startSessionCleanupService = (supabase: SupabaseClient<any>): void => {
  console.log('🚀 SESSION CLEANUP: Starting session cleanup service...');
  
  // Run initial cleanup
  setTimeout(async () => {
    await cleanupExpiredSessions(supabase);
  }, 5000); // Wait 5 seconds after app start
  
  // Set up periodic cleanup
  setInterval(async () => {
    await cleanupExpiredSessions(supabase);
  }, CLEANUP_CONFIG.cleanupInterval);
  
  console.log(`✅ SESSION CLEANUP: Service started with ${CLEANUP_CONFIG.cleanupInterval / 1000 / 60} minute intervals`);
};

/**
 * Emergency session cleanup - force cleanup of all invalid sessions
 */
export const emergencySessionCleanup = async (supabase: SupabaseClient<any>): Promise<void> => {
  console.log('🚨 SESSION CLEANUP: Starting emergency session cleanup...');
  
  try {
    // Validate current session first
    const isValid = await validateAndCleanupCurrentSession(supabase);
    
    if (!isValid) {
      console.log('🚨 SESSION CLEANUP: Current session was invalid and has been cleaned up');
    }
    
    // Run cleanup procedures
    await cleanupExpiredSessions(supabase);
    
    console.log('✅ SESSION CLEANUP: Emergency cleanup completed');
    
  } catch (error) {
    console.error('❌ SESSION CLEANUP: Emergency cleanup failed:', error);
  }
};

/**
 * Handle browser visibility change to validate session
 */
export const setupVisibilityChangeHandler = (supabase: SupabaseClient<any>): void => {
  if (typeof window === 'undefined') return;
  
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible') {
      console.log('👁️ SESSION CLEANUP: Browser became visible, validating session...');
      await validateAndCleanupCurrentSession(supabase);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  console.log('✅ SESSION CLEANUP: Visibility change handler setup completed');
};

/**
 * Handle storage events to sync session state across tabs
 */
export const setupStorageEventHandler = (supabase: SupabaseClient<any>): void => {
  if (typeof window === 'undefined') return;
  
  const handleStorageChange = async (event: StorageEvent) => {
    if (event.key === SHARED_SESSION_KEY) {
      console.log('📦 SESSION CLEANUP: Session storage changed, validating...');
      
      if (!event.newValue) {
        // Session was cleared in another tab
        console.log('🚪 SESSION CLEANUP: Session cleared in another tab, signing out...');
        await supabase.auth.signOut();
      } else {
        // Session was updated in another tab, validate it
        await validateAndCleanupCurrentSession(supabase);
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  console.log('✅ SESSION CLEANUP: Storage event handler setup completed');
}; 
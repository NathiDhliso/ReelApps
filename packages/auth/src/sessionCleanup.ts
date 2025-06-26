import { getSupabaseClient } from './supabase';

/**
 * Session cleanup utilities for maintaining database hygiene
 * Removes expired sessions and inactive sessions to prevent database bloat
 */

/**
 * Clean up expired sessions from the database
 * Should be run periodically (e.g., daily via cron job)
 */
export async function cleanupExpiredSessions(): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  try {
    console.log('🧹 Starting expired session cleanup...');
    
    const supabase = getSupabaseClient();
    
    // Delete sessions that have expired
    const { data, error, count } = await supabase
      .from('user_sessions')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('❌ Error cleaning up expired sessions:', error);
      return { success: false, deletedCount: 0, error: error.message };
    }

    const deletedCount = count || 0;
    console.log(`✅ Cleaned up ${deletedCount} expired sessions`);
    
    return { success: true, deletedCount };
  } catch (error) {
    console.error('❌ Unexpected error during session cleanup:', error);
    return { 
      success: false, 
      deletedCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Clean up inactive sessions (sessions not accessed for a long time)
 * @param inactiveDays - Number of days of inactivity before cleanup (default: 30)
 */
export async function cleanupInactiveSessions(inactiveDays: number = 30): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  try {
    console.log(`🧹 Starting inactive session cleanup (${inactiveDays} days)...`);
    
    const supabase = getSupabaseClient();
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
    
    // Delete sessions that haven't been active for the specified period
    const { data, error, count } = await supabase
      .from('user_sessions')
      .delete({ count: 'exact' })
      .lt('last_activity', cutoffDate.toISOString())
      .eq('is_active', true); // Only clean up sessions marked as active

    if (error) {
      console.error('❌ Error cleaning up inactive sessions:', error);
      return { success: false, deletedCount: 0, error: error.message };
    }

    const deletedCount = count || 0;
    console.log(`✅ Cleaned up ${deletedCount} inactive sessions`);
    
    return { success: true, deletedCount };
  } catch (error) {
    console.error('❌ Unexpected error during inactive session cleanup:', error);
    return { 
      success: false, 
      deletedCount: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get session statistics for monitoring
 */
export async function getSessionStats(): Promise<{
  success: boolean;
  stats?: {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    inactiveSessions: number;
  };
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    
    // Get total sessions
    const { count: totalSessions, error: totalError } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      throw totalError;
    }

    // Get active sessions (not expired and marked as active)
    const { count: activeSessions, error: activeError } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gt('expires_at', now);

    if (activeError) {
      throw activeError;
    }

    // Get expired sessions
    const { count: expiredSessions, error: expiredError } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .lt('expires_at', now);

    if (expiredError) {
      throw expiredError;
    }

    // Get inactive sessions (active but not accessed in 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: inactiveSessions, error: inactiveError } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .lt('last_activity', sevenDaysAgo.toISOString());

    if (inactiveError) {
      throw inactiveError;
    }

    return {
      success: true,
      stats: {
        totalSessions: totalSessions || 0,
        activeSessions: activeSessions || 0,
        expiredSessions: expiredSessions || 0,
        inactiveSessions: inactiveSessions || 0,
      }
    };
  } catch (error) {
    console.error('❌ Error getting session stats:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Complete session maintenance - runs all cleanup tasks
 * Recommended to run this daily via cron job or scheduled task
 */
export async function performSessionMaintenance(): Promise<{
  success: boolean;
  results: {
    expiredCleanup: Awaited<ReturnType<typeof cleanupExpiredSessions>>;
    inactiveCleanup: Awaited<ReturnType<typeof cleanupInactiveSessions>>;
    stats: Awaited<ReturnType<typeof getSessionStats>>;
  };
}> {
  console.log('🔧 Starting complete session maintenance...');
  
  // Run all cleanup tasks
  const expiredCleanup = await cleanupExpiredSessions();
  const inactiveCleanup = await cleanupInactiveSessions();
  const stats = await getSessionStats();
  
  const success = expiredCleanup.success && inactiveCleanup.success && stats.success;
  
  if (success) {
    console.log('✅ Session maintenance completed successfully');
    if (stats.stats) {
      console.log('📊 Session Statistics:', stats.stats);
    }
  } else {
    console.log('⚠️ Session maintenance completed with some errors');
  }
  
  return {
    success,
    results: {
      expiredCleanup,
      inactiveCleanup,
      stats
    }
  };
}

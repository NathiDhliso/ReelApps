// Shared authentication configuration for ReelApps ecosystem

import { SupabaseClient } from '@supabase/supabase-js';

// Shared session storage key across all apps
export const SHARED_SESSION_KEY = 'reelapps-shared-auth';

/**
 * Authentication configuration for cross-domain SSO
 * Uses environment variables to support both development and production environments
 */
export const AUTH_CONFIG = {
  // Domain URLs - using environment variables with fallbacks
  domains: {
    main: (typeof window !== 'undefined' && (import.meta as any).env?.VITE_HOME_URL) || 'http://localhost:5173',
    reelcv: (typeof window !== 'undefined' && (import.meta as any).env?.VITE_REELCV_URL) || 'http://localhost:5174',
    reelhunter: (typeof window !== 'undefined' && (import.meta as any).env?.VITE_REELHUNTER_URL) || 'http://localhost:5175',
    reelpersona: (typeof window !== 'undefined' && (import.meta as any).env?.VITE_REELPERSONA_URL) || 'http://localhost:5176',
    reelskills: (typeof window !== 'undefined' && (import.meta as any).env?.VITE_REELSKILLS_URL) || 'http://localhost:5177',
    reelproject: (typeof window !== 'undefined' && (import.meta as any).env?.VITE_REELPROJECT_URL) || 'http://localhost:5178',
  },
  
  // Session options
  sessionOptions: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // We'll handle this manually
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: SHARED_SESSION_KEY,
    flowType: 'pkce' as const,
  },
  
  // Session timeout (in seconds) - how long a session stays active in DB
  sessionTimeout: 60 * 60 * 24 * 7, // 7 days
};

// Get current domain type
export function getCurrentDomainType(): string | null {
  if (typeof window === 'undefined') return null;
  
  const currentOrigin = window.location.origin;
  
  for (const [key, domain] of Object.entries(AUTH_CONFIG.domains)) {
    if (currentOrigin === domain) {
      return key;
    }
  }
  
  return null;
}

// Check if user has active session in database
export const checkDatabaseSession = async (supabase: SupabaseClient<any>): Promise<any> => {
  try {
    console.log('🔍 SHARED AUTH: Checking database for active session...');
    
    // First try to get current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ SHARED AUTH: Error getting current session:', error.message);
      return null;
    }
    
    if (session?.user) {
      console.log('✅ SHARED AUTH: Found Supabase session for user:', session.user.id);
      
      // Validate session against database - this is the source of truth
      const { data: dbSession, error: dbError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (dbError || !dbSession || !dbSession.is_active || new Date(dbSession.expires_at) < new Date()) {
        console.log('⚠️ SHARED AUTH: Session is not valid in database, signing out...');
        // If session is not valid in the database, sign the user out
        await supabase.auth.signOut();
        localStorage.removeItem(SHARED_SESSION_KEY);
        return null;
      }

      console.log('✅ SHARED AUTH: Session validated against database successfully');
      // If session is valid, update last_activity
      await updateSessionActivity(supabase, session.user.id);
      
      return session;
    }
    
    // No current session, check if we have stored session data
    const storedSession = localStorage.getItem(SHARED_SESSION_KEY);
    
    if (storedSession) {
      console.log('🔄 SHARED AUTH: Found stored session, attempting to restore...');
      const sessionData = JSON.parse(storedSession);
      
      // Check if stored session is still valid
      if (sessionData.expires_at && sessionData.expires_at > Date.now() / 1000) {
        try {
          const { data, error: setError } = await supabase.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token,
          });
          
          if (!setError && data.session?.user) {
            const session = data.session;
            // Validate restored session against database
            const { data: dbSession, error: dbError } = await supabase
              .from('user_sessions')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (dbError || !dbSession || !dbSession.is_active || new Date(dbSession.expires_at) < new Date()) {
              console.log('⚠️ SHARED AUTH: Restored session is not valid in database');
              await supabase.auth.signOut();
              localStorage.removeItem(SHARED_SESSION_KEY);
              return null;
            }

            console.log('✅ SHARED AUTH: Successfully restored and validated session from storage');
            // Update session activity in database
            await updateSessionActivity(supabase, session.user.id);
            
            return session;
          } else {
            console.log('❌ SHARED AUTH: Failed to restore stored session:', setError?.message);
            localStorage.removeItem(SHARED_SESSION_KEY);
          }
        } catch (restoreError) {
          console.log('❌ SHARED AUTH: Error restoring stored session:', restoreError);
          localStorage.removeItem(SHARED_SESSION_KEY);
        }
      } else {
        console.log('⏰ SHARED AUTH: Stored session is expired, clearing...');
        localStorage.removeItem(SHARED_SESSION_KEY);
      }
    }
    
    console.log('📭 SHARED AUTH: No active session found');
    return null;
    
  } catch (error) {
    console.error('❌ SHARED AUTH: Error checking database session:', error);
    return null;
  }
};

// Update session activity in database (creates or updates session record)
const updateSessionActivity = async (supabase: SupabaseClient<any>, userId: string) => {
  try {
    console.log('📝 SHARED AUTH: Updating session activity for user:', userId);
    
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + AUTH_CONFIG.sessionTimeout * 1000).toISOString();
    
    // Use upsert to handle both insert and update atomically, preventing race conditions.
    const { error: upsertError } = await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        last_activity: now,
        expires_at: expiresAt,
        is_active: true,
        updated_at: now,
      }, {
        onConflict: 'user_id', // Specify the column that has the unique constraint
      });
    
    if (upsertError) {
      console.log('⚠️ SHARED AUTH: Could not upsert session activity:', upsertError.message);
    } else {
      console.log('✅ SHARED AUTH: Session activity upserted successfully');
    }
  } catch (error) {
    console.log('⚠️ SHARED AUTH: Error updating session activity:', error);
    // Don't throw error - this is not critical for auth flow
  }
};

// Check if user should be redirected to main app for authentication
export const shouldRedirectToMainApp = async (supabase: SupabaseClient<any>): Promise<boolean> => {
  const currentDomain = getCurrentDomainType();
  
  // If we're already on the main app, no need to redirect
  if (currentDomain === 'main') {
    return false;
  }
  
  // Check if user has active session
  const session = await checkDatabaseSession(supabase);
  
  if (!session) {
    console.log('🔄 SHARED AUTH: No active session found, should redirect to main app');
    return true;
  }
  
  console.log('✅ SHARED AUTH: Active session found, no redirect needed');
  return false;
};

// Redirect to main app for authentication
export const redirectToMainApp = () => {
  const mainAppUrl = AUTH_CONFIG.domains.main;
  const currentUrl = window.location.href;
  
  console.log('🔄 SHARED AUTH: Redirecting to main app for authentication...');
  
  // Add return URL so main app can redirect back after auth
  const returnUrl = encodeURIComponent(currentUrl);
  const redirectUrl = `${mainAppUrl}?return_to=${returnUrl}`;
  
  window.location.href = redirectUrl;
};

// Handle return from main app after authentication
export const handleReturnFromMainApp = () => {
  if (typeof window === 'undefined') return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('return_to');
  
  // Only handle return redirect if we're NOT on the main app
  const currentDomain = getCurrentDomainType();
  
  if (returnTo && currentDomain !== 'main') {
    console.log('🔄 SHARED AUTH: Handling return from main app, redirecting to:', returnTo);
    
    // Clean the URL first
    const newUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, document.title, newUrl);
    
    // Redirect to the original destination
    window.location.href = decodeURIComponent(returnTo);
  }
};

// Handle return redirect after successful authentication on main app
export const handleMainAppReturn = async (supabase: SupabaseClient<any>): Promise<string | null> => {
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('return_to');
  
  if (returnTo) {
    console.log(`🔄 SHARED AUTH: Main app received return_to parameter: ${returnTo}`);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      console.log(`✅ SHARED AUTH: User is authenticated, preparing to redirect back to: ${returnTo}`);
      
      await updateSessionActivity(supabase, session.user.id);
      
      const { data: { session: newSession } } = await supabase.auth.getSession();

      if (newSession) {
        const redirectUrl = new URL(decodeURIComponent(returnTo));
        const hashParams = new URLSearchParams();
        hashParams.set('access_token', newSession.access_token);
        hashParams.set('refresh_token', newSession.refresh_token);
        if (newSession.expires_in) {
            hashParams.set('expires_in', newSession.expires_in.toString());
        }
        
        redirectUrl.hash = hashParams.toString();
        
        console.log(`🚀 SHARED AUTH: Returning redirect URL with session hash: ${redirectUrl.toString()}`);
        return redirectUrl.toString();
      }
    } else {
      console.log('📋 SHARED AUTH: Waiting for user authentication to redirect back');
    }
  } else {
    console.log('📋 SHARED AUTH: No return_to parameter found, no redirect.');
  }

  return null;
};

// Launch app with database-based authentication check
export const launchAppWithAuth = async (appUrl: string) => {
  try {
    console.log('🚀 SHARED AUTH: Launching app with database auth check:', appUrl);
    
    // Simply open the app - it will handle its own auth check
    window.open(appUrl, '_blank');
    
  } catch (error) {
    console.error('❌ SHARED AUTH: Error launching app:', error);
    window.open(appUrl, '_blank');
  }
};

// Helper to sync session across apps (stores locally and updates database)
export const syncSessionAcrossApps = async (supabase: SupabaseClient<any>) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('🔄 SHARED AUTH: Syncing session to local storage and database');
      const sessionData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: session.user,
        synced_at: Date.now(),
      };
      
      localStorage.setItem(SHARED_SESSION_KEY, JSON.stringify(sessionData));
      
      // Update session activity in database
      await updateSessionActivity(supabase, session.user.id);
      
      console.log('✅ SHARED AUTH: Session synced to local storage and database');
    } else {
      console.log('🔄 SHARED AUTH: No session to sync, clearing local storage');
      localStorage.removeItem(SHARED_SESSION_KEY);
      
      // Mark session as inactive in database if we have user info
      const storedSession = localStorage.getItem(SHARED_SESSION_KEY);
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.user?.id) {
            await markSessionInactive(supabase, sessionData.user.id);
          }
        } catch (error) {
          console.log('⚠️ SHARED AUTH: Error parsing stored session for cleanup:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ SHARED AUTH: Failed to sync session:', error);
  }
};

// Mark session as inactive in database
const markSessionInactive = async (supabase: SupabaseClient<any>, userId: string) => {
  try {
    console.log('🚪 SHARED AUTH: Marking session as inactive for user:', userId);
    
    const { error } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId);
    
    if (error) {
      console.log('⚠️ SHARED AUTH: Could not mark session as inactive:', error.message);
    } else {
      console.log('✅ SHARED AUTH: Session marked as inactive');
    }
  } catch (error) {
    console.log('⚠️ SHARED AUTH: Error marking session as inactive:', error);
  }
};

// Restore shared session with database validation
export const restoreSharedSession = async (supabase: SupabaseClient<any>) => {
  try {
    console.log('🔄 SHARED AUTH: Starting database-based session restoration...');
    
    // Use the database session check
    const session = await checkDatabaseSession(supabase);
    
    if (session) {
      console.log('✅ SHARED AUTH: Session restored successfully from database');
      return session;
    }
    
    console.log('📭 SHARED AUTH: No valid session found in database');
    return null;
    
  } catch (error) {
    console.error('❌ SHARED AUTH: Failed to restore shared session:', error);
    // Clear potentially corrupted session data
    localStorage.removeItem(SHARED_SESSION_KEY);
    return null;
  }
};

// Setup cross-app auth listener (database-based)
export const setupCrossAppAuthListener = (supabase: SupabaseClient<any>) => {
  console.log('📡 SHARED AUTH: Setting up database-based auth listener...');
  
  // Set up Supabase auth state change listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 SHARED AUTH: Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session) {
      console.log('✅ SHARED AUTH: User signed in, syncing session');
      await syncSessionAcrossApps(supabase);
    } else if (event === 'SIGNED_OUT') {
      console.log('🚪 SHARED AUTH: User signed out, clearing session');
      localStorage.removeItem(SHARED_SESSION_KEY);
      
      // Mark session as inactive in database
      const storedSession = localStorage.getItem(SHARED_SESSION_KEY);
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.user?.id) {
            await markSessionInactive(supabase, sessionData.user.id);
          }
        } catch (error) {
          console.log('⚠️ SHARED AUTH: Error cleaning up session on signout:', error);
        }
      }
    } else if (event === 'TOKEN_REFRESHED' && session) {
      console.log('🔄 SHARED AUTH: Token refreshed, updating session');
      await syncSessionAcrossApps(supabase);
    }
  });
  
  console.log('✅ SHARED AUTH: Database-based auth listener setup complete');
};

// Request current session from database
export const requestSessionFromOtherApps = async () => {
  console.log('📞 SHARED AUTH: Database-based session sharing - checking local storage...');
  
  try {
    const sessionData = localStorage.getItem(SHARED_SESSION_KEY);
    
    if (sessionData) {
      const session = JSON.parse(sessionData);
      
      // Check if session is still valid
      if (session.expires_at && session.expires_at > Date.now() / 1000) {
        console.log('✅ SHARED AUTH: Found valid session in local storage');
        return session;
      } else {
        console.log('⏰ SHARED AUTH: Session in local storage is expired');
        localStorage.removeItem(SHARED_SESSION_KEY);
      }
    } else {
      console.log('📭 SHARED AUTH: No session found in local storage');
    }
    
    return null;
  } catch (error) {
    console.error('❌ SHARED AUTH: Error checking local storage:', error);
    return null;
  }
};
// Shared authentication configuration for ReelApps ecosystem

import { SupabaseClient } from '@supabase/supabase-js';

// Shared session storage key across all apps
export const SHARED_SESSION_KEY = 'reelapps-shared-auth';

// Domain configuration for session sharing
export const AUTH_CONFIG = {
  // Use the main domain for session sharing
  cookieDomain: process.env.NODE_ENV === 'production' 
    ? '.reelapps.co.za' // This allows sharing across all subdomains
    : 'localhost',
  
  // Session options
  sessionOptions: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: SHARED_SESSION_KEY,
    flowType: 'pkce' as const,
  },
  
  // Cookie options for cross-domain auth
  cookieOptions: {
    domain: process.env.NODE_ENV === 'production' ? '.reelapps.co.za' : undefined,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }
};

// Helper to sync session across apps
export const syncSessionAcrossApps = async (supabase: SupabaseClient<any>) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Store session in shared storage
      localStorage.setItem(SHARED_SESSION_KEY, JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: session.user,
      }));
      
      // Broadcast session to other tabs/windows
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const channel = new BroadcastChannel('reelapps-auth-sync');
        channel.postMessage({ type: 'session-update', session });
        channel.close();
      }
    }
  } catch (error) {
    console.error('Failed to sync session:', error);
  }
};

// Helper to restore session from shared storage
export const restoreSharedSession = async (supabase: SupabaseClient<any>) => {
  try {
    const storedSession = localStorage.getItem(SHARED_SESSION_KEY);
    
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      
      // Check if session is still valid
      if (sessionData.expires_at && new Date(sessionData.expires_at * 1000) > new Date()) {
        // Set the session in Supabase
        const { data, error } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        });
        
        if (!error && data.session) {
          return data.session;
        }
      }
    }
  } catch (error) {
    console.error('Failed to restore shared session:', error);
  }
  
  return null;
};

// Listen for auth changes across apps
export const setupCrossAppAuthListener = (supabase: SupabaseClient<any>) => {
  if (typeof window === 'undefined' || !window.BroadcastChannel) return;
  
  const channel = new BroadcastChannel('reelapps-auth-sync');
  
  channel.onmessage = async (event) => {
    if (event.data.type === 'session-update' && event.data.session) {
      // Another app updated the session, sync it
      try {
        await supabase.auth.setSession({
          access_token: event.data.session.access_token,
          refresh_token: event.data.session.refresh_token,
        });
      } catch (error) {
        console.error('Failed to sync session from broadcast:', error);
      }
    } else if (event.data.type === 'logout') {
      // Another app logged out, clear local session
      await supabase.auth.signOut();
    }
  };
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    channel.close();
  });
  
  return channel;
}; 
// Main auth package exports
export { useAuthStore } from './authStore';
export type { Profile } from './authStore';

// Secure authentication utilities
export { 
  secureLogin, 
  securePasswordReset, 
  securePasswordUpdate, 
  validateSessionSecurity 
} from './secureAuth';

// CSRF protection utilities  
export { 
  initializeCSRFProtection,
  getCSRFToken,
  validateCSRFToken,
  clearCSRFProtection,
  CSRFProtectedSupabaseClient,
  withCSRFProtection,
  setupApplicationCSRFProtection
} from './csrfProtection';

// Supabase client and utilities
export { getSupabaseClient, initializeSupabase, testSupabaseConnection, handleSupabaseError } from './supabase';

// Session management utilities
export { 
  syncSessionAcrossApps, 
  restoreSharedSession, 
  handleReturnFromMainApp,
  handleMainAppReturn,
  getCurrentDomainType,
  launchAppWithAuth
} from './shared-auth';

// Session cleanup utilities
export {
  startSessionCleanupService,
  setupVisibilityChangeHandler,
  setupStorageEventHandler,
  validateAndCleanupCurrentSession
} from './sessionCleanup';

// Auth package exports complete
// Higher-order auth protection is handled by @reelapps/ui AppWrapper component

// Auth listener utilities (for backward compatibility)
export { setupAuthListener, startSessionWatcher } from './authStore';
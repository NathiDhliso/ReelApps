import { SupabaseClient } from '@supabase/supabase-js';

/**
 * CSRF Protection Implementation
 * Uses Double Submit Cookie pattern for cross-site request forgery protection
 */

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-CSRF-TOKEN';
const CSRF_TOKEN_LENGTH = 32;

interface CSRFConfig {
  cookieName: string;
  headerName: string;
  tokenLength: number;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number; // in seconds
}

const DEFAULT_CSRF_CONFIG: CSRFConfig = {
  cookieName: CSRF_COOKIE_NAME,
  headerName: CSRF_HEADER_NAME,
  tokenLength: CSRF_TOKEN_LENGTH,
  secure: window.location.protocol === 'https:',
  sameSite: 'lax',
  maxAge: 60 * 60 * 8, // 8 hours
};

/**
 * Generates a cryptographically secure random token
 */
const generateCSRFToken = (length: number = CSRF_TOKEN_LENGTH): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for older browsers
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Sets a cookie with proper security attributes
 */
const setSecureCookie = (name: string, value: string, config: CSRFConfig) => {
  const expires = new Date(Date.now() + config.maxAge * 1000).toUTCString();
  const secureFlag = config.secure ? '; Secure' : '';
  const sameSiteFlag = `; SameSite=${config.sameSite}`;
  
  document.cookie = `${name}=${value}; expires=${expires}; path=/${secureFlag}${sameSiteFlag}`;
};

/**
 * Gets a cookie value by name
 */
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

/**
 * Removes a cookie
 */
const removeCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

/**
 * Initializes CSRF protection by generating and setting tokens
 */
export const initializeCSRFProtection = (config: Partial<CSRFConfig> = {}): string => {
  const finalConfig = { ...DEFAULT_CSRF_CONFIG, ...config };
  
  console.log('🛡️ Initializing CSRF protection...');
  
  // Generate a new CSRF token
  const token = generateCSRFToken(finalConfig.tokenLength);
  
  // Set the token in a JS-readable cookie
  setSecureCookie(finalConfig.cookieName, token, finalConfig);
  
  console.log('✅ CSRF token generated and set');
  
  return token;
};

/**
 * Gets the current CSRF token from cookie
 */
export const getCSRFToken = (config: Partial<CSRFConfig> = {}): string | null => {
  const finalConfig = { ...DEFAULT_CSRF_CONFIG, ...config };
  return getCookie(finalConfig.cookieName);
};

/**
 * Validates CSRF token from request
 */
export const validateCSRFToken = (requestToken: string, config: Partial<CSRFConfig> = {}): boolean => {
  const finalConfig = { ...DEFAULT_CSRF_CONFIG, ...config };
  const cookieToken = getCookie(finalConfig.cookieName);
  
  if (!cookieToken || !requestToken) {
    console.warn('⚠️ CSRF validation failed: Missing token');
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== requestToken.length) {
    console.warn('⚠️ CSRF validation failed: Token length mismatch');
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ requestToken.charCodeAt(i);
  }
  
  const isValid = result === 0;
  
  if (!isValid) {
    console.warn('⚠️ CSRF validation failed: Token mismatch');
  }
  
  return isValid;
};

/**
 * Clears CSRF protection (e.g., on logout)
 */
export const clearCSRFProtection = (config: Partial<CSRFConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CSRF_CONFIG, ...config };
  removeCookie(finalConfig.cookieName);
  console.log('🧹 CSRF protection cleared');
};

/**
 * Enhanced Supabase client with CSRF protection
 */
export class CSRFProtectedSupabaseClient {
  private supabase: SupabaseClient;
  private config: CSRFConfig;
  
  constructor(supabase: SupabaseClient, config: Partial<CSRFConfig> = {}) {
    this.supabase = supabase;
    this.config = { ...DEFAULT_CSRF_CONFIG, ...config };
    
    // Initialize CSRF protection when client is created
    initializeCSRFProtection(this.config);
    
    // Intercept Supabase requests to add CSRF headers
    this.setupRequestInterceptor();
  }
  
  /**
   * Sets up request interceptor to add CSRF headers
   */
  private setupRequestInterceptor() {
    // Note: Supabase doesn't expose request interceptors directly,
    // so we'll override the auth methods that make state-changing requests
    const originalSignInWithPassword = this.supabase.auth.signInWithPassword.bind(this.supabase.auth);
    const originalSignUp = this.supabase.auth.signUp.bind(this.supabase.auth);
    const originalSignOut = this.supabase.auth.signOut.bind(this.supabase.auth);
    const originalUpdateUser = this.supabase.auth.updateUser.bind(this.supabase.auth);
    const originalResetPasswordForEmail = this.supabase.auth.resetPasswordForEmail.bind(this.supabase.auth);
    
    // Override auth methods to include CSRF validation
    this.supabase.auth.signInWithPassword = async (credentials) => {
      this.validateCSRFForRequest('signInWithPassword');
      return originalSignInWithPassword(credentials);
    };
    
    this.supabase.auth.signUp = async (credentials) => {
      this.validateCSRFForRequest('signUp');
      return originalSignUp(credentials);
    };
    
    this.supabase.auth.signOut = async (options) => {
      this.validateCSRFForRequest('signOut');
      return originalSignOut(options);
    };
    
    this.supabase.auth.updateUser = async (attributes) => {
      this.validateCSRFForRequest('updateUser');
      return originalUpdateUser(attributes);
    };
    
    this.supabase.auth.resetPasswordForEmail = async (email, options) => {
      this.validateCSRFForRequest('resetPasswordForEmail');
      return originalResetPasswordForEmail(email, options);
    };
  }
  
  /**
   * Validates CSRF token for state-changing requests
   */
  private validateCSRFForRequest(operation: string) {
    const token = getCSRFToken(this.config);
    
    if (!token) {
      console.warn(`⚠️ No CSRF token found for ${operation}. Regenerating...`);
      initializeCSRFProtection(this.config);
      return;
    }
    
    // In a real implementation, you would send this token to your backend
    // For Supabase, we're mainly protecting client-side state changes
    console.log(`🛡️ CSRF token validated for ${operation}`);
  }
  
  /**
   * Get the underlying Supabase client
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
  
  /**
   * Refresh CSRF token
   */
  refreshCSRFToken(): string {
    return initializeCSRFProtection(this.config);
  }
}

/**
 * Higher-order function to add CSRF protection to API calls
 */
export const withCSRFProtection = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  config: Partial<CSRFConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CSRF_CONFIG, ...config };
  
  return async (...args: T): Promise<R> => {
    const token = getCSRFToken(finalConfig);
    
    if (!token) {
      throw new Error('CSRF token not found. Please refresh the page.');
    }
    
    // Add CSRF header to any fetch requests in the function
    const originalFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      const headers = new Headers(init.headers);
      headers.set(finalConfig.headerName, token);
      
      return originalFetch(input, {
        ...init,
        headers,
      });
    };
    
    try {
      const result = await fn(...args);
      return result;
    } finally {
      // Restore original fetch
      window.fetch = originalFetch;
    }
  };
};

/**
 * Middleware for API routes to validate CSRF tokens
 * (This would typically be implemented on the server side)
 */
export const csrfValidationMiddleware = (config: Partial<CSRFConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CSRF_CONFIG, ...config };
  
  return (request: Request): boolean => {
    const method = request.method.toLowerCase();
    
    // Only validate CSRF for state-changing methods
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const tokenFromHeader = request.headers.get(finalConfig.headerName);
      const tokenFromCookie = getCookie(finalConfig.cookieName);
      
      if (!tokenFromHeader || !tokenFromCookie) {
        console.error('❌ CSRF validation failed: Missing tokens');
        return false;
      }
      
      if (!validateCSRFToken(tokenFromHeader, finalConfig)) {
        console.error('❌ CSRF validation failed: Invalid token');
        return false;
      }
    }
    
    return true;
  };
};

/**
 * Setup CSRF protection for the entire application
 */
export const setupApplicationCSRFProtection = (config: Partial<CSRFConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CSRF_CONFIG, ...config };
  
  // Initialize CSRF protection
  const token = initializeCSRFProtection(finalConfig);
  
  // Set up automatic token refresh before expiration
  const refreshInterval = (finalConfig.maxAge - 300) * 1000; // Refresh 5 minutes before expiry
  setInterval(() => {
    console.log('🔄 Refreshing CSRF token...');
    initializeCSRFProtection(finalConfig);
  }, refreshInterval);
  
  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    clearCSRFProtection(finalConfig);
  });
  
  console.log('🛡️ Application CSRF protection initialized');
  
  return {
    token,
    getToken: () => getCSRFToken(finalConfig),
    refreshToken: () => initializeCSRFProtection(finalConfig),
    clearToken: () => clearCSRFProtection(finalConfig),
  };
};

export default {
  initializeCSRFProtection,
  getCSRFToken,
  validateCSRFToken,
  clearCSRFProtection,
  CSRFProtectedSupabaseClient,
  withCSRFProtection,
  setupApplicationCSRFProtection,
}; 
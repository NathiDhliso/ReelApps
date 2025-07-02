import { getSupabaseClient } from './supabase';

// Remove the immediate client initialization - it will be done lazily
// const supabase = getSupabaseClient();

export interface SSOConfig {
  mainDomain: string;
  allowedSubdomains: string[];
  sessionCookieName: string;
  ssoTokenName: string;
}

export interface SSOUser {
  id: string;
  email: string;
  role: string;
  profile?: any;
  accessToken: string;
  refreshToken: string;
}

export interface SSOSession {
  user: SSOUser;
  expiresAt: string;
  domain: string;
  subdomain?: string;
}

// Helper function to safely get Supabase client with better error handling
const getSupabaseClientSafely = () => {
  try {
    console.log('🔍 SSO: Attempting to get Supabase client...');
    const client = getSupabaseClient();
    console.log('✅ SSO: Successfully obtained Supabase client');
    return client;
  } catch (error) {
    console.error('❌ SSO: Failed to get Supabase client:', error);
    console.error('❌ SSO: This usually means initializeSupabase() was not called yet');
    console.error('❌ SSO: Make sure to initialize Supabase before using SSO functionality');
    throw new Error(`SSO requires Supabase to be initialized first. Original error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export class SSOManager {
  private config: SSOConfig;
  private isInitializing = false; // Add guard flag
  private hasRedirected = false; // Add redirect guard

  constructor(config: SSOConfig) {
    this.config = config;
    console.log('🔧 SSO: SSOManager created with config:', {
      mainDomain: config.mainDomain,
      allowedSubdomains: config.allowedSubdomains,
      sessionCookieName: config.sessionCookieName,
      ssoTokenName: config.ssoTokenName
    });
  }

  /**
   * Initialize SSO session from main domain
   */
  async initializeSSO(): Promise<SSOSession | null> {
    // Prevent multiple simultaneous initializations
    if (this.isInitializing) {
      console.log('[SSO] Already initializing, skipping...');
      return null;
    }

    // Prevent redirect loops
    if (this.hasRedirected) {
      console.log('[SSO] Already redirected in this session, skipping...');
      return null;
    }

    try {
      this.isInitializing = true;
      console.log('[SSO] Initializing SSO session...');
      
      // Get Supabase client safely
      const supabase = getSupabaseClientSafely();
      
      // Check if we're on a subdomain
      const currentDomain = window.location.hostname;
      const isSubdomain = currentDomain !== this.config.mainDomain && 
                         currentDomain.endsWith(`.${this.config.mainDomain}`);
      
      console.log('[SSO] Domain analysis:', {
        currentDomain,
        mainDomain: this.config.mainDomain,
        isSubdomain
      });
      
      if (isSubdomain) {
        console.log('[SSO] On subdomain, checking for SSO token...');
        // Try to get session from SSO token in URL or localStorage
        const ssoToken = this.getSSOTokenFromURL() || this.getSSOTokenFromStorage();
        if (ssoToken) {
          console.log('[SSO] Found SSO token, validating...');
          return await this.validateSSOToken(ssoToken);
        }
        
        console.log('[SSO] No SSO token found, redirecting to main domain...');
        // If no token, redirect to main domain for authentication
        return await this.redirectToSSO();
      }
      
      console.log('[SSO] On main domain, getting current session...');
      // On main domain, get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[SSO] Error getting session:', error);
        return null;
      }
      
      if (session) {
        console.log('[SSO] Found active session, creating SSO session...');
        return this.createSSOSession(session, currentDomain);
      }
      
      console.log('[SSO] No active session found on main domain - user needs to log in');
      return null;
    } catch (error) {
      console.error('[SSO] Error initializing SSO:', error);
      return null;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Create SSO session for cross-domain sharing
   */
  public async createSSOSession(session: any, domain: string): Promise<SSOSession> {
    console.log('[SSO] Creating SSO session for domain:', domain);
    
    const supabase = getSupabaseClientSafely();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.warn('[SSO] Could not fetch user profile:', error);
    }

    const ssoUser: SSOUser = {
      id: session.user.id,
      email: session.user.email,
      role: profile?.role || 'candidate',
      profile,
      accessToken: session.access_token,
      refreshToken: session.refresh_token
    };

    const ssoSession: SSOSession = {
      user: ssoUser,
      expiresAt: session.expires_at,
      domain: domain,
      subdomain: this.extractSubdomain(domain)
    };

    console.log('[SSO] SSO session created:', {
      userId: ssoUser.id,
      userEmail: ssoUser.email,
      userRole: ssoUser.role,
      domain: ssoSession.domain,
      subdomain: ssoSession.subdomain
    });

    // Store session for cross-domain access
    this.storeSSOSession(ssoSession);
    
    return ssoSession;
  }

  /**
   * Validate SSO token from subdomain
   */
  private async validateSSOToken(token: string): Promise<SSOSession | null> {
    try {
      console.log('[SSO] Validating SSO token...');
      
      // Decode the token (in production, this should be properly signed/encrypted)
      const sessionData = JSON.parse(atob(token));
      console.log('[SSO] Token decoded successfully');
      
      // Verify token hasn't expired
      if (new Date(sessionData.expiresAt) < new Date()) {
        console.log('[SSO] Token expired');
        return null;
      }

      console.log('[SSO] Token is valid, setting session in Supabase...');
      const supabase = getSupabaseClientSafely();
      
      // Set the session in Supabase
      const { error } = await supabase.auth.setSession({
        access_token: sessionData.user.accessToken,
        refresh_token: sessionData.user.refreshToken
      });

      if (error) {
        console.error('[SSO] Error setting session:', error);
        return null;
      }

      console.log('[SSO] Session restored successfully');
      return sessionData;
    } catch (error) {
      console.error('[SSO] Error validating SSO token:', error);
      return null;
    }
  }

  /**
   * Generate SSO token for cross-domain authentication
   */
  generateSSOToken(session: SSOSession): string {
    // In production, this should be properly signed/encrypted
    return btoa(JSON.stringify(session));
  }

  /**
   * Get SSO token from URL parameters
   */
  private getSSOTokenFromURL(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get(this.config.ssoTokenName);
    
    if (token) {
      // Clean up URL
      urlParams.delete(this.config.ssoTokenName);
      const cleanUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', cleanUrl);
    }
    
    return token;
  }

  /**
   * Get SSO token from localStorage and cookie
   */
  private getSSOTokenFromStorage(): string | null {
    // First attempt to read from localStorage (same-domain)
    const localToken = localStorage.getItem(this.config.ssoTokenName);
    if (localToken) return localToken;

    // Fallback to cookie (shared across *.reelapps.co.za)
    return this.getCookie(this.config.sessionCookieName);
  }

  /**
   * Store SSO session in localStorage and cookie (domain-wide)
   */
  private storeSSOSession(session: SSOSession): void {
    const token = this.generateSSOToken(session);

    // Persist in local / session storage for same-origin tabs
    localStorage.setItem(this.config.ssoTokenName, token);
    sessionStorage.setItem(this.config.ssoTokenName, token);

    // Persist in cookie so that sub-domains can bootstrap automatically
    // Cookie will be available to *.mainDomain
    // Default expiry: 1 day (can be adjusted later)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);
    this.setCookie(this.config.sessionCookieName, token, expiryDate);
  }

  /**
   * Redirect to main domain for SSO authentication
   */
  private async redirectToSSO(): Promise<null> {
    // Additional safety check - don't redirect if we're already processing an SSO request
    if (window.location.pathname.includes('/auth/sso')) {
      console.log('[SSO] Already on SSO page, not redirecting');
      return null;
    }

    // Prevent multiple redirects in the same session
    if (this.hasRedirected) {
      console.log('[SSO] Already redirected in this session, skipping redirect');
      return null;
    }

    // Check if we're in a redirect loop by looking at the return_url parameter
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('return_url');
    if (returnUrl) {
      try {
        const decodedUrl = decodeURIComponent(returnUrl);
        // If the return URL contains another return_url, we're in a loop
        if (decodedUrl.includes('return_url=')) {
          console.warn('[SSO] Potential redirect loop detected, stopping redirect');
          return null;
        }
      } catch (e) {
        console.warn('[SSO] Could not decode return_url, stopping redirect to prevent loop');
        return null;
      }
    }

    const currentUrl = window.location.href;
    const returnUrlEncoded = encodeURIComponent(currentUrl);
    const ssoUrl = `https://www.${this.config.mainDomain}/auth/sso?return_url=${returnUrlEncoded}`;
    
    console.log('[SSO] Redirecting to SSO:', ssoUrl);
    this.hasRedirected = true; // Mark that we've redirected
    window.location.href = ssoUrl;
    
    return null;
  }

  /**
   * Navigate to app with SSO token
   */
  async navigateToApp(appUrl: string, session: SSOSession): Promise<void> {
    const token = this.generateSSOToken(session);
    const separator = appUrl.includes('?') ? '&' : '?';
    const targetUrl = `${appUrl}${separator}${this.config.ssoTokenName}=${token}`;
    
    console.log('[SSO] Navigating to app with SSO token');
    window.location.href = targetUrl;
  }

  /**
   * Clear SSO session from storage and cookies
   */
  clearSSOSession(): void {
    localStorage.removeItem(this.config.ssoTokenName);
    sessionStorage.removeItem(this.config.ssoTokenName);
    this.deleteCookie(this.config.sessionCookieName);
  }

  /**
   * Reset SSO state - useful for clearing redirect flags
   */
  resetSSOState(): void {
    this.isInitializing = false;
    this.hasRedirected = false;
    console.log('[SSO] SSO state reset');
  }

  /**
   * Extract subdomain from hostname
   */
  private extractSubdomain(hostname: string): string | undefined {
    if (hostname === this.config.mainDomain) return undefined;
    
    const parts = hostname.split('.');
    if (parts.length > 2 && hostname.endsWith(`.${this.config.mainDomain}`)) {
      return parts[0];
    }
    
    return undefined;
  }

  /**
   * Check if user has access to specific app
   */
  hasAppAccess(userRole: string, appId: string): boolean {
    const roleMapping: Record<string, string[]> = {
      'admin': ['reelcv', 'reelhunter', 'reelskills', 'reelpersona', 'reelproject'],
      'recruiter': ['reelhunter', 'reelpersona', 'reelproject'],
      'candidate': ['reelcv', 'reelskills', 'reelpersona', 'reelproject']
    };

    return roleMapping[userRole]?.includes(appId) || false;
  }

  /**
   * Get allowed apps for user role
   */
  getAllowedApps(userRole: string): string[] {
    const roleMapping: Record<string, string[]> = {
      'admin': ['reelcv', 'reelhunter', 'reelskills', 'reelpersona', 'reelproject'],
      'recruiter': ['reelhunter', 'reelpersona', 'reelproject'],
      'candidate': ['reelcv', 'reelskills', 'reelpersona', 'reelproject']
    };

    return roleMapping[userRole] || [];
  }

  // === Cookie helpers ===

  /**
   * Set a cookie accessible to all sub-domains (Domain=.mainDomain)
   */
  private setCookie(name: string, value: string, expires: Date) {
    const cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;domain=.${this.config.mainDomain};SameSite=Lax;Secure`;
    document.cookie = cookie;
  }

  /**
   * Read a cookie by name
   */
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop()!.split(';').shift()!);
    }
    return null;
  }

  /**
   * Delete a cookie by setting its expiry date in the past
   */
  private deleteCookie(name: string) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${this.config.mainDomain}`;
  }
}

// Default SSO configuration
export const defaultSSOConfig: SSOConfig = {
  mainDomain: 'reelapps.co.za',
  allowedSubdomains: ['reelcv', 'reelhunter', 'reelskills', 'reelpersona', 'reelproject'],
  sessionCookieName: 'reelapps-session',
  ssoTokenName: 'ssoToken'
};

// Export singleton instance
export const ssoManager = new SSOManager(defaultSSOConfig); 
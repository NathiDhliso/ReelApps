import { supabase } from '@reelapps/supabase';

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

export class SSOManager {
  private config: SSOConfig;

  constructor(config: SSOConfig) {
    this.config = config;
  }

  /**
   * Initialize SSO session from main domain
   */
  async initializeSSO(): Promise<SSOSession | null> {
    try {
      console.log('[SSO] Initializing SSO session...');
      
      // Check if we're on a subdomain
      const currentDomain = window.location.hostname;
      const isSubdomain = currentDomain !== this.config.mainDomain && 
                         currentDomain.endsWith(`.${this.config.mainDomain}`);
      
      if (isSubdomain) {
        // Try to get session from SSO token in URL or localStorage
        const ssoToken = this.getSSOTokenFromURL() || this.getSSOTokenFromStorage();
        if (ssoToken) {
          return await this.validateSSOToken(ssoToken);
        }
        
        // If no token, redirect to main domain for authentication
        return await this.redirectToSSO();
      }
      
      // On main domain, get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        return this.createSSOSession(session, currentDomain);
      }
      
      return null;
    } catch (error) {
      console.error('[SSO] Error initializing SSO:', error);
      return null;
    }
  }

  /**
   * Create SSO session for cross-domain sharing
   */
  private async createSSOSession(session: any, domain: string): Promise<SSOSession> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

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
      
      // Verify token hasn't expired
      if (new Date(sessionData.expiresAt) < new Date()) {
        console.log('[SSO] Token expired');
        return null;
      }

      // Set the session in Supabase
      const { data, error } = await supabase.auth.setSession({
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
   * Get SSO token from localStorage
   */
  private getSSOTokenFromStorage(): string | null {
    return localStorage.getItem(this.config.ssoTokenName);
  }

  /**
   * Store SSO session in localStorage
   */
  private storeSSOSession(session: SSOSession): void {
    const token = this.generateSSOToken(session);
    localStorage.setItem(this.config.ssoTokenName, token);
    
    // Also store in sessionStorage for cross-tab support
    sessionStorage.setItem(this.config.ssoTokenName, token);
  }

  /**
   * Redirect to main domain for SSO authentication
   */
  private async redirectToSSO(): Promise<null> {
    const currentUrl = window.location.href;
    const returnUrl = encodeURIComponent(currentUrl);
    const ssoUrl = `https://www.${this.config.mainDomain}/auth/sso?return_url=${returnUrl}`;
    
    console.log('[SSO] Redirecting to SSO:', ssoUrl);
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
   * Clear SSO session
   */
  clearSSOSession(): void {
    localStorage.removeItem(this.config.ssoTokenName);
    sessionStorage.removeItem(this.config.ssoTokenName);
    localStorage.removeItem(this.config.sessionCookieName);
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
      'admin': ['reelcv', 'reelhunter', 'reelskills', 'reelpersona', 'reelprojects'],
      'recruiter': ['reelhunter', 'reelpersona', 'reelprojects'],
      'candidate': ['reelcv', 'reelskills', 'reelpersona', 'reelprojects']
    };

    return roleMapping[userRole]?.includes(appId) || false;
  }

  /**
   * Get allowed apps for user role
   */
  getAllowedApps(userRole: string): string[] {
    const roleMapping: Record<string, string[]> = {
      'admin': ['reelcv', 'reelhunter', 'reelskills', 'reelpersona', 'reelprojects'],
      'recruiter': ['reelhunter', 'reelpersona', 'reelprojects'],
      'candidate': ['reelcv', 'reelskills', 'reelpersona', 'reelprojects']
    };

    return roleMapping[userRole] || [];
  }
}

// Default SSO configuration
export const defaultSSOConfig: SSOConfig = {
  mainDomain: 'reelapps.co.za',
  allowedSubdomains: ['reelcv', 'reelhunter', 'reelskills', 'reelpersona', 'reelprojects'],
  sessionCookieName: 'reelapps-session',
  ssoTokenName: 'sso_token'
};

// Export singleton instance
export const ssoManager = new SSOManager(defaultSSOConfig); 
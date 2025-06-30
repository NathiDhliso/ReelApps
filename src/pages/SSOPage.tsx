import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ssoManager } from '@reelapps/auth';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

const SSOPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, profile, initialize } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = searchParams.get('return_url');

  useEffect(() => {
    const processSSORequest = async () => {
      try {
        console.log('[SSO Page] Processing SSO request...');
        
        // Ensure auth is initialized
        await initialize();

        if (!isAuthenticated) {
          console.log('[SSO Page] User not authenticated, redirecting to login');
          // Store return URL in localStorage for after login
          if (returnUrl) {
            localStorage.setItem('sso_return_url', returnUrl);
          }
          navigate('/auth/login');
          return;
        }

        if (!returnUrl) {
          console.log('[SSO Page] No return URL provided');
          setError('Invalid SSO request: No return URL provided');
          setIsProcessing(false);
          return;
        }

        // Validate the return URL is from an allowed subdomain
        const url = new URL(decodeURIComponent(returnUrl));
        const hostname = url.hostname;
        
        // Check if it's a valid subdomain
        const isValidSubdomain = hostname.endsWith('.reelapps.co.za') && 
                                hostname !== 'www.reelapps.co.za' &&
                                hostname !== 'reelapps.co.za';

        if (!isValidSubdomain) {
          console.log('[SSO Page] Invalid return URL domain:', hostname);
          setError('Invalid return URL: Must be a valid ReelApps subdomain');
          setIsProcessing(false);
          return;
        }

        // Extract subdomain/app name
        const subdomain = hostname.split('.')[0];
        
        // Check if user has access to this app
        if (!ssoManager.hasAppAccess(profile?.role || 'candidate', subdomain)) {
          console.log('[SSO Page] User does not have access to app:', subdomain);
          setError(`You don't have access to ${subdomain}. Contact your administrator if you need access.`);
          setIsProcessing(false);
          return;
        }

        // Create SSO session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError('Failed to get current session');
          setIsProcessing(false);
          return;
        }

        const ssoSession = await ssoManager.createSSOSession(session, hostname);
        
        // Redirect to the app with SSO token
        console.log('[SSO Page] Redirecting to app with SSO token...');
        await ssoManager.navigateToApp(returnUrl, ssoSession);

      } catch (error) {
        console.error('[SSO Page] Error processing SSO request:', error);
        setError('An error occurred while processing your request. Please try again.');
        setIsProcessing(false);
      }
    };

    processSSORequest();
  }, [isAuthenticated, profile, returnUrl, initialize, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="text-xl font-semibold text-text-primary mt-4 mb-2">
            Authenticating...
          </h2>
          <p className="text-text-secondary">
            Securely transferring your session to the requested app.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="bg-surface rounded-lg border border-surface p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Authentication Error
            </h2>
            <p className="text-text-secondary mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                Go to Dashboard
              </button>
              {returnUrl && (
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 border border-surface text-text-secondary rounded-lg hover:bg-surface transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SSOPage; 
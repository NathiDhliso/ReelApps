import React, { useState, useEffect, useRef } from 'react';
import { AuthModal } from './AuthModal';
import './AppWrapper.css';

interface AppWrapperProps {
  children: React.ReactNode;
  // Auth state from authStore
  isAuthenticated: boolean;
  isInitializing: boolean;
  _user: any | null;
  error: string | null;
  // Auth methods from authStore
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, firstName: string, lastName: string, role?: 'candidate' | 'recruiter') => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  isLoading: boolean;
  // Optional: Custom loading component
  loadingComponent?: React.ReactNode;
  // Optional: Callback when auth is required
  onAuthRequired?: (currentPath: string) => void;
}

export function AppWrapper({
  children,
  isAuthenticated,
  isInitializing,
  _user,
  error,
  onLogin,
  onSignup,
  onPasswordReset,
  isLoading,
  loadingComponent,
  onAuthRequired
}: AppWrapperProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [originalPath, setOriginalPath] = useState<string | null>(null);
  const isActiveRef = useRef(true);

  // Handle authentication state changes with cleanup
  useEffect(() => {
    // Reset the active flag on each render
    isActiveRef.current = true;

    // Skip if still initializing
    if (isInitializing) return;

    // Check if authentication is required
    if (!isAuthenticated) {
      // Capture current path for deep link handling
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      setOriginalPath(currentPath);
      
      // Notify parent if callback provided
      if (onAuthRequired) {
        onAuthRequired(currentPath);
      }

      // Show auth modal after a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        if (isActiveRef.current) {
          setShowAuthModal(true);
        }
      }, 100);

      return () => {
        isActiveRef.current = false;
        clearTimeout(timer);
      };
    } else {
      // User is authenticated, hide modal
      setShowAuthModal(false);
      
      // Handle deep link redirect if we have a stored path
      if (originalPath && originalPath !== window.location.pathname) {
        // Use the router if available, otherwise use window.location
        window.history.pushState(null, '', originalPath);
        setOriginalPath(null);
      }
    }
  }, [isAuthenticated, isInitializing, originalPath, onAuthRequired]);

  // Three-state rendering machine
  if (isInitializing) {
    // State 1: Still initializing - show loading state
    return (
      <div className="app-wrapper-loading">
        {loadingComponent || (
          <div className="app-wrapper-spinner">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    // State 2: Not authenticated - show public content with auth modal
    return (
      <div className="app-wrapper-unauthenticated">
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={onLogin}
          onSignup={onSignup}
          onPasswordReset={onPasswordReset}
          isLoading={isLoading}
          error={error}
        />
        <div className="app-wrapper-public-content">
          <h1>Welcome to ReelApps</h1>
          <p>Please sign in to continue</p>
          <button 
            className="app-wrapper-signin-button"
            onClick={() => setShowAuthModal(true)}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // State 3: Authenticated - show protected content
  return (
    <div className="app-wrapper-authenticated">
      {children}
    </div>
  );
} 
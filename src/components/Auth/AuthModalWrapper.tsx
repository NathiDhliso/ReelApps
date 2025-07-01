import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { AuthModal } from './AuthModal';

interface AuthModalWrapperProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  onAuthRequired?: (currentPath: string) => void;
}

export const AuthModalWrapper: React.FC<AuthModalWrapperProps> = ({
  children,
  loadingComponent,
  onAuthRequired
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [originalPath, setOriginalPath] = useState<string | null>(null);
  const isActiveRef = useRef(true);

  // Get auth state and methods from store
  const {
    isAuthenticated,
    isLoading,
    login,
    signup,
    sendPasswordResetEmail
  } = useAuthStore();

  // Handle authentication state changes with cleanup
  useEffect(() => {
    // Reset the active flag on each render
    isActiveRef.current = true;

    // Skip if still initializing
    if (isLoading) return;

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
  }, [isAuthenticated, isLoading, originalPath, onAuthRequired]);

  // Three-state rendering machine
  if (isLoading) {
    // State 1: Still initializing - show loading state
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {loadingComponent || (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading...</p>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    // State 2: Not authenticated - show public content with auth modal
    return (
      <div className="min-h-screen bg-background">
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={login}
          onSignup={signup}
          onPasswordReset={sendPasswordResetEmail}
          isLoading={isLoading}
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-4">Welcome to ReelApps</h1>
            <p className="text-text-secondary mb-8">Please sign in to continue</p>
            <button 
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 3: Authenticated - show protected content
  return <>{children}</>;
}; 
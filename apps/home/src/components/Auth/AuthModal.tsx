import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import { getSupabaseClient, handleMainAppReturn } from '@reelapps/auth';
import { useSystemStore } from '../../store/systemStore';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useSystemStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigate = useNavigate();

  // Sync local mode with system store mode
  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
    }
  }, [isAuthModalOpen, authModalMode]);

  // When user authenticates, hide modal and navigate to return URL or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      closeAuthModal();
      onSuccess?.();
      
      const handleRedirect = async () => {
        const supabase = getSupabaseClient();
        const redirectUrl = await handleMainAppReturn(supabase);
        
        if (redirectUrl) {
          // A redirect URL was returned, so perform the hard redirect.
          window.location.href = redirectUrl;
        } else {
          // No redirect URL, so navigate to the local dashboard.
          navigate('/dashboard');
        }
      };
      
      handleRedirect();
    }
  }, [isAuthenticated, navigate, onSuccess, closeAuthModal]);

  // Don't render if modal should be closed or user is authenticated
  if (!isAuthModalOpen || isAuthenticated) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAuthModal();
    }
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      {mode === 'signup' ? (
        <SignUpForm 
          onSuccess={onSuccess}
          onSwitchToLogin={() => setMode('login')}
        />
      ) : (
        <LoginForm 
          onSuccess={onSuccess}
          onSwitchToSignUp={() => setMode('signup')}
        />
      )}
    </div>
  );
};

export default AuthModal;
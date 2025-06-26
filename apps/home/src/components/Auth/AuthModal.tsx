import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const navigate = useNavigate();

  // When user authenticates, hide modal and navigate to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      // Call any provided success callback first
      onSuccess?.();
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, onSuccess]);

  if (isAuthenticated) {
    return null; // Do not render modal when already authenticated
  }

  if (mode === 'signup') {
    return (
      <SignUpForm 
        onSuccess={onSuccess}
        onSwitchToLogin={() => setMode('login')}
      />
    );
  }

  return (
    <LoginForm 
      onSuccess={onSuccess}
      onSwitchToSignUp={() => setMode('signup')}
    />
  );
};

export default AuthModal;
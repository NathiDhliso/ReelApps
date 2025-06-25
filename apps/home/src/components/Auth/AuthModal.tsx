import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
  onSuccess?: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

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
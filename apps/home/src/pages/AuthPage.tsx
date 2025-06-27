import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import SignUpForm from '../components/Auth/SignUpForm';
import styles from './AuthPage.module.css';

const AuthPage: React.FC = () => {
  const { mode } = useParams<{ mode: 'login' | 'signup' }>();
  const navigate = useNavigate();

  // Redirect to /auth/login if no mode is specified (e.g., user visits /auth)
  React.useEffect(() => {
    if (!mode) {
      navigate('/auth/login', { replace: true });
    }
  }, [mode, navigate]);

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {mode === 'login' ? '' : 'Create Account'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'login' ? '' : 'Join the future of talent acquisition'}
          </p>
        </div>
        
        {mode === 'login' ? (
          <LoginForm 
            onSuccess={handleSuccess}
            onSwitchToSignUp={() => navigate('/auth/signup')}
          />
        ) : (
          <SignUpForm 
            onSuccess={handleSuccess}
            onSwitchToLogin={() => navigate('/auth/login')}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage; 
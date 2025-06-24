import React, { useState } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSystemStore } from '../../store/systemStore';
import Button from '../Button/Button';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');
  const { login, isLoading } = useAuthStore();
  const { addNotification } = useSystemStore();

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      await login(email, password);
      
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully signed in to ReelApps.'
      });

      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
      
      // Handle specific error cases
      if (errorMessage.includes('Invalid login credentials')) {
        setGeneralError('Invalid email or password. Please try again.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setGeneralError('Please confirm your email before signing in.');
      } else {
        setGeneralError(errorMessage);
      }
      
      addNotification({
        type: 'error',
        title: 'Sign In Failed',
        message: errorMessage
      });
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    if (generalError) setGeneralError('');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
    if (generalError) setGeneralError('');
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Users size={24} />
            </div>
            <span className={styles.logoText}>ReelApps</span>
          </div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your ReelApps account</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Enter your email"
            required
          />
          {errors.email && (
            <div className={styles.fieldError}>
              <AlertCircle size={14} />
              {errors.email}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Enter your password"
            required
          />
          {errors.password && (
            <div className={styles.fieldError}>
              <AlertCircle size={14} />
              {errors.password}
            </div>
          )}
        </div>

        {generalError && (
          <div className={styles.error}>
            <AlertCircle size={16} />
            {generalError}
          </div>
        )}

        <Button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        <div className={styles.footer}>
          Don't have an account? 
          <button 
            type="button"
            onClick={onSwitchToSignUp}
            className={styles.link}
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px' }}
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
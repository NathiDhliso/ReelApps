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
  const [isResetView, setIsResetView] = useState(false);
  const { login, sendPasswordResetEmail, isLoading } = useAuthStore();
  const { addNotification } = useSystemStore();

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
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
      await login(email.trim(), password);
      
      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully signed in to your ReelApps account.'
      });

      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      
      // Handle specific error cases with professional messaging
      if (errorMessage.includes('Invalid login credentials') || 
          errorMessage.includes('Invalid email or password') ||
          errorMessage.includes('Authentication failed')) {
        setGeneralError('The email address or password you entered is incorrect. Please verify your credentials and try again.');
      } else if (errorMessage.includes('Email not confirmed') || 
                 errorMessage.includes('email_not_confirmed')) {
        setGeneralError('Please verify your email address before signing in. Check your inbox for a confirmation email.');
      } else if (errorMessage.includes('Too many requests') || 
                 errorMessage.includes('rate limit')) {
        setGeneralError('Too many login attempts. Please wait a few minutes before trying again.');
      } else if (errorMessage.includes('Account locked') || 
                 errorMessage.includes('locked')) {
        setGeneralError('Your account has been temporarily locked for security reasons. Please contact support if this continues.');
      } else if (errorMessage.includes('Network') || 
                 errorMessage.includes('connection')) {
        setGeneralError('Connection issue detected. Please check your internet connection and try again.');
      } else {
        // Generic professional error message for unknown errors
        setGeneralError('We encountered an issue signing you in. Please try again or contact support if the problem persists.');
      }
      
      addNotification({
        type: 'error',
        title: 'Sign In Failed',
        message: generalError || 'Unable to sign in. Please verify your credentials.'
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

  const handlePasswordReset = async () => {
    setGeneralError('');
    if (!email.trim()) {
      setErrors({ email: 'Please enter your email address to reset your password.' });
      return;
    }

    try {
      await sendPasswordResetEmail(email.trim());
      addNotification({
        type: 'success',
        title: 'Password Reset Email Sent',
        message: `We've sent password reset instructions to ${email}. Please check your inbox and follow the link to reset your password.`,
        persistent: true,
      });
      setIsResetView(false); // Go back to login view
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to send reset email';
      
      // Professional error handling for password reset
      if (errorMessage.includes('Rate limit') || errorMessage.includes('too many')) {
        setGeneralError('Too many password reset requests. Please wait before requesting another reset.');
      } else if (errorMessage.includes('Invalid email') || errorMessage.includes('not found')) {
        // Don't reveal if email exists for security, but be helpful
        setGeneralError('If an account exists with this email address, you will receive reset instructions shortly.');
      } else {
        setGeneralError('We encountered an issue sending the reset email. Please try again or contact support.');
      }
      
      addNotification({
        type: 'error',
        title: 'Password Reset Failed',
        message: generalError || 'Unable to send password reset email. Please try again.',
      });
    }
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
          <h1 className={styles.title}>{isResetView ? 'Reset Password' : 'Welcome Back'}</h1>
          <p className={styles.subtitle}>
            {isResetView 
              ? 'Enter your email address to receive password reset instructions.' 
              : 'Sign in to access your ReelApps account'}
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Enter your email address"
            autoComplete="email"
            required
          />
          {errors.email && (
            <div className={styles.fieldError}>
              <AlertCircle size={14} />
              {errors.email}
            </div>
          )}
        </div>

        {!isResetView && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
          {errors.password && (
            <div className={styles.fieldError}>
              <AlertCircle size={14} />
              {errors.password}
            </div>
          )}
        </div>
        )}

        {generalError && (
          <div className={styles.error}>
            <AlertCircle size={16} />
            {generalError}
          </div>
        )}

        {isResetView ? (
          <Button 
            type="button" 
            onClick={handlePasswordReset}
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Sending Reset Instructions...' : 'Send Reset Instructions'}
          </Button>
        ) : (
        <Button 
          type="submit" 
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
        )}

        <div className={styles.footer}>
          {isResetView ? (
            <button
              type="button"
              onClick={() => setIsResetView(false)}
              className={styles.link}
            >
              Back to Sign In
            </button>
          ) : (
            <>
          Don't have an account? 
          <button 
            type="button"
            onClick={onSwitchToSignUp}
            className={styles.link}
          >
            Create Account
          </button>
            </>
          )}
        </div>

        {!isResetView && (
          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => setIsResetView(true)}
              className={styles.link}
            >
              Forgot your password?
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
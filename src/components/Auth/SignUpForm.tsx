import React, { useState } from 'react';
import { Users, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSystemStore } from '../../store/systemStore';
import Button from '../Button/Button';
import styles from './LoginForm.module.css';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'candidate' as 'candidate' | 'recruiter'
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');
  const { signup, isLoading } = useAuthStore();
  const { addNotification, startOnboarding } = useSystemStore();

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long for security';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase and one lowercase letter';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation does not match';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
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
      await signup(
        formData.email.trim(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.role
      );

      addNotification({
        type: 'success',
        title: 'Welcome to ReelApps!',
        message: `Your ${formData.role} account has been created successfully. Please check your email to verify your account.`
      });

      // Start onboarding flow after a short delay
      setTimeout(() => {
        startOnboarding();
      }, 1000);

      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Account creation failed';
      
      // Handle specific error cases with professional messaging
      if (errorMessage.includes('already registered') || 
          errorMessage.includes('email_address_exists') ||
          errorMessage.includes('User already registered')) {
        setGeneralError('An account with this email address already exists. Please use a different email or sign in to your existing account.');
        setErrors({ email: 'This email address is already registered' });
      } else if (errorMessage.includes('Invalid email') || 
                 errorMessage.includes('email_invalid')) {
        setGeneralError('The email address format is invalid. Please enter a valid email address.');
        setErrors({ email: 'Please enter a valid email address' });
      } else if (errorMessage.includes('Password') && errorMessage.includes('weak')) {
        setGeneralError('The password you entered does not meet our security requirements. Please choose a stronger password.');
        setErrors({ password: 'Password does not meet security requirements' });
      } else if (errorMessage.includes('Rate limit') || 
                 errorMessage.includes('too many')) {
        setGeneralError('Too many account creation attempts. Please wait a few minutes before trying again.');
      } else if (errorMessage.includes('Network') || 
                 errorMessage.includes('connection')) {
        setGeneralError('Connection issue detected. Please check your internet connection and try again.');
      } else {
        setGeneralError('We encountered an issue creating your account. Please try again or contact support if the problem persists.');
      }
      
      addNotification({
        type: 'error',
        title: 'Account Creation Failed',
        message: generalError || 'Unable to create your account. Please review the information and try again.'
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific error when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error
    if (generalError) setGeneralError('');
  };

  const getFieldError = (field: keyof ValidationErrors) => {
    return errors[field];
  };

  const getPasswordStrength = () => {
    if (!formData.password) return null;
    
    const hasLength = formData.password.length >= 8;
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasLower = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
    
    const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score < 3) return { strength: 'Weak', color: 'text-red-600' };
    if (score < 4) return { strength: 'Good', color: 'text-yellow-600' };
    return { strength: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength();

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
          <h1 className={styles.title}>Create Your Account</h1>
          <p className={styles.subtitle}>Join the future of talent acquisition and unlock your potential</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>I am a...</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="candidate"
                checked={formData.role === 'candidate'}
                onChange={(e) => handleInputChange('role', e.target.value)}
                style={{ cursor: 'pointer' }}
              />
              <span>Job seeker looking for opportunities</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="recruiter"
                checked={formData.role === 'recruiter'}
                onChange={(e) => handleInputChange('role', e.target.value)}
                style={{ cursor: 'pointer' }}
              />
              <span>Recruiter hiring talent</span>
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>First Name</label>
            <input
              type="text"
              className={`${styles.input} ${getFieldError('firstName') ? styles.inputError : ''}`}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter your first name"
              autoComplete="given-name"
              required
            />
            {getFieldError('firstName') && (
              <div className={styles.fieldError}>
                <AlertCircle size={14} />
                {getFieldError('firstName')}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Last Name</label>
            <input
              type="text"
              className={`${styles.input} ${getFieldError('lastName') ? styles.inputError : ''}`}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter your last name"
              autoComplete="family-name"
              required
            />
            {getFieldError('lastName') && (
              <div className={styles.fieldError}>
                <AlertCircle size={14} />
                {getFieldError('lastName')}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input
            type="email"
            className={`${styles.input} ${getFieldError('email') ? styles.inputError : ''}`}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            autoComplete="email"
            required
          />
          {getFieldError('email') && (
            <div className={styles.fieldError}>
              <AlertCircle size={14} />
              {getFieldError('email')}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            className={`${styles.input} ${getFieldError('password') ? styles.inputError : ''}`}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Create a strong password (minimum 8 characters)"
            autoComplete="new-password"
            required
          />
          {getFieldError('password') && (
            <div className={styles.fieldError}>
              <AlertCircle size={14} />
              {getFieldError('password')}
            </div>
          )}
          {passwordStrength && !getFieldError('password') && (
            <div className={`${styles.fieldSuccess} ${passwordStrength.color}`}>
              <CheckCircle size={14} />
              Password strength: {passwordStrength.strength}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm Password</label>
          <input
            type="password"
            className={`${styles.input} ${getFieldError('confirmPassword') ? styles.inputError : ''}`}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />
          {getFieldError('confirmPassword') && (
            <div className={styles.fieldError}>
              <AlertCircle size={14} />
              {getFieldError('confirmPassword')}
            </div>
          )}
          {formData.confirmPassword && formData.password === formData.confirmPassword && !getFieldError('confirmPassword') && (
            <div className={styles.fieldSuccess}>
              <CheckCircle size={14} />
              Passwords match
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
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Creating Account...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Create Account
              <ArrowRight size={16} />
            </span>
          )}
        </Button>

        <div className={styles.footer}>
          Already have an account? 
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className={styles.link}
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
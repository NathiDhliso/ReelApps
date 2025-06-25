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
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
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
        formData.email,
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim(),
        formData.role
      );

      addNotification({
        type: 'success',
        title: 'Welcome to ReelApps!',
        message: `Your ${formData.role} account has been created successfully.`
      });

      // Start onboarding flow after a short delay
      setTimeout(() => {
        startOnboarding();
      }, 1000);

      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setGeneralError(errorMessage);
      
      // Handle specific error cases
      if (errorMessage.includes('already registered')) {
        setErrors({ email: 'This email is already registered' });
      }
      
      addNotification({
        type: 'error',
        title: 'Sign Up Failed',
        message: errorMessage
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
          <p className={styles.subtitle}>Join the future of talent acquisition</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Account Type</label>
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
              <span>I'm looking for opportunities</span>
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
              <span>I'm hiring talent</span>
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
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={`${styles.input} ${getFieldError('email') ? styles.inputError : ''}`}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
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
            placeholder="Create a password (min. 6 characters)"
            required
          />
          {getFieldError('password') && (
            <div className={styles.fieldError}>
              <AlertCircle size={14} />
              {getFieldError('password')}
            </div>
          )}
          {formData.password.length >= 6 && !getFieldError('password') && (
            <div className={styles.fieldSuccess}>
              <CheckCircle size={14} />
              Password strength: Good
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
            placeholder="Confirm your password"
            required
          />
          {getFieldError('confirmPassword') && (
            <div className={styles.fieldError}>
              <AlertCircle size={14} />
              {getFieldError('confirmPassword')}
            </div>
          )}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
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
          {isLoading ? 'Creating Account...' : 'Create Account'}
          {!isLoading && <ArrowRight size={16} />}
        </Button>

        <div className={styles.footer}>
          Already have an account? 
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className={styles.link}
            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '4px' }}
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
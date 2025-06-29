import React, { useState, useEffect, useRef } from 'react';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
  // Auth methods passed as props
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, firstName: string, lastName: string, role?: 'candidate' | 'recruiter') => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialView = 'login',
  onLogin,
  onSignup,
  onPasswordReset,
  isLoading = false,
  error = null
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  
  const [view, setView] = useState<'login' | 'signup' | 'reset'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store the previously focused element when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management and keyboard handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus the modal container
    if (modalRef.current) {
      modalRef.current.focus();
    }

    // Handle Escape key and focus trapping
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Focus trapping
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        // If shift+tab on first element, focus last
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
        // If tab on last element, focus first
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus when modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Reset form when view changes
  useEffect(() => {
    setLocalError(null);
    setSuccessMessage(null);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  }, [view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    // Client-side validation
    if (!email || !password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    // Password policy validation (minimum 8 characters)
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    if (view === 'signup' && (!firstName || !lastName)) {
      setLocalError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (view === 'login') {
        await onLogin(email, password);
        onClose();
      } else if (view === 'signup') {
        await onSignup(email, password, firstName, lastName, role);
        onClose();
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      await onPasswordReset(email);
      setSuccessMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setLocalError('Failed to send password reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
          disabled={isSubmitting}
        >
          ×
        </button>

        <h2 id="auth-modal-title" className={styles.title}>
          {view === 'login' && 'Sign In'}
          {view === 'signup' && 'Create Account'}
          {view === 'reset' && 'Reset Password'}
        </h2>

        {(localError || error) && (
          <div className={styles.error} role="alert">
            {localError || error}
          </div>
        )}

        {successMessage && (
          <div className={styles.success} role="status">
            {successMessage}
          </div>
        )}

        {view === 'reset' ? (
          <form onSubmit={handlePasswordReset}>
            <div className={styles.field}>
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Email'}
            </button>

            <p className={styles.switchView}>
              Remember your password?{' '}
              <button 
                type="button"
                onClick={() => setView('login')}
                disabled={isSubmitting}
              >
                Sign In
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            {view === 'signup' && (
              <>
                <div className={styles.field}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="role">I am a</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'candidate' | 'recruiter')}
                    disabled={isSubmitting}
                  >
                    <option value="candidate">Candidate</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </div>
              </>
            )}

            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                minLength={8}
              />
              {view === 'signup' && (
                <small>Password must be at least 8 characters</small>
              )}
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
            </button>

            {view === 'login' && (
              <>
                <p className={styles.switchView}>
                  Don't have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setView('signup')}
                    disabled={isSubmitting}
                  >
                    Sign Up
                  </button>
                </p>
                <p className={styles.switchView}>
                  <button 
                    type="button"
                    onClick={() => setView('reset')}
                    disabled={isSubmitting}
                  >
                    Forgot Password?
                  </button>
                </p>
              </>
            )}

            {view === 'signup' && (
              <p className={styles.switchView}>
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => setView('login')}
                  disabled={isSubmitting}
                >
                  Sign In
                </button>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSupabaseClient } from '@reelapps/auth';
import { useSystemStore } from '../store/systemStore';
import Button from '../components/Button/Button';
import Card from '../components/Card/Card';
import styles from '../components/Auth/LoginForm.module.css';

const PasswordReset: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useSearchParams();
  const { addNotification } = useSystemStore();
  const supabase = getSupabaseClient();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // The access_token is provided by Supabase in the URL fragment
    const accessToken = location.toString().split('&').find(part => part.startsWith('access_token='));
    
    if (!accessToken) {
      setError('Invalid or missing reset token.');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }
      
      addNotification({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been successfully updated. Please sign in.',
      });
      navigate('/'); // Redirect to home/login
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container} style={{ paddingTop: '100px' }}>
      <Card>
        <form className={styles.form} onSubmit={handlePasswordReset}>
          <h1 className={styles.title}>Set New Password</h1>
          <p className={styles.subtitle}>Enter your new password below.</p>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>New Password</label>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PasswordReset; 
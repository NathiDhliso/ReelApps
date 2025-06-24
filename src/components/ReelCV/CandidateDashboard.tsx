import React from 'react';
import { useAuthStore } from '../../store/authStore';
import styles from './CandidateDashboard.module.css';

const CandidateDashboard: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Candidate Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {user?.email}</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Profile Completion</h3>
            <p>Complete your profile to get better matches</p>
          </div>
          
          <div className={styles.card}>
            <h3>Job Matches</h3>
            <p>View your latest job recommendations</p>
          </div>
          
          <div className={styles.card}>
            <h3>Applications</h3>
            <p>Track your job applications</p>
          </div>
          
          <div className={styles.card}>
            <h3>ReelCV</h3>
            <p>Manage your video CV showcase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
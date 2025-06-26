import React from 'react';
import { useAuthStore } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import styles from './CandidateDashboard.module.css';

const CandidateDashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Candidate Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {user?.email}</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.grid}>
          <div
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => {
              console.log('Navigating to ReelSkills');
              navigate('/reelskills');
            }}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/reelskills')}
          >
            <h3>Profile Completion</h3>
            <p>Complete your profile to get better matches</p>
          </div>
          
          <div
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => {
              console.log('Navigating to Job Matches');
              navigate('/jobs');
            }}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/jobs')}
          >
            <h3>Job Matches</h3>
            <p>View your latest job recommendations</p>
          </div>
          
          <div
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => {
              console.log('Navigating to Applications');
              navigate('/applications');
            }}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/applications')}
          >
            <h3>Applications</h3>
            <p>Track your job applications</p>
          </div>
          
          <div
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (profile) {
                console.log('Opening ReelCV', profile.id);
                window.open(`https://www.reelcv.co.za/candidate/${profile.id}`, '_blank');
              }
            }}
            onKeyDown={(e) => {
              if (profile && e.key === 'Enter') {
                window.open(`https://www.reelcv.co.za/candidate/${profile.id}`, '_blank');
              }
            }}
          >
            <h3>ReelCV</h3>
            <p>Manage your video CV showcase</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
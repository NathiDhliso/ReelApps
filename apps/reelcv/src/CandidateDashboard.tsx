import React from 'react';
import { Card, Button } from '@reelapps/ui';
import styles from './CandidateDashboard.module.css';

const CandidateDashboard: React.FC = () => {
  // TODO: Implement auth from shared package
  const user = { email: 'user@example.com' };
  const profile = { id: '123' };

  const handleNavigation = (path: string) => {
    console.log('Would navigate to:', path);
    // TODO: Implement navigation or external links
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Candidate Dashboard</h1>
        <p className={styles.subtitle}>Welcome back, {user?.email}</p>
      </div>
      
      <div className={styles.content}>
        <div className={styles.grid}>
          <Card
            interactive
            onClick={() => handleNavigation('/reelskills')}
          >
            <Card.Header
              title="Profile Completion"
              description="Complete your profile to get better matches"
            />
            <Card.Footer>
              <Button variant="outline">Complete Profile</Button>
            </Card.Footer>
          </Card>
          
          <Card
            interactive
            onClick={() => handleNavigation('/jobs')}
          >
            <Card.Header
              title="Job Matches"
              description="View your latest job recommendations"
            />
            <Card.Footer>
              <Button variant="outline">View Matches</Button>
            </Card.Footer>
          </Card>
          
          <Card
            interactive
            onClick={() => handleNavigation('/applications')}
          >
            <Card.Header
              title="Applications"
              description="Track your job applications"
            />
            <Card.Footer>
              <Button variant="outline">View Applications</Button>
            </Card.Footer>
          </Card>
          
          <Card
            interactive
            onClick={() => handleNavigation(`/reelcv/${profile?.id}`)}
          >
            <Card.Header
              title="ReelCV"
              description="Manage your video CV showcase"
            />
            <Card.Footer>
              <Button variant="outline">Manage ReelCV</Button>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
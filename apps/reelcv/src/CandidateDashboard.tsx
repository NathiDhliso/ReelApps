import React from 'react';
import { useAuthStore } from '@reelapps/auth';
import { Card, Button } from '@reelapps/ui';

const CandidateDashboard: React.FC = () => {
  const { user, profile } = useAuthStore();

  const handleNavigation = (path: string) => {
    console.log('Would navigate to:', path);
    // TODO: Implement navigation or external links
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Candidate Dashboard
          </h1>
          <p className="text-xl text-text-secondary">
            Welcome back, {profile?.first_name || user?.email}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            interactive
            onClick={() => handleNavigation('/reelskills')}
            className="bg-surface border-surface hover:border-primary transition-colors"
          >
            <Card.Header
              title="ReelSkills"
              description="Showcase your skills through video demonstrations"
            />
            <Card.Footer>
              <Button variant="outline">Manage Skills</Button>
            </Card.Footer>
          </Card>
          
          <Card
            interactive
            onClick={() => handleNavigation('/profile')}
            className="bg-surface border-surface hover:border-primary transition-colors"
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
            className="bg-surface border-surface hover:border-primary transition-colors"
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
            className="bg-surface border-surface hover:border-primary transition-colors"
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
            className="bg-surface border-surface hover:border-primary transition-colors"
          >
            <Card.Header
              title="Video Showcase"
              description="Manage your video CV showcase"
            />
            <Card.Footer>
              <Button variant="outline">Manage Videos</Button>
            </Card.Footer>
          </Card>

          <Card
            interactive
            onClick={() => handleNavigation('/analytics')}
            className="bg-surface border-surface hover:border-primary transition-colors"
          >
            <Card.Header
              title="Analytics"
              description="View your profile performance and insights"
            />
            <Card.Footer>
              <Button variant="outline">View Analytics</Button>
            </Card.Footer>
          </Card>
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Your Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-surface border border-surface rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">12</div>
              <div className="text-text-secondary text-sm uppercase tracking-wide">Skills Verified</div>
            </div>
            <div className="bg-surface border border-surface rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-secondary mb-2">8</div>
              <div className="text-text-secondary text-sm uppercase tracking-wide">Video Demos</div>
            </div>
            <div className="bg-surface border border-surface rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">24</div>
              <div className="text-text-secondary text-sm uppercase tracking-wide">Profile Views</div>
            </div>
            <div className="bg-surface border border-surface rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-accent-secondary mb-2">5</div>
              <div className="text-text-secondary text-sm uppercase tracking-wide">Applications</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
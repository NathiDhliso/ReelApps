import React from 'react';
import { 
  User, 
  Search, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  CheckCircle,
  BarChart3,
  Target,
  Brain
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Card, Button } from '@reelapps/ui';
import StatusDashboard from '../StatusDashboard/StatusDashboard';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { isAuthenticated, profile } = useAuthStore();
  const isRecruiter = isAuthenticated && profile?.role === 'recruiter';

  const handleGetStarted = () => {
    // This logic assumes you have a way to open your auth modal.
    // We can enhance this if you have a different store/method for it.
    const navLoginButton = document.querySelector('#nav-login-button');
    if (navLoginButton instanceof HTMLElement) {
      navLoginButton.click();
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          The Future of Talent Acquisition
        </h1>
        <p className={styles.heroSubtitle}>
          ReelCV empowers candidates to showcase their authentic selves, while ReelHunter 
          helps recruiters discover talent beyond traditional resumes. Build diverse, 
          high-performing teams with our AI-powered ecosystem.
        </p>
        <div className={styles.heroActions}>
          <Button 
            size="large" 
            href={isAuthenticated ? "/dashboard" : undefined}
            onClick={!isAuthenticated ? handleGetStarted : undefined}
          >
            <User size={20} />
            {isAuthenticated ? "My Dashboard" : "Get Started"}
          </Button>
          {isRecruiter && (
            <Button variant="outline" size="large" href="/reelhunter">
            <Search size={20} />
              Open ReelHunter
          </Button>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className={styles.featuresSection}>
      <div className={styles.dashboardGrid}>
        {/* ReelCV Card */}
        <Card variant="gradient" interactive>
          <Card.Header
            icon={<User size={24} />}
            title="ReelCV"
            description="Dynamic candidate profiles that go beyond traditional resumes"
          />
          
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureIcon} />
              Video introductions & skill demonstrations
            </li>
            <li className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureIcon} />
              Portfolio integration & project showcases
            </li>
            <li className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureIcon} />
              Real-time availability & preferences
            </li>
            <li className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureIcon} />
              Skills verification & peer endorsements
            </li>
          </ul>

          <Card.Footer>
              <Button 
                variant="secondary" 
                href={isAuthenticated ? "/dashboard" : undefined}
                onClick={!isAuthenticated ? handleGetStarted : undefined}
              >
              {isAuthenticated ? "View My Profile" : "Get Started"}
            </Button>
          </Card.Footer>
        </Card>

        {/* ReelHunter Card */}
          {isRecruiter && (
        <Card interactive>
          <Card.Header
            icon={<Search size={24} />}
            title="ReelHunter"
            description="AI-powered recruitment platform for modern hiring teams"
          />
          
          <div className={styles.chartContainer}>
            <BarChart3 size={48} />
            <span style={{ marginLeft: '12px' }}>Advanced Analytics Dashboard</span>
          </div>

          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Match Accuracy</span>
            <span className={styles.metricValue}>94%</span>
          </div>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Time to Hire</span>
            <span className={styles.metricValue}>-60%</span>
          </div>
          <div className={styles.metricRow}>
            <span className={styles.metricLabel}>Diversity Score</span>
            <span className={styles.metricValue}>A+</span>
          </div>

          <Card.Footer>
                <Button 
                  href={isRecruiter ? "/reelhunter" : undefined}
                  onClick={!isRecruiter && !isAuthenticated ? handleGetStarted : undefined}
                >
                  Open ReelHunter
            </Button>
          </Card.Footer>
        </Card>
          )}

        {/* Intelligence Engine */}
        <Card variant="glass">
          <Card.Header
            icon={<Brain size={24} />}
            title="AI Intelligence Engine"
            description="Machine learning algorithms that understand talent beyond keywords"
          />
          
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <Zap size={16} className={styles.featureIcon} />
              Culture Add analysis & team compatibility
            </li>
            <li className={styles.featureItem}>
              <Target size={16} className={styles.featureIcon} />
              Skills-first matching algorithms
            </li>
            <li className={styles.featureItem}>
              <TrendingUp size={16} className={styles.featureIcon} />
              Predictive performance modeling
            </li>
            <li className={styles.featureItem}>
              <Shield size={16} className={styles.featureIcon} />
              Bias detection & mitigation tools
            </li>
          </ul>
        </Card>

        {/* Analytics & Insights */}
        <Card>
          <Card.Header
            icon={<TrendingUp size={24} />}
            title="Analytics & Insights"
            description="Data-driven insights to optimize your hiring process"
          />
          
          <div className={styles.chartContainer}>
            <TrendingUp size={48} />
            <span style={{ marginLeft: '12px' }}>Real-time Metrics</span>
          </div>

          <Card.Footer>
            <div className={styles.cardStats}>
              <Card.Stat value="2.4x" label="Faster Hiring" />
              <Card.Stat value="89%" label="Retention Rate" />
              <Card.Stat value="45%" label="Cost Reduction" />
            </div>
          </Card.Footer>
        </Card>

        {/* Team Collaboration */}
        <Card>
          <Card.Header
            icon={<Users size={24} />}
            title="Team Collaboration"
            description="Streamlined workflows for distributed hiring teams"
          />
          
          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureIcon} />
              Collaborative candidate evaluation
            </li>
            <li className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureIcon} />
              Automated interview scheduling
            </li>
            <li className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureIcon} />
              Real-time feedback & scoring
            </li>
            <li className={styles.featureItem}>
              <CheckCircle size={16} className={styles.featureIcon} />
              Integration with existing tools
            </li>
          </ul>

          <Card.Footer>
            <Button variant="outline">
              View Integrations
            </Button>
          </Card.Footer>
        </Card>

        {/* System Status */}
        <StatusDashboard />
      </div>
      </section>
    </div>
  );
};

export default Dashboard;
import React from 'react';
import { 
  User, 
  Search, 
  Target, 
  Shield, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Zap,
  Star,
  Award,
  Brain,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getAppsForRole, AppConfig } from '@reelapps/config';
import { Button } from '@reelapps/ui';
import styles from './Dashboard.module.css';

const iconMap = {
  User,
  Search,
  Target,
  Shield,
  TrendingUp,
  Users,
  Brain,
  Smile: Users, // Placeholder for ReelPersona
  Briefcase: Target, // Placeholder for ReelProject
};

const Dashboard: React.FC = () => {
  const { isAuthenticated, profile } = useAuthStore();

  const getIconComponent = (iconName?: string) => {
    if (!iconName || !(iconName in iconMap)) {
      return <User size={32} aria-hidden="true" />;
    }
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return <IconComponent size={32} aria-hidden="true" />;
  };

  const renderAppCard = (app: AppConfig, featured: boolean = false) => {
    return (
      <div key={app.id} className={`${styles.appCard} ${featured ? styles.featuredApp : ''}`}>
        <div className={styles.appIcon}>
          {getIconComponent(app.icon)}
        </div>
        <div className={styles.appContent}>
          <h3 className={styles.appTitle}>{app.name}</h3>
          <p className={styles.appDescription}>{app.description}</p>
          {featured && (
            <div className={styles.appBadge}>
              <Star size={14} />
              <span>Most Popular</span>
            </div>
          )}
        </div>
        <Button 
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.appButton}
          aria-label={`Launch ${app.name}`}
        >
          Launch
          <ArrowRight size={16} />
        </Button>
      </div>
    );
  };

  const availableApps = isAuthenticated && profile?.role 
    ? getAppsForRole(profile.role)
    : [];

  if (!isAuthenticated) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.notAuthenticatedMessage}>
          <h1>Please sign in to access your dashboard</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Two-column Hero Layout */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          {/* Left Column - Hero Content */}
          <div className={styles.heroContent}>
            <div className={styles.heroLabel}>
              <Zap size={16} />
              <span>The Future of Talent</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Skills Over CVs,
              <span className={styles.heroTitleGradient}>
                Talent Over
                Tradition
              </span>
            </h1>
            
            <p className={styles.heroSubtitle}>
              Revolutionary platform where verified skills speak louder than 
              formatted resumes. Build authentic profiles, showcase real 
              capabilities, and connect with opportunities that match your 
              true potential.
            </p>

            {/* Welcome Message */}
            <div className={styles.welcomeMessage}>
              <div className={styles.welcomeIcon}>
                <CheckCircle size={24} />
              </div>
              <div>
                <p className={styles.welcomeText}>
                  Welcome back, {profile?.first_name || 'Kegiso'}!
                </p>
                <p className={styles.welcomeSubtext}>
                  Ready to showcase your skills and advance your career?
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsContainer}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{availableApps.length}</div>
                <div className={styles.statLabel}>Apps Available</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Skill Verified</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>24/7</div>
                <div className={styles.statLabel}>Access</div>
              </div>
            </div>
          </div>

          {/* Right Column - Apps Panel */}
          <div className={styles.heroApps}>
            <div className={styles.appsPanel}>
              <div className={styles.appsHeader}>
                <h2 className={styles.appsTitle}>
                  <Award size={24} />
                  Your Applications
                </h2>
                <p className={styles.appsSubtitle}>
                  Click to launch and start building your verified skill portfolio
                </p>
              </div>

              <div className={styles.appsScrollContainer}>
                <div className={styles.appsGrid}>
                  {availableApps.map((app, index) => renderAppCard(app, index === 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
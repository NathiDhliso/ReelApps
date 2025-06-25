import React from 'react';
import { User, Search, Target, Shield, TrendingUp, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getAppsForRole, AppConfig } from '@reelapps/config';
import { Card, Button } from '@reelapps/ui';
import styles from './HomePage.module.css';

const iconMap = {
  User,
  Search,
  Target,
  Shield,
  TrendingUp,
  Users,
};

const HomePage: React.FC = () => {
  const { isAuthenticated, profile } = useAuthStore();

  const handleGetStarted = () => {
    const navLoginButton = document.querySelector('#nav-login-button');
    if (navLoginButton instanceof HTMLElement) {
      navLoginButton.click();
    }
  };

  const getIconComponent = (iconName?: string) => {
    if (!iconName || !(iconName in iconMap)) {
      return <User size={24} />;
    }
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return <IconComponent size={24} />;
  };

  const renderAppCard = (app: AppConfig) => {
    return (
      <Card key={app.id} variant="gradient" interactive>
        <Card.Header
          icon={getIconComponent(app.icon)}
          title={app.name}
          description={app.description}
        />
        <Card.Footer>
          <Button 
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open {app.name}
          </Button>
        </Card.Footer>
      </Card>
    );
  };

  const availableApps = isAuthenticated && profile?.role 
    ? getAppsForRole(profile.role)
    : [];

  return (
    <div className={styles.homepage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Welcome to ReelApps
        </h1>
        <p className={styles.heroSubtitle}>
          Your gateway to the future of talent acquisition. Access all ReelApps 
          applications from one central hub.
        </p>
        <div className={styles.heroActions}>
          {!isAuthenticated ? (
            <Button size="large" onClick={handleGetStarted}>
              <User size={20} />
              Get Started
            </Button>
          ) : (
            <p className={styles.welcomeText}>
              Welcome back, {profile?.first_name || 'User'}! Choose an application below.
            </p>
          )}
        </div>
      </section>

      {/* Apps Grid */}
      {isAuthenticated && (
        <section className={styles.appsSection}>
          <h2 className={styles.sectionTitle}>Your Applications</h2>
          <div className={styles.appsGrid}>
            {availableApps.map(renderAppCard)}
          </div>
        </section>
      )}

      {/* Features Overview for Non-Authenticated Users */}
      {!isAuthenticated && (
        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Our Applications</h2>
          <div className={styles.featuresGrid}>
            <Card>
              <Card.Header
                icon={<User size={24} />}
                title="ReelCV"
                description="Dynamic candidate profiles that showcase your authentic self"
              />
            </Card>
            
            <Card>
              <Card.Header
                icon={<Search size={24} />}
                title="ReelHunter"
                description="AI-powered recruitment platform for modern hiring teams"
              />
            </Card>
            
            <Card>
              <Card.Header
                icon={<Target size={24} />}
                title="ReelSkills"
                description="Skill verification and development platform"
              />
            </Card>
            
            <Card>
              <Card.Header
                icon={<Users size={24} />}
                title="ReelPersona"
                description="AI-powered personality analysis for career development"
              />
            </Card>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage; 
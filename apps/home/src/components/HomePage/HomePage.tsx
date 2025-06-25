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
      return <User size={24} aria-hidden="true" />;
    }
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return <IconComponent size={24} aria-hidden="true" />;
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
            aria-label={`Open ${app.name} application in new tab`}
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
    <main className={styles.homepage}>
      {/* Hero Section */}
      <section className={styles.heroSection} aria-labelledby="hero-title">
        <h1 id="hero-title" className={styles.heroTitle}>
          Welcome to ReelApps
        </h1>
        <p className={styles.heroSubtitle}>
          Your gateway to the future of talent acquisition. Access all ReelApps 
          applications from one central hub.
        </p>
        <div className={styles.heroActions}>
          {!isAuthenticated ? (
            <Button 
              size="large" 
              onClick={handleGetStarted}
              aria-label="Get started with ReelApps - open login form"
            >
              <User size={20} aria-hidden="true" />
              Get Started
            </Button>
          ) : (
            <p className={styles.welcomeText} role="status" aria-live="polite">
              Welcome back, {profile?.first_name || 'User'}! Choose an application below.
            </p>
          )}
        </div>
      </section>

      {/* Apps Grid */}
      {isAuthenticated && (
        <section className={styles.appsSection} aria-labelledby="apps-title">
          <h2 id="apps-title" className={styles.sectionTitle}>Your Applications</h2>
          <div className={styles.appsGrid} role="grid" aria-label="Available applications">
            {availableApps.map(renderAppCard)}
          </div>
        </section>
      )}

      {/* Features Overview for Non-Authenticated Users */}
      {!isAuthenticated && (
        <section className={styles.featuresSection} aria-labelledby="features-title">
          <h2 id="features-title" className={styles.sectionTitle}>Our Applications</h2>
          <div className={styles.featuresGrid} role="grid" aria-label="ReelApps feature overview">
            <Card>
              <Card.Header
                icon={<User size={24} aria-hidden="true" />}
                title="ReelCV"
                description="Dynamic candidate profiles that showcase your authentic self"
              />
            </Card>
            
            <Card>
              <Card.Header
                icon={<Search size={24} aria-hidden="true" />}
                title="ReelHunter"
                description="AI-powered recruitment platform for modern hiring teams"
              />
            </Card>
            
            <Card>
              <Card.Header
                icon={<Target size={24} aria-hidden="true" />}
                title="ReelSkills"
                description="Skill verification and development platform"
              />
            </Card>
            
            <Card>
              <Card.Header
                icon={<Users size={24} aria-hidden="true" />}
                title="ReelPersona"
                description="AI-powered personality analysis for career development"
              />
            </Card>
          </div>
        </section>
      )}
    </main>
  );
};

export default HomePage; 
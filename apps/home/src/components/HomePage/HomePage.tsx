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
  CheckCircle,
  Star,
  Rocket,
  Eye,
  Award,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../lib/auth';
import { useSystemStore } from '../../store/systemStore';
import { getAppsForRole, AppConfig } from '@reelapps/config';
import { Button } from '@reelapps/ui';
import { launchAppWithAuth } from '@reelapps/auth';
import { getSupabaseClient } from '@reelapps/auth';
import styles from './HomePage.module.css';

const iconMap = {
  User,
  Search,
  Target,
  Shield,
  TrendingUp,
  Users,
  Smile: Users, // Placeholder for ReelPersona
  Briefcase: Target, // Placeholder for ReelProject
};

const HomePage: React.FC = () => {
  const { isAuthenticated, profile } = useAuthStore();
  const { openAuthModal } = useSystemStore();

  const handleGetStarted = () => {
    openAuthModal('signup');
  };

  const handleLaunchApp = async (appUrl: string) => {
    try {
      await launchAppWithAuth(appUrl);
    } catch (error) {
      console.error('Error launching app:', error);
      // Fallback to regular window.open
      if (typeof window !== 'undefined') {
        window.open(appUrl, '_blank');
      }
    }
  };

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
          onClick={() => handleLaunchApp(app.url)}
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

  // Debug logging
  console.log('🔍 DEBUG: HomePage - isAuthenticated:', isAuthenticated);
  console.log('🔍 DEBUG: HomePage - profile:', profile);
  console.log('🔍 DEBUG: HomePage - profile.role:', profile?.role);
  console.log('🔍 DEBUG: HomePage - availableApps:', availableApps);
  console.log('🔍 DEBUG: HomePage - availableApps.length:', availableApps.length);

  const featuredApps = availableApps.slice(0, 3);
  const otherApps = availableApps.slice(3);

  return (
    <main className={styles.homepage}>
      {/* Hero Section with Integrated Apps */}
      <section className={styles.heroSection} aria-labelledby="hero-title">
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.heroLabel}>
                <Zap size={16} />
                <span>The Future of Talent</span>
              </div>
              <h1 id="hero-title" className={styles.heroTitle}>
                Skills Over CVs,
                <span className={styles.heroTitleGradient}>Talent Over Tradition</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Revolutionary platform where verified skills speak louder than formatted resumes. 
                Build authentic profiles, showcase real capabilities, and connect with opportunities that match your true potential.
              </p>
              
              {!isAuthenticated ? (
                <div className={styles.heroActions}>
                  <Button 
                    size="large" 
                    onClick={handleGetStarted}
                    className={styles.primaryCTA}
                    aria-label="Start your talent journey"
                  >
                    <Rocket size={20} />
                    Start Your Journey
                  </Button>
                  <Button 
                    variant="outline"
                    size="large"
                    className={styles.secondaryCTA}
                  >
                    <Eye size={20} />
                    See How It Works
                  </Button>
                </div>
              ) : (
                <div className={styles.welcomeMessage}>
                  <div className={styles.welcomeIcon}>
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <p className={styles.welcomeText}>
                      Welcome back, <strong>{profile?.first_name || 'User'}</strong>!
                    </p>
                    <p className={styles.welcomeSubtext}>
                      Ready to showcase your skills and advance your career?
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats for Authenticated Users */}
            {isAuthenticated && (
              <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>
                    {availableApps.length}
                  </div>
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
            )}
          </div>

          {/* Apps Grid in Hero */}
          {isAuthenticated && availableApps.length > 0 && (
            <div className={styles.heroApps}>
              <div className={styles.appsHeader}>
                <h2 className={styles.appsTitle}>
                  <Award size={24} />
                  Your Applications
                </h2>
                <p className={styles.appsSubtitle}>
                  Click to launch and start building your verified skill portfolio
                </p>
              </div>

              {/* Featured Apps */}
              {featuredApps.length > 0 && (
                <div className={styles.featuredApps}>
                  {featuredApps.map((app, index) => renderAppCard(app, index === 0))}
                </div>
              )}

              {/* Other Apps */}
              {otherApps.length > 0 && (
                <div className={styles.otherApps}>
                  <h3 className={styles.otherAppsTitle}>More Applications</h3>
                  <div className={styles.otherAppsGrid}>
                    {otherApps.map((app) => renderAppCard(app, false))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Value Proposition for Non-Authenticated Users */}
      {!isAuthenticated && (
        <section className={styles.valueSection} aria-labelledby="value-title">
          <div className={styles.valueContainer}>
            <h2 id="value-title" className={styles.valueTitle}>
              Why Choose ReelApps?
            </h2>
            
            <div className={styles.valueGrid}>
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <Shield size={32} />
                </div>
                <h3>Verified Skills</h3>
                <p>AI-powered verification ensures authentic skill demonstrations</p>
              </div>
              
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <Target size={32} />
                </div>
                <h3>Perfect Matches</h3>
                <p>Connect with opportunities that truly fit your capabilities</p>
              </div>
              
              <div className={styles.valueCard}>
                <div className={styles.valueIcon}>
                  <TrendingUp size={32} />
                </div>
                <h3>Career Growth</h3>
                <p>Track progress and unlock new opportunities as you evolve</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Applications Overview for Non-Authenticated Users */}
      {!isAuthenticated && (
        <section className={styles.appsOverview} aria-labelledby="apps-overview-title">
          <div className={styles.overviewContainer}>
            <h2 id="apps-overview-title" className={styles.overviewTitle}>
              Our Complete Ecosystem
            </h2>
            <p className={styles.overviewSubtitle}>
              Five powerful applications working together to revolutionize how talent is discovered and developed
            </p>
            
            <div className={styles.overviewGrid}>
              <div className={styles.overviewCard}>
                <div className={styles.overviewIcon}>
                  <User size={40} />
                </div>
                <h3>ReelCV</h3>
                <p>Dynamic profiles showcasing your authentic professional self</p>
                <div className={styles.overviewFeatures}>
                  <span>✓ Skill Verification</span>
                  <span>✓ Portfolio Integration</span>
                  <span>✓ Real-time Updates</span>
                </div>
              </div>
              
              <div className={styles.overviewCard}>
                <div className={styles.overviewIcon}>
                  <Search size={40} />
                </div>
                <h3>ReelHunter</h3>
                <p>AI-powered recruitment platform for modern hiring teams</p>
                <div className={styles.overviewFeatures}>
                  <span>✓ Smart Matching</span>
                  <span>✓ Skill-based Search</span>
                  <span>✓ Bias Reduction</span>
                </div>
              </div>
              
              <div className={styles.overviewCard}>
                <div className={styles.overviewIcon}>
                  <Target size={40} />
                </div>
                <h3>ReelSkills</h3>
                <p>Skill verification and development platform</p>
                <div className={styles.overviewFeatures}>
                  <span>✓ Video Verification</span>
                  <span>✓ AI Assessment</span>
                  <span>✓ Progress Tracking</span>
                </div>
              </div>
              
              <div className={styles.overviewCard}>
                <div className={styles.overviewIcon}>
                  <Users size={40} />
                </div>
                <h3>ReelPersona</h3>
                <p>AI-powered personality analysis for career development</p>
                <div className={styles.overviewFeatures}>
                  <span>✓ Personality Insights</span>
                  <span>✓ Career Guidance</span>
                  <span>✓ Team Compatibility</span>
                </div>
              </div>
              
              <div className={styles.overviewCard}>
                <div className={styles.overviewIcon}>
                  <Target size={40} />
                </div>
                <h3>ReelProject</h3>
                <p>Multi-skill project showcase and verification platform</p>
                <div className={styles.overviewFeatures}>
                  <span>✓ Project-based Skills</span>
                  <span>✓ AI Verification</span>
                  <span>✓ Portfolio Building</span>
                </div>
              </div>
            </div>

            <div className={styles.overviewCTA}>
              <Button 
                size="large"
                onClick={handleGetStarted}
                className={styles.overviewButton}
              >
                Get Started Today
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default HomePage;
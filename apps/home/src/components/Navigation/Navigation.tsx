import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../ThemeProvider/ThemeProvider';
import { useAuthStore } from '../../store/authStore';
import { useSystemStore } from '../../store/systemStore';
import Button from '../Button/Button';
import styles from './Navigation.module.css';

interface NavigationProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onLoginClick, onSignUpClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, profile, logout } = useAuthStore();
  const { openAuthModal } = useSystemStore();
  const location = useLocation();
  const isReelHunterPage = location.pathname.startsWith('/reelhunter');

  const handleSignInClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      openAuthModal('login');
    }
  };

  const handleGetStartedClick = () => {
    if (onSignUpClick) {
      onSignUpClick();
    } else {
      openAuthModal('signup');
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo}>
          <div className={styles.navLogoIcon}>
            <Users size={20} />
          </div>
          ReelApps
        </Link>
        
        <ul className={styles.navLinks}>
          <li><Link to="/" className={styles.navLink}>Home</Link></li>
          {isAuthenticated && (
            <>
              {profile?.role !== 'recruiter' && (
                <li>
                  <Link to="/dashboard" className={styles.navLink}>
                    My Dashboard
                  </Link>
                </li>
              )}
              {profile?.role === 'candidate' && (
                <li><Link to="/reelskills" className={styles.navLink}>ReelSkills</Link></li>
              )}
              <li><Link to="/persona" className={styles.navLink}>ReelPersona</Link></li>
              {profile?.role === 'recruiter' && (
                <li><Link to="/reelhunter" className={styles.navLink}>ReelHunter</Link></li>
              )}
              {isReelHunterPage && profile?.role === 'recruiter' && (
                <>
                  <li>
                    <Link
                      to="/reelhunter#jobs"
                      className={`${styles.navLink} ${location.hash === '' || location.hash === '#jobs' ? styles.navLinkActive : ''}`}
                    >
                      Job Postings
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reelhunter#candidates"
                      className={`${styles.navLink} ${location.hash === '#candidates' ? styles.navLinkActive : ''}`}
                    >
                      Candidate Pool
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reelhunter#analytics"
                      className={`${styles.navLink} ${location.hash === '#analytics' ? styles.navLinkActive : ''}`}
                    >
                      Analytics
                    </Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
        
        <div className={styles.navActions}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          {isAuthenticated ? (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {profile?.first_name || user?.email}
              </span>
              <Button variant="outline" size="small" onClick={logout}>
                <LogOut size={16} />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="small" onClick={handleSignInClick} id="nav-login-button">
                Sign In
              </Button>
              <Button size="small" onClick={handleGetStartedClick}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
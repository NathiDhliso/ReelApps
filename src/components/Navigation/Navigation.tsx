import React from 'react';
import { Users, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../ThemeProvider/ThemeProvider';
import { useAuthStore } from '../../store/authStore';
import Button from '../Button/Button';
import styles from './Navigation.module.css';

interface NavigationProps {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onLoginClick, onSignUpClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, profile, logout } = useAuthStore();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <a href="/" className={styles.navLogo}>
          <div className={styles.navLogoIcon}>
            <Users size={20} />
          </div>
          ReelApps
        </a>
        
        <ul className={styles.navLinks}>
          <li><a href="/" className={styles.navLink}>Home</a></li>
          {isAuthenticated && (
            <>
              <li><a href="/dashboard" className={styles.navLink}>My Dashboard</a></li>
              <li><a href="/reelskills" className={styles.navLink}>ReelSkills</a></li>
              {profile?.role === 'recruiter' && (
                <li><a href="/reelhunter" className={styles.navLink}>ReelHunter</a></li>
              )}
            </>
          )}
          <li><a href="#features" className={styles.navLink}>Features</a></li>
          <li><a href="#pricing" className={styles.navLink}>Pricing</a></li>
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
              <Button variant="outline" size="small" onClick={onLoginClick}>
                Sign In
              </Button>
              <Button size="small" onClick={onSignUpClick}>
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
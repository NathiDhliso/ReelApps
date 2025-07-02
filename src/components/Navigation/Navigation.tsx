import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '../ThemeProvider/ThemeProvider';
import { useAuthStore } from '../../store/authStore';
import Button from '../Button/Button';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, profile, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to={isAuthenticated ? "/dashboard" : "/"} className={styles.navLogo}>
          <div className={styles.navLogoIcon}>
            <Users size={20} />
          </div>
          ReelApps
        </Link>
        
        <ul className={styles.navLinks}>
          {isAuthenticated && (
            <>
              <li>
                <Link to="/dashboard" className={styles.navLink}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/status" className={styles.navLink}>
                  Status
                </Link>
              </li>
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
              <Button variant="outline" size="small" onClick={() => navigate('/auth/login')} id="nav-login-button">
                Sign In
              </Button>
              <Button size="small" onClick={() => navigate('/auth/login')}>
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
import { useEffect } from 'react'
import ReelPersona from './components/ReelPersona'
import { useAuthStore } from './store/authStore'
import './index.css'

function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth store to check for existing sessions
    initialize();
    
    // Force dark mode on the document
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('gradient-background');
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="app-loading glass-effect" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--gradient-hero)',
        color: 'var(--text-primary)'
      }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(64, 224, 208, 0.2)',
          borderTop: '4px solid var(--brand-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <span style={{ 
          background: 'var(--gradient-text)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '18px',
          fontWeight: '600'
        }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="app" style={{ background: 'var(--gradient-hero)', minHeight: '100vh' }}>
      {/* Header with Gradient */}
      <header className="app-header" style={{
        background: 'var(--gradient-secondary)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div className="header-content">
          <h1 className="app-title gradient-text" style={{
            background: 'var(--gradient-text)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '28px',
            fontWeight: '700'
          }}>
            ReelPersona
          </h1>
          <p className="app-subtitle" style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            AI-Powered Personality Analysis
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <ReelPersona />
      </main>

      {/* Footer with Gradient */}
      <footer className="app-footer" style={{
        background: 'var(--gradient-card)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        marginTop: 'auto'
      }}>
        <div className="footer-content">
          <div className="footer-links">
            <a href="/" className="footer-link" style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}>
              ← Back to ReelApps
            </a>
            <span className="footer-separator" style={{ color: 'var(--text-secondary)' }}>|</span>
            <a href="/about" className="footer-link" style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              About
            </a>
            <span className="footer-separator" style={{ color: 'var(--text-secondary)' }}>|</span>
            <a href="/privacy" className="footer-link" style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Privacy
            </a>
          </div>
          <p className="footer-text" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Part of the <strong style={{
              background: 'var(--gradient-text)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>ReelApps</strong> ecosystem - Building your career reel, one app at a time.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
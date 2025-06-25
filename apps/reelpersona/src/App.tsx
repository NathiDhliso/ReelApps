import { useEffect } from 'react'
import ReelPersona from './components/ReelPersona'
import { useAuthStore } from './store/authStore'
import './index.css'

function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth store to check for existing sessions
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">ReelPersona</h1>
          <p className="app-subtitle">AI-Powered Personality Analysis</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <ReelPersona />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="/" className="footer-link">← Back to ReelApps</a>
            <span className="footer-separator">|</span>
            <a href="/about" className="footer-link">About</a>
            <span className="footer-separator">|</span>
            <a href="/privacy" className="footer-link">Privacy</a>
          </div>
          <p className="footer-text">
            Part of the <strong>ReelApps</strong> ecosystem - Building your career reel, one app at a time.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
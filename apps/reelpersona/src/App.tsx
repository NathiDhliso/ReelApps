<<<<<<< HEAD
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
=======
import React, { useEffect } from 'react'
>>>>>>> 28e8dfc (feat: Modernize ReelPersona chat UI, improve AI conversation, and enhance gradient background)
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
<<<<<<< HEAD
    <Router>
      <div className="App min-h-screen bg-[var(--bg-primary)]">
        <header className="bg-[var(--brand-primary)] text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                <span className="font-bold">R</span>
              </div>
              <h1 className="text-xl font-bold">ReelPersona</h1>
            </div>
            <nav>
              <a href="https://reelapps.co.za" className="text-white/90 hover:text-white">
                Back to ReelApps
              </a>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <ReelPersona />
        </main>
      </div>
    </Router>
=======
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
>>>>>>> 28e8dfc (feat: Modernize ReelPersona chat UI, improve AI conversation, and enhance gradient background)
  )
}

export default App
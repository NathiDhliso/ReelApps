import { useEffect, useState } from 'react'
import { useAuthStore } from '@reelapps/auth'
import ReelHunter from './components/ReelHunter'
import './index.css'

const MAIN_URL = import.meta.env.VITE_APP_MAIN_URL || 'https://www.reelapps.co.za/';

function App() {
  const { isAuthenticated, profile, initialize, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      await initialize();
      setIsInitializing(false);
    };
    initializeApp();
    
    // Force dark mode and gradient background
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('gradient-background');
  }, [initialize]);

  // Show loading while initializing
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading ReelHunter...</p>
        </div>
      </div>
    );
  }

  // Redirect to main app if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="bg-surface rounded-lg border border-surface p-8">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Authentication Required</h1>
            <p className="text-text-secondary mb-6">
              You need to be signed in to access ReelHunter. Please authenticate through the main ReelApps portal.
            </p>
            <a 
              href={MAIN_URL}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Go to ReelApps
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has access to ReelHunter (recruiters only)
  if (profile?.role === 'candidate') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="bg-surface rounded-lg border border-surface p-8">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Access Restricted</h1>
            <p className="text-text-secondary mb-6">
              ReelHunter is only available for recruiters. Candidates should use ReelCV and ReelSkills to showcase their profiles.
            </p>
            <a 
              href={MAIN_URL}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Back to ReelApps
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                ReelHunter
              </h1>
              <p className="text-sm text-text-secondary">
                AI-Powered Talent Acquisition
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-text-secondary text-sm">
                {profile?.first_name || profile?.email}
              </span>
              <a 
                href={MAIN_URL}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Back to ReelApps
              </a>
            </div>
          </div>
        </div>
      </header>
      <main>
        <ReelHunter />
      </main>
    </div>
  )
}

export default App 
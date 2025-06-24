import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider';
import { useAuthStore } from './store/authStore';
import { useSystemStore } from './store/systemStore';
import Navigation from './components/Navigation/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import CandidateDashboard from './components/ReelCV/CandidateDashboard';
import ReelCVShowcase from './components/ReelCV/ReelCVShowcase';
import ReelSkills from './components/ReelApps/ReelSkills';
import ReelHunter from './components/ReelHunter/ReelHunter';
import AuthModal from './components/Auth/AuthModal';
import SystemNotifications from './components/SystemNotifications/SystemNotifications';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import PasswordReset from './pages/PasswordReset';
import './styles/globals.css';

function App() {
  const { isAuthenticated, initialize, isLoading, profile } = useAuthStore();
  const { startOnboarding } = useSystemStore();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    initialize();
    // Start background token refresh once app mounts
    import('./store/authStore').then(mod => {
      mod.startSessionWatcher();
    });
  }, [initialize]);

  useEffect(() => {
    // Check if user should see onboarding
    if (isAuthenticated && profile) {
      const hasCompletedOnboarding = localStorage.getItem('reelApps_onboarding_completed');
      const hasSkippedOnboarding = localStorage.getItem('reelApps_onboarding_skipped');
      
      if (!hasCompletedOnboarding && !hasSkippedOnboarding) {
        // Delay onboarding to allow UI to settle
        setTimeout(() => {
          startOnboarding();
        }, 1500);
      }
    }
  }, [isAuthenticated, profile, startOnboarding]);

  if (isLoading) {
    return (
      <ThemeProvider>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--bg-primary)'
        }}>
          <div className="animate-pulse" style={{ color: 'var(--text-primary)' }}>
            Loading ReelApps...
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const handleAuthSuccess = () => {
    setShowAuth(false);
  };

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuth(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setShowAuth(true);
  };

  if (showAuth && !isAuthenticated) {
    return (
      <ThemeProvider>
        <AuthModal 
          onSuccess={handleAuthSuccess}
          initialMode={authMode}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
          <SystemNotifications />
          <OnboardingFlow />
          
          <Routes>
            {/* Public routes */}
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route 
              path="/reelcv/:candidateId" 
              element={<ReelCVShowcase candidateId={window.location.pathname.split('/')[2]} />} 
            />
            
            {/* Main Application with Navigation */}
            <Route 
              path="/*" 
              element={
                <>
                  <Navigation 
                    onLoginClick={handleLoginClick}
                    onSignUpClick={handleSignUpClick}
                  />
                  <main>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route 
                        path="/dashboard" 
                        element={
                          isAuthenticated ? <CandidateDashboard /> : <Navigate to="/" />
                        } 
                      />
                      <Route 
                        path="/reelskills" 
                        element={
                          isAuthenticated ? <ReelSkills /> : <Navigate to="/" />
                        } 
                      />
                      <Route 
                        path="/reelhunter" 
                        element={
                          isAuthenticated ? <ReelHunter /> : <Navigate to="/" />
                        } 
                      />
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                  </main>
                </>
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
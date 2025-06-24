import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider';
import { useAuthStore } from './store/authStore';
import { useSystemStore } from './store/systemStore';
import { testSupabaseConnection } from './lib/supabase';
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
  const { startOnboarding, addNotification } = useSystemStore();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [connectionTested, setConnectionTested] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Starting app initialization...');
        
        // Test Supabase connection first
        const connectionOk = await testSupabaseConnection();
        if (!connectionOk) {
          addNotification({
            type: 'error',
            title: 'Connection Error',
            message: 'Unable to connect to the database. Please check your internet connection.',
            persistent: true
          });
        }
        setConnectionTested(true);
        
        // Initialize auth
        await initialize();
        
        // Start background token refresh
        import('./store/authStore').then(mod => {
          mod.startSessionWatcher();
        });
        
        console.log('App initialization completed');
      } catch (error) {
        console.error('App initialization failed:', error);
        addNotification({
          type: 'error',
          title: 'Initialization Error',
          message: 'Failed to initialize the application. Please refresh the page.',
          persistent: true
        });
      }
    };

    initializeApp();
  }, [initialize, addNotification]);

  useEffect(() => {
    // Check if user should see onboarding
    if (isAuthenticated && profile && connectionTested) {
      const hasCompletedOnboarding = localStorage.getItem('reelApps_onboarding_completed');
      const hasSkippedOnboarding = localStorage.getItem('reelApps_onboarding_skipped');
      
      if (!hasCompletedOnboarding && !hasSkippedOnboarding) {
        // Delay onboarding to allow UI to settle
        setTimeout(() => {
          startOnboarding();
        }, 1500);
      }
    }
  }, [isAuthenticated, profile, connectionTested, startOnboarding]);

  if (isLoading || !connectionTested) {
    return (
      <ThemeProvider>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="animate-pulse" style={{ color: 'var(--text-primary)', fontSize: '18px' }}>
            {!connectionTested ? 'Connecting to ReelApps...' : 'Loading ReelApps...'}
          </div>
          {!connectionTested && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Testing database connection...
            </div>
          )}
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
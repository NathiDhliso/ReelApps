import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider';
import { useAuthStore, testSupabaseConnection } from './lib/auth';
import { useSystemStore } from './store/systemStore';
import Navigation from './components/Navigation/Navigation';
import HomePage from './components/HomePage/HomePage';
import Dashboard from './components/Dashboard/Dashboard';
import CandidateDashboard from './components/ReelCV/CandidateDashboard';
import ReelCVShowcase from './components/ReelCV/ReelCVShowcase';
import ReelSkills from './components/ReelApps/ReelSkills';
import ReelHunter from './components/ReelHunter/ReelHunter';
import ReelPersona from './components/ReelPersona/ReelPersona';
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
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    // Force dark mode and gradient background on app load
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('gradient-background');
    
    const initializeApp = async () => {
      try {
        console.log('🚀 Starting ReelApps initialization...');
        
        // Test Supabase connection first
        console.log('🔗 Testing database connection...');
        const connectionOk = await testSupabaseConnection();
        
        if (!connectionOk) {
          console.error('❌ Database connection failed');
          addNotification({
            type: 'error',
            title: 'Connection Error',
            message: 'Unable to connect to the database. Please check your internet connection.',
            persistent: true
          });
          setInitializationComplete(true); // Still allow app to load
          return;
        }
        
        console.log('✅ Database connection successful');
        
        // Initialize auth
        console.log('🔐 Initializing authentication...');
        await initialize();
        
        // Start background token refresh
        import('./store/authStore').then(mod => {
          mod.startSessionWatcher();
        });
        
        console.log('✅ App initialization completed successfully');
        setInitializationComplete(true);
        
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        addNotification({
          type: 'error',
          title: 'Initialization Error',
          message: 'Failed to initialize the application. Please refresh the page.',
          persistent: true
        });
        setInitializationComplete(true); // Still allow app to load
      } finally {
        console.log('ℹ️ Initialization flow ended, setting flag');
        // Ensure splash screen is always dismissed even if init partially fails
        setInitializationComplete(true);
      }
    };

    initializeApp();
  }, [initialize, addNotification]);

  useEffect(() => {
    // Check if user should see onboarding
    if (isAuthenticated && profile && initializationComplete) {
      const hasCompletedOnboarding = localStorage.getItem('reelApps_onboarding_completed');
      const hasSkippedOnboarding = localStorage.getItem('reelApps_onboarding_skipped');
      
      if (!hasCompletedOnboarding && !hasSkippedOnboarding) {
        // Delay onboarding to allow UI to settle
        setTimeout(() => {
          startOnboarding();
        }, 1500);
      }
    }
  }, [isAuthenticated, profile, initializationComplete, startOnboarding]);

  // Show loading screen while initializing
  if (!initializationComplete || isLoading) {
    return (
      <ThemeProvider>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--gradient-hero)',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div className="loading-spinner" style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(64, 224, 208, 0.2)',
            borderTop: '4px solid var(--brand-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ 
            background: 'var(--gradient-text)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '24px',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            {!initializationComplete ? 'Initializing ReelApps...' : 'Loading...'}
          </div>
          <div style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '16px',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            {!initializationComplete ? 'Setting up your AI-powered career workspace...' : 'Almost ready for your career journey...'}
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
                      <Route index element={<HomePage />} />
                      <Route 
                        path="/dashboard"
                        element={
                          isAuthenticated ? (
                            profile?.role === 'candidate' ? <CandidateDashboard /> : <Dashboard />
                          ) : (
                            <Navigate to="/" />
                          )
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
                      <Route 
                        path="/persona" 
                        element={
                          isAuthenticated ? <ReelPersona /> : <Navigate to="/" />
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
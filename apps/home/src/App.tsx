import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider';
import { useAuthStore } from './lib/auth';
import { testSupabaseConnection } from './lib/supabase';
import HomePage from './components/HomePage/HomePage';
import Dashboard from './components/Dashboard/Dashboard';
import AuthModal from './components/Auth/AuthModal';
import PasswordReset from './pages/PasswordReset';
import StatusDashboard from './components/StatusDashboard/StatusDashboard';
import SystemNotifications from './components/SystemNotifications/SystemNotifications';
import './styles/globals.css';

// Lazy load app components
const ReelCVDashboard = lazy(() => import('./components/ReelCV/CandidateDashboard'));
const ReelPersonaComponent = lazy(() => import('./components/ReelPersona/ReelPersona'));
const ReelHunterComponent = lazy(() => import('./components/ReelHunter/ReelHunter'));
const ReelSkillsComponent = lazy(() => import('./components/ReelApps/ReelSkills'));

// Loading component for lazy-loaded apps
const AppLoading: React.FC<{ appName: string }> = ({ appName }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-text-secondary">Loading {appName}...</p>
    </div>
  </div>
);

// App wrapper with authentication check
const AppWrapper: React.FC<{ 
  children: React.ReactNode, 
  requiredRole?: 'candidate' | 'recruiter' | 'both',
  appName: string 
}> = ({ children, requiredRole = 'both', appName }) => {
  const { isAuthenticated, profile } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="bg-surface rounded-lg border border-surface p-8">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Authentication Required</h1>
            <p className="text-text-secondary mb-6">
              You need to be signed in to access {appName}. Please authenticate through the main ReelApps portal.
            </p>
            <a 
              href="https://www.reelapps.co.za"
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Go to ReelApps
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole !== 'both' && profile?.role !== requiredRole) {
    const accessMessage = requiredRole === 'candidate' 
      ? 'This application is only available for candidates.'
      : 'This application is only available for recruiters.';

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="bg-surface rounded-lg border border-surface p-8">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Access Restricted</h1>
            <p className="text-text-secondary mb-6">{accessMessage}</p>
            <a 
              href="https://www.reelapps.co.za"
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
              <h1 className="text-xl font-semibold text-text-primary">{appName}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-text-secondary text-sm">
                {profile?.first_name || profile?.email}
              </span>
              <a 
                href="https://www.reelapps.co.za"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Back to ReelApps
              </a>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

function App() {
  const { initialize } = useAuthStore();
  const [initializationComplete, setInitializationComplete] = useState(false);

  // Check for app parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  const requestedApp = urlParams.get('app');

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Starting ReelApps initialization...');
      
      try {
        console.log('🔗 Testing database connection...');
        await testSupabaseConnection();
        console.log('✅ Database connection successful');
        
        console.log('🔐 Initializing authentication...');
        await initialize();
        
        // Start background token refresh
        import('./store/authStore').then(mod => {
          mod.startSessionWatcher();
        });
        
        console.log('✅ App initialization completed successfully');
      } catch (error) {
        console.error('❌ Initialization failed:', error);
      } finally {
        setInitializationComplete(true);
        console.log('ℹ️ Initialization flow ended, setting flag');
      }
    };

    initializeApp();
  }, [initialize]);

  // Show loading screen during initialization
  if (!initializationComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Initializing ReelApps...</p>
        </div>
      </div>
    );
  }

  // If app parameter is present, render the specific app
  if (requestedApp) {
    return (
      <ThemeProvider>
        <Suspense fallback={<AppLoading appName={requestedApp} />}>
          {requestedApp === 'reelcv' && (
            <AppWrapper requiredRole="candidate" appName="ReelCV">
              <ReelCVDashboard />
            </AppWrapper>
          )}
          {requestedApp === 'reelpersona' && (
            <AppWrapper requiredRole="both" appName="ReelPersona">
              <ReelPersonaComponent />
            </AppWrapper>
          )}
          {requestedApp === 'reelhunter' && (
            <AppWrapper requiredRole="recruiter" appName="ReelHunter">
              <ReelHunterComponent />
            </AppWrapper>
          )}
          {requestedApp === 'reelskills' && (
            <AppWrapper requiredRole="candidate" appName="ReelSkills">
              <ReelSkillsComponent />
            </AppWrapper>
          )}
          {requestedApp === 'reelproject' && (
            <AppWrapper requiredRole="both" appName="ReelProject">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-text-primary mb-4">ReelProject</h2>
                <p className="text-text-secondary">Coming Soon - Project collaboration platform</p>
              </div>
            </AppWrapper>
          )}
          {!['reelcv', 'reelpersona', 'reelhunter', 'reelskills', 'reelproject'].includes(requestedApp) && (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-text-primary mb-4">App Not Found</h1>
                <p className="text-text-secondary mb-6">The requested application could not be found.</p>
                <a 
                  href="https://www.reelapps.co.za"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Back to ReelApps
                </a>
              </div>
            </div>
          )}
        </Suspense>
      </ThemeProvider>
    );
  }

  // Otherwise render the main ReelApps interface
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <SystemNotifications />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/status" element={<StatusDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AuthModal />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
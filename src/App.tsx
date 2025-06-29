import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider';
import { getMainAppUrl } from './lib/config';
import { useAuthStore, startSessionWatcher } from './store/authStore';
// Note: AppWrapper will be imported and used in the main component
import HomePage from './components/HomePage/HomePage';
import Dashboard from './components/Dashboard/Dashboard';
import AuthPage from './pages/AuthPage';
import PasswordReset from './pages/PasswordReset';
import StatusDashboard from './components/StatusDashboard/StatusDashboard';
import SystemNotifications from './components/SystemNotifications/SystemNotifications';
import Navigation from './components/Navigation/Navigation';
import './styles/globals.css';
import { testSupabaseConnection, initializeSupabase } from '@reelapps/auth';

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

// App wrapper with authentication check - renamed to SubAppWrapper
const SubAppWrapper: React.FC<{ 
  children: React.ReactNode, 
  requiredRole?: 'candidate' | 'recruiter' | 'both',
  appName: string 
}> = ({ children, requiredRole = 'both', appName }) => {
  const [authStore, setAuthStore] = useState<any>(null);
  const mainUrl = getMainAppUrl();

  // Dynamically import auth store after initialization
  useEffect(() => {
    import('./lib/auth').then(({ useAuthStore }) => {
      setAuthStore({ useAuthStore });
    });
  }, []);

  if (!authStore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading authentication...</p>
        </div>
      </div>
    );
  }

  const { isAuthenticated, profile } = authStore.useAuthStore();

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
              href={mainUrl}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Go to ReelApps
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check role-based access - Admin users have access to all apps
  if (requiredRole !== 'both' && profile?.role !== requiredRole && profile?.role !== 'admin') {
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
              href={mainUrl}
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
                {profile?.first_name || profile?.email} ({profile?.role})
              </span>
              <a 
                href={mainUrl}
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

// Fixed protected route component that doesn't violate hooks rules
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

// Home route component that redirects based on auth status
const HomeRoute: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />;
};

// Component to conditionally render navigation
const AppLayout: React.FC = () => {
  const location = useLocation();
  const hideNavigation = location.pathname.startsWith('/auth');

  return (
    <div className="App">
      {!hideNavigation && <Navigation />}
      <SystemNotifications />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/auth/:mode" element={<AuthPage />} />
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/status" element={<StatusDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// Create initializeAuth function using the available functions
const initializeAuth = async () => {
  const { initialize } = useAuthStore.getState();
  await initialize();
  startSessionWatcher();
};

function App() {
  const [authStore, setAuthStore] = useState<any>(null);
  const [initializationComplete, setInitializationComplete] = useState(false);

  console.log('🏁 App component rendering, initializationComplete:', initializationComplete);

  // Determine which sub-app should load
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  let requestedApp: string | null = urlParams.get('app');

  // Fallback: infer from custom domain (e.g. reelhunter.co.za)
  if (!requestedApp && typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('reelcv')) requestedApp = 'reelcv';
    else if (host.includes('reelhunter')) requestedApp = 'reelhunter';
    else if (host.includes('reelpersona')) requestedApp = 'reelpersona';
    else if (host.includes('reelskills')) requestedApp = 'reelskills';
    else if (host.includes('reelproject')) requestedApp = 'reelproject';
  }

  console.log('🔍 Requested app:', requestedApp || 'none (main portal)');

  useEffect(() => {
    console.log('🎬 Starting initialization process... (This will now run only ONCE)');
    
    const initializeApp = async () => {
      console.log('🚀 Starting ReelApps initialization...');
      
      try {
        console.log('🔐 Initializing Supabase client...');
        // Ensure Supabase is initialized first
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        console.log('🔑 Environment variables check:');
        console.log('  - VITE_SUPABASE_URL present:', !!supabaseUrl);
        console.log('  - VITE_SUPABASE_ANON_KEY present:', !!supabaseAnonKey);
        console.log('  - VITE_SUPABASE_URL length:', supabaseUrl?.length || 0);
        console.log('  - VITE_SUPABASE_ANON_KEY length:', supabaseAnonKey?.length || 0);
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing Supabase environment variables');
        }
        
        // Initialize Supabase client
        initializeSupabase(supabaseUrl, supabaseAnonKey);
        
        console.log('🔗 Testing database connection...');
        await testSupabaseConnection();
        console.log('✅ Database connection successful');
        
        // Initialize authentication
        console.log('🔐 Initializing authentication...');
        await initializeAuth();
        console.log('✅ Authentication initialized successfully');
        
        setAuthStore({ useAuthStore });
        
        console.log('✅ App initialization completed successfully');
      } catch (error) {
        console.error('❌ Initialization failed:', error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      } finally {
        console.log('🏁 Setting initializationComplete to true...');
        setInitializationComplete(true);
        console.log('ℹ️ Initialization flow ended, setting flag');
      }
    };

    initializeApp();
  }, []); // ✅ CORRECTED: Use empty dependency array for one-time initialization

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

  // If auth store hasn't been loaded yet, show loading
  if (!authStore) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading authentication...</p>
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
            <SubAppWrapper requiredRole="candidate" appName="ReelCV">
              <ReelCVDashboard />
            </SubAppWrapper>
          )}
          {requestedApp === 'reelpersona' && (
            <SubAppWrapper requiredRole="both" appName="ReelPersona">
              <ReelPersonaComponent />
            </SubAppWrapper>
          )}
          {requestedApp === 'reelhunter' && (
            <SubAppWrapper requiredRole="recruiter" appName="ReelHunter">
              <ReelHunterComponent />
            </SubAppWrapper>
          )}
          {requestedApp === 'reelskills' && (
            <SubAppWrapper requiredRole="candidate" appName="ReelSkills">
              <ReelSkillsComponent />
            </SubAppWrapper>
          )}
          {requestedApp === 'reelproject' && (
            <SubAppWrapper requiredRole="both" appName="ReelProject">
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-text-primary mb-4">ReelProject</h2>
                <p className="text-text-secondary">Coming Soon - Project collaboration platform</p>
              </div>
            </SubAppWrapper>
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
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider';
import { getMainAppUrl, apps } from './lib/config';
import { useAuthStore, startSessionWatcher } from './store/authStore';
// Note: AppWrapper will be imported and used in the main component
import HomePage from './components/HomePage/HomePage';
import Dashboard from './components/Dashboard/Dashboard';
import AuthPage from './pages/AuthPage';
import PasswordReset from './pages/PasswordReset';
import SSOPage from './pages/SSOPage';
import StatusDashboard from './components/StatusDashboard/StatusDashboard';
import SystemNotifications from './components/SystemNotifications/SystemNotifications';
import Navigation from './components/Navigation/Navigation';
import './styles/globals.css';
import { testSupabaseConnection, initializeSupabase } from '@reelapps/auth';

// App redirect component for proper app navigation
const AppRedirect: React.FC<{ 
  appId: string, 
  requiredRole?: 'candidate' | 'recruiter' | 'both',
  appName: string 
}> = ({ appId, requiredRole = 'both', appName }) => {
  const [authStore, setAuthStore] = useState<any>(null);
  const mainUrl = getMainAppUrl();

  // Dynamically import auth store after initialization
  useEffect(() => {
    import('./lib/auth').then(({ useAuthStore }) => {
      setAuthStore({ useAuthStore });
    });
  }, []);

  useEffect(() => {
    if (authStore) {
      const { isAuthenticated, profile } = authStore.useAuthStore();
      
      if (!isAuthenticated) {
        console.log(`❌ ${appName}: User not authenticated, redirecting to main portal`);
        window.location.href = mainUrl;
        return;
      }

      // Check role-based access - Admin users have access to all apps
      if (requiredRole !== 'both' && profile?.role !== requiredRole && profile?.role !== 'admin') {
        console.log(`❌ ${appName}: User role ${profile?.role} not permitted, required: ${requiredRole}`);
        window.location.href = mainUrl;
        return;
      }

      // Find the app configuration
      const appConfig = apps.find(app => app.id === appId);
      if (!appConfig) {
        console.error(`❌ ${appName}: App configuration not found for ${appId}`);
        window.location.href = mainUrl;
        return;
      }

      console.log(`✅ ${appName}: Redirecting authenticated user to ${appConfig.url}`);
      
      // Add SSO token to URL for cross-domain authentication
      const ssoToken = localStorage.getItem('ssoToken');
      const separator = appConfig.url.includes('?') ? '&' : '?';
      const targetUrl = ssoToken 
        ? `${appConfig.url}${separator}ssoToken=${encodeURIComponent(ssoToken)}`
        : appConfig.url;
      
      window.location.href = targetUrl;
    }
  }, [authStore, appId, appName, requiredRole, mainUrl]);

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Redirecting to {appName}...</p>
      </div>
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
        <Route path="/auth/sso" element={<SSOPage />} />
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
    // Map app names to proper app IDs and roles
    const appMap: Record<string, {id: string, role: 'candidate' | 'recruiter' | 'both', name: string}> = {
      'reelcv': { id: 'reel-cv', role: 'candidate', name: 'ReelCV' },
      'reelhunter': { id: 'reel-hunter', role: 'recruiter', name: 'ReelHunter' },
      'reelskills': { id: 'reel-skills', role: 'candidate', name: 'ReelSkills' },
      'reelpersona': { id: 'reel-persona', role: 'both', name: 'ReelPersona' },
      'reelproject': { id: 'reel-project', role: 'both', name: 'ReelProject' }
    };

    const appConfig = appMap[requestedApp];
    if (appConfig) {
      return (
        <ThemeProvider>
          <AppRedirect 
            appId={appConfig.id} 
            requiredRole={appConfig.role} 
            appName={appConfig.name} 
          />
        </ThemeProvider>
      );
    } else {
      return (
        <ThemeProvider>
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-text-primary mb-4">App Not Found</h1>
              <p className="text-text-secondary mb-6">The requested application "{requestedApp}" could not be found.</p>
              <a 
                href={getMainAppUrl()}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                Back to ReelApps
              </a>
            </div>
          </div>
        </ThemeProvider>
      );
    }
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
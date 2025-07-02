import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider/ThemeProvider';
import { testSupabaseConnection, initializeSupabase, ssoManager } from '@reelapps/auth';
import { useAuthStore, startSessionWatcher } from './lib/auth';
import { AuthModalWrapper } from './components/Auth/AuthModalWrapper';
import HomePage from './components/HomePage/HomePage';
import Dashboard from './components/Dashboard/Dashboard';
import StatusDashboard from './components/StatusDashboard/StatusDashboard';
import SystemNotifications from './components/SystemNotifications/SystemNotifications';
import Navigation from './components/Navigation/Navigation';
import './styles/globals.css';

// Protected route component using modal authentication
const ProtectedRoute: React.FC = () => {
  return (
    <AuthModalWrapper>
      <Outlet />
    </AuthModalWrapper>
  );
};

// Main app component with modal-based authentication
function AppWithModalAuth() {
  const [initializationComplete, setInitializationComplete] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 Starting ReelApps initialization with modal auth...');
      
      try {
        // Initialize Supabase
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing Supabase environment variables');
        }
        
        initializeSupabase(supabaseUrl, supabaseAnonKey);
        
        // Test connection
        await testSupabaseConnection();
        console.log('✅ Database connection successful');
        
        // Initialize auth store (no navigation will occur)
        await useAuthStore.getState().initialize();
        console.log('✅ Authentication store initialized');
        
        // Start background token refresh
        startSessionWatcher();
        console.log('✅ Session watcher started');
        
        // Only initialize SSO on subdomains, not on the main domain
        const currentDomain = window.location.hostname;
        const isSubdomain = currentDomain !== 'reelapps.co.za' && 
                           currentDomain !== 'www.reelapps.co.za' &&
                           currentDomain.endsWith('.reelapps.co.za');
        
        if (isSubdomain) {
          console.log('🔄 On subdomain, initializing SSO...');
          // Attempt to restore or establish SSO session
          await ssoManager.initializeSSO();
          console.log('✅ SSO initialization complete');
        } else {
          console.log('🏠 On main domain, skipping SSO initialization');
        }
        
      } catch (error) {
        console.error('❌ Initialization failed:', error);
      } finally {
        setInitializationComplete(true);
      }
    };

    initializeApp();
  }, []);

  // Show loading during initialization
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

  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Navigation />
          <SystemNotifications />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />} />
            
            {/* Protected routes wrapped with AuthModalWrapper */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/status" element={<StatusDashboard />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default AppWithModalAuth; 
/// <reference types="vite/client" />
import React, { useEffect, useState } from 'react';
import { useAuthStore, initializeSupabase } from '@reelapps/auth';
import { getMainAppUrl } from '@reelapps/config';
import CandidateDashboard from './CandidateDashboard';
import './index.css';

function App() {
  const { isAuthenticated, profile, initialize, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const mainUrl = getMainAppUrl();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing ReelCV...');
        
        // Initialize Supabase client first
        console.log('🔧 Initializing Supabase client...');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing Supabase environment variables');
        }
        
        initializeSupabase(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase client initialized');
        
        // Now initialize auth store - this will handle automatic redirects
        console.log('🔐 Initializing auth store...');
        await initialize();
        console.log('✅ ReelCV initialization complete');
      } catch (error) {
        console.error('❌ ReelCV initialization failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
      } finally {
        setIsInitializing(false);
      }
    };
    initializeApp();
  }, []); // ✅ CORRECTED: Use empty dependency array for one-time initialization

  // Show loading while initializing
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading ReelCV...</p>
        </div>
      </div>
    );
  }

  // Show error if initialization failed
  if (initError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="bg-surface rounded-lg border border-surface p-8">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Initialization Error</h1>
            <p className="text-text-secondary mb-6">
              Failed to initialize ReelCV: {initError}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Note: Authentication redirect is handled automatically by the auth store
  // If we reach this point and user is not authenticated, there was an error
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="bg-surface rounded-lg border border-surface p-8">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Authentication Required</h1>
            <p className="text-text-secondary mb-6">
              Redirecting to ReelApps for authentication...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has access to ReelCV (candidates and admins only)
  if (profile?.role === 'recruiter') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="bg-surface rounded-lg border border-surface p-8">
            <h1 className="text-2xl font-bold text-text-primary mb-4">Access Restricted</h1>
            <p className="text-text-secondary mb-6">
              ReelCV is only available for candidates. Recruiters should use ReelHunter to view candidate profiles.
            </p>
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
      <nav className="bg-surface border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-text-primary">ReelCV</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-text-secondary text-sm">
                {profile?.first_name || profile?.email} ({profile?.role})
              </span>
              <a 
                href={mainUrl}
                className="text-text-secondary hover:text-text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Back to ReelApps
              </a>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        <CandidateDashboard />
      </main>
    </div>
  );
}

export default App; 
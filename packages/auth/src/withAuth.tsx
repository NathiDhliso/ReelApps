import React, { useEffect, useState } from 'react';
import { initializeSupabase } from './supabase';
import { useAuthStore } from './authStore';

/**
 * Higher-Order Component (HOC) for handling authentication initialization
 * across all ReelApps. This centralizes the authentication logic and prevents
 * code duplication across individual app entry points.
 * 
 * @param WrappedComponent - The component to wrap with authentication
 * @param appName - Name of the app for logging purposes
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  appName: string
) {
  return function AuthenticatedComponent(props: P) {
    const [initializationComplete, setInitializationComplete] = useState(false);
    const [initializationError, setInitializationError] = useState<string | null>(null);
    const initialize = useAuthStore((state) => state.initialize);

    useEffect(() => {
      const initializeAuth = async () => {
        try {
          console.log(`🚀 ${appName}: Starting authentication initialization...`);
          
          // Get environment variables
          const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
          const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

          if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing required environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
          }

          console.log(`🔐 ${appName}: Initializing Supabase client...`);
          
          // Initialize Supabase client first
          const supabaseClient = initializeSupabase(supabaseUrl, supabaseAnonKey);
          
          if (!supabaseClient) {
            throw new Error('Failed to initialize Supabase client');
          }

          console.log(`✅ ${appName}: Supabase client initialized successfully`);
          console.log(`🔑 ${appName}: Initializing authentication store...`);

          // Initialize auth store
          await initialize();

          console.log(`✅ ${appName}: Authentication initialization complete`);
          setInitializationComplete(true);
        } catch (error) {
          console.error(`❌ ${appName}: Authentication initialization failed:`, error);
          setInitializationError(error instanceof Error ? error.message : 'Unknown error');
          setInitializationComplete(true); // Still allow app to render
        }
      };

      initializeAuth();
    }, [initialize]);

    // Loading state
    if (!initializationComplete) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Initializing {appName}...</p>
            <p className="text-gray-400 text-sm mt-2">Setting up authentication...</p>
          </div>
        </div>
      );
    }

    // Error state
    if (initializationError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-white text-xl font-bold mb-2">Initialization Error</h1>
            <p className="text-gray-400 mb-4">{initializationError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    // Render the wrapped component
    return <WrappedComponent {...props} />;
  };
}

/**
 * Props for the AuthWrapper component
 */
interface AuthWrapperProps {
  children: React.ReactNode;
  appName: string;
}

/**
 * Component wrapper for authentication initialization
 * Alternative to HOC pattern for apps that prefer component composition
 */
export function AuthWrapper({ children, appName }: AuthWrapperProps) {
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log(`🚀 ${appName}: Starting authentication initialization...`);
        
        // Get environment variables
        const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
        const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing required environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
        }

        console.log(`🔐 ${appName}: Initializing Supabase client...`);
        
        // Initialize Supabase client first
        const supabaseClient = initializeSupabase(supabaseUrl, supabaseAnonKey);
        
        if (!supabaseClient) {
          throw new Error('Failed to initialize Supabase client');
        }

        console.log(`✅ ${appName}: Supabase client initialized successfully`);
        console.log(`🔑 ${appName}: Initializing authentication store...`);

        // Initialize auth store
        await initialize();

        console.log(`✅ ${appName}: Authentication initialization complete`);
        setInitializationComplete(true);
      } catch (error) {
        console.error(`❌ ${appName}: Authentication initialization failed:`, error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown error');
        setInitializationComplete(true); // Still allow app to render
      }
    };

    initializeAuth();
  }, [initialize, appName]);

  // Loading state
  if (!initializationComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing {appName}...</p>
          <p className="text-gray-400 text-sm mt-2">Setting up authentication...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (initializationError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-xl font-bold mb-2">Initialization Error</h1>
          <p className="text-gray-400 mb-4">{initializationError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

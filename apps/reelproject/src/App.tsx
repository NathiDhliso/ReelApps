import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, BrowserRouter } from 'react-router-dom'
import { useAuthStore } from '@reelapps/auth'
import CreateProjectForm from './components/CreateProjectForm'
import ProjectDetailView from './components/ProjectDetailView'
import './App.css'

const MAIN_URL = import.meta.env.VITE_APP_MAIN_URL || 'https://www.reelapps.co.za/';

interface Project {
  id: string;
  name: string;
  description: string;
  analysis?: any;
  plan?: string[];
  created_at: string;
}

function AppContent() {
  const navigate = useNavigate();

  const handleProjectCreated = (project: Project) => {
    console.log('Project created:', project);
    // Navigate to project detail view with the project data
    navigate(`/${project.id}`, { 
      state: { project } 
    });
  };

  const handleClose = () => {
    // Navigate back to create form
    console.log('Form closed');
    navigate('/');
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <CreateProjectForm 
            onClose={handleClose}
            onProjectCreated={handleProjectCreated}
          />
        } 
      />
      <Route 
        path="/:projectId" 
        element={
          <ProjectDetailView />
        } 
      />
    </Routes>
  );
}

function App() {
  const { isAuthenticated, profile, initialize, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      await initialize();
      setIsInitializing(false);
    };
    initializeApp();
  }, [initialize]);

  // Show loading while initializing
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading ReelProject...</p>
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
              You need to be signed in to access ReelProject. Please authenticate through the main ReelApps portal.
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-text-primary">
                ReelProject
              </h1>
              <p className="text-sm text-text-secondary">
                AI-Powered Project Analysis
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
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </main>
    </div>
  )
}

export default App

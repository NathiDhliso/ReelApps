import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, BrowserRouter } from 'react-router-dom'
import { useAuthStore, initializeSupabase } from '@reelapps/auth'
import { getMainAppUrl } from '@reelapps/config'
import CreateProjectForm from './components/CreateProjectForm'
import ProjectDetailView from './components/ProjectDetailView'
import './App.css'

interface Project {
  id: string;
  name: string;
  description: string;
  analysis?: any;
  plan?: string[];
  created_at: string;
}

function ProjectListView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  const addProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-4">ReelProject</h1>
          <p className="text-text-secondary">Collaborative project management for modern teams</p>
        </div>

        <div className="grid gap-6">
          <CreateProjectForm onProjectCreated={addProject} />
          
          {projects.length > 0 && (
            <div className="bg-surface rounded-lg border border-surface p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Your Projects</h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    className="p-4 border border-surface rounded-lg hover:bg-surface-hover cursor-pointer transition-colors"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <h3 className="font-semibold text-text-primary">{project.name}</h3>
                    <p className="text-text-secondary text-sm">{project.description}</p>
                    <p className="text-text-tertiary text-xs mt-2">
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated, profile, initialize, isLoading } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const mainUrl = getMainAppUrl();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing ReelProject...');
        
        // Initialize Supabase client first
        console.log('🔧 Initializing Supabase client...');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing Supabase environment variables');
        }
        
        initializeSupabase(supabaseUrl, supabaseAnonKey);
        console.log('✅ Supabase client initialized');
        
        // Now initialize auth store
        console.log('🔐 Initializing auth store...');
        await initialize();
        console.log('✅ ReelProject initialization complete');
      } catch (error) {
        console.error('❌ ReelProject initialization failed:', error);
      } finally {
        setIsInitializing(false);
      }
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

  // ReelProject is available for both candidates, recruiters, and admins
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface border-b border-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-text-primary">ReelProject</h1>
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
      </nav>
      
      <main>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProjectListView />} />
            <Route path="/project/:id" element={<ProjectDetailView />} />
          </Routes>
        </BrowserRouter>
      </main>
    </div>
  );
}

export default App

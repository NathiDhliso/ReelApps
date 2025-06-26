import { Routes, Route, useNavigate } from 'react-router-dom'
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

function App() {
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

  const handleBackToCreate = () => {
    navigate('/');
  };

  return (
    <div className="App">
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
            <ProjectDetailView 
              onBackToCreate={handleBackToCreate}
            />
          } 
        />
      </Routes>
    </div>
  )
}

export default App

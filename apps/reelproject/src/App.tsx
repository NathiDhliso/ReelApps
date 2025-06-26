import { Routes, Route, useNavigate } from 'react-router-dom'
import CreateProjectForm from './components/CreateProjectForm'
import ProjectDetailView from './components/ProjectDetailView'
import './App.css'

function App() {
  const navigate = useNavigate();

  const handleProjectCreated = (project: any) => {
    console.log('Project created:', project);
    // Navigate to project detail view when project is created
    if (project.id) {
      navigate(`/${project.id}`);
    }
  };

  const handleClose = () => {
    // For now, just log - could navigate to a projects list in the future
    console.log('Form closed');
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
        <Route path="/:projectId" element={<ProjectDetailView />} />
      </Routes>
    </div>
  )
}

export default App

import { Routes, Route } from 'react-router-dom'
import CreateProjectForm from './components/CreateProjectForm'
import ProjectDetailView from './components/ProjectDetailView'
import './App.css'

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<CreateProjectForm />} />
        <Route path="/:projectId" element={<ProjectDetailView />} />
      </Routes>
    </div>
  )
}

export default App

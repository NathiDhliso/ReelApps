import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Target, CheckCircle } from 'lucide-react';
import './ProjectDetailView.css';

interface ProjectAnalysis {
  clarity_score: number;
  feasibility_score: number;
  identified_risks: string[];
  suggested_technologies: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  analysis?: ProjectAnalysis;
  plan?: string[];
  created_at: string;
}

interface ProjectDetailViewProps {
  onBackToCreate: () => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ onBackToCreate }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get project from navigation state first
    const stateProject = location.state?.project as Project;
    
    if (stateProject && stateProject.id === projectId) {
      setProject(stateProject);
      setIsLoading(false);
    } else if (projectId) {
      // Fallback: try to load from localStorage or create mock project
      loadProjectDetails();
    } else {
      setIsLoading(false);
    }
  }, [projectId, location.state]);

  const loadProjectDetails = async () => {
    // Try to load from localStorage first
    const savedProjects = localStorage.getItem('reelproject_projects');
    if (savedProjects) {
      try {
        const projects = JSON.parse(savedProjects);
        const foundProject = projects.find((p: Project) => p.id === projectId);
        if (foundProject) {
          setProject(foundProject);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse saved projects:', err);
      }
    }

    // Create a mock project if not found
    if (projectId) {
      const mockProject: Project = {
        id: projectId,
        name: 'Project Demo',
        description: 'This is a demo project created to showcase the ReelProject interface.',
        analysis: {
          clarity_score: 8,
          feasibility_score: 7,
          identified_risks: [
            'Technical complexity may require additional research',
            'Timeline might need adjustment based on scope'
          ],
          suggested_technologies: [
            'React/TypeScript for frontend development',
            'Node.js for backend services'
          ]
        },
        plan: [
          '1. Project setup and environment configuration',
          '2. Core feature development and implementation',
          '3. Testing and quality assurance',
          '4. Documentation and deployment preparation',
          '5. Launch and monitoring'
        ],
        created_at: new Date().toISOString()
      };
      setProject(mockProject);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="project-detail-view">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-view">
        <div className="error-state">
          <h2>Project Not Found</h2>
          <p>The project you're looking for doesn't exist or has been removed.</p>
          <button onClick={onBackToCreate} className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Create Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-view">
      <div className="project-header">
        <div className="header-top">
          <button onClick={onBackToCreate} className="back-button">
            <ArrowLeft size={20} />
            Back to Projects
          </button>
        </div>
        
        <h1 className="project-title">{project.name}</h1>
        
        <div className="project-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span className="meta-label">Created</span>
            <span className="meta-value">{formatDate(project.created_at)}</span>
          </div>
          <div className="meta-item">
            <Target size={16} />
            <span className="meta-label">Status</span>
            <span className="meta-value">Active</span>
          </div>
        </div>
        
        <p className="project-description">{project.description}</p>
      </div>

      <div className="project-content">
        <div className="main-content">
          {project.analysis && (
            <div className="analysis-section">
              <h2 className="section-title">Project Analysis</h2>
              <div className="analysis-scores">
                <div className="score-card">
                  <div className="score-number">{project.analysis.clarity_score}/10</div>
                  <div className="score-label">Clarity Score</div>
                </div>
                <div className="score-card">
                  <div className="score-number">{project.analysis.feasibility_score}/10</div>
                  <div className="score-label">Feasibility Score</div>
                </div>
              </div>

              {project.analysis.identified_risks.length > 0 && (
                <div className="risks-section">
                  <h3>Identified Risks</h3>
                  <ul className="risk-list">
                    {project.analysis.identified_risks.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {project.analysis.suggested_technologies.length > 0 && (
                <div className="tech-section">
                  <h3>Suggested Technologies</h3>
                  <div className="tech-tags">
                    {project.analysis.suggested_technologies.map((tech, index) => (
                      <span key={index} className="skill-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {project.plan && project.plan.length > 0 && (
            <div className="plan-section">
              <h2 className="section-title">Project Plan</h2>
              <div className="plan-steps">
                {project.plan.map((step, index) => (
                  <div key={index} className="plan-step">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-content">
                      <p>{step}</p>
                    </div>
                    <div className="step-status">
                      <CheckCircle size={20} className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="project-actions">
            <h3 className="section-title">Actions</h3>
            <Link to="/" className="btn btn-primary">
              <ArrowLeft size={16} />
              Create New Project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailView;

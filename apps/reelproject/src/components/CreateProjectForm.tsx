/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import './CreateProjectForm.css';
import { supabase } from '../lib/supabase';
import { Sparkles, Plus } from 'lucide-react';

interface ScopeAnalysis {
  clarity_score: number;
  feasibility_score: number;
  identified_risks: string[];
  suggested_technologies: string[];
}

interface CreateProjectFormProps {
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({ onClose, onProjectCreated }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ScopeAnalysis | null>(null);
  const [projectPlan, setProjectPlan] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyzeScope = async () => {
    if (!projectDescription) {
      setError('Please provide a project description to analyze.');
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      // First, analyze the project scope
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-project-scope', {
        body: { description: projectDescription },
      });

      if (analysisError) throw analysisError;
      if (!analysisData) throw new Error('Failed to analyze project scope. No data returned.');

      setAnalysis(analysisData);

      // Then, generate the project plan based on the analysis
      const { data: planData, error: planError } = await supabase.functions.invoke('generate-project-plan', {
        body: {
          scope_analysis: analysisData,
          user_id: null
        },
      });

      if (planError) throw planError;
      if (!planData) throw new Error('Failed to generate project plan. No data returned.');

      setProjectPlan(planData.project_plan);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Project analysis failed:', err);
      setError(`Analysis Error: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim() || !projectDescription.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Analyze project scope
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-project-scope', {
        body: { description: projectDescription },
      });

      if (analysisError) throw analysisError;
      setAnalysis(analysisData);

      // 2. Generate project plan
      const { data: planData, error: planError } = await supabase.functions.invoke('generate-project-plan', {
        body: { 
          scope_analysis: analysisData,
          project_name: projectName,
          description: projectDescription 
        },
      });

      if (planError) throw planError;
      setProjectPlan(planData?.project_plan || []);

      // 3. Create a mock project object and call the callback
      const newProject = {
        id: Date.now().toString(), // Simple ID for demo
        name: projectName,
        description: projectDescription,
        analysis: analysisData,
        plan: planData?.project_plan || []
      };

      console.log('Project created successfully:', newProject);
      onProjectCreated(newProject);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error occurred';
      setError(message);
      console.error('Project creation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-project-form">
      <h1 className="form-title">Create New Project</h1>
      <p className="form-subtitle">Define your project and get AI-powered insights</p>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectName">Project Name</label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter your project name"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectDescription">Project Description</label>
          <textarea
            id="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe your project goals, requirements, and key features"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={handleAnalyzeScope}
            disabled={!projectDescription.trim() || isAnalyzing}
            className="btn btn-secondary"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="animate-spin" size={16} />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Analyze Scope
              </>
            )}
          </button>

          <button 
            type="submit" 
            disabled={isLoading || !projectName.trim() || !projectDescription.trim()}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <Plus className="animate-spin" size={16} />
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Project
              </>
            )}
          </button>
        </div>
      </form>

      {analysis && (
        <div className="analysis-results">
          <h3>Project Analysis</h3>
          <div className="analysis-scores">
            <div className="score-item">
              <span>Clarity Score</span>
              <span className="text-green-600">{analysis.clarity_score}/10</span>
            </div>
            <div className="score-item">
              <span>Feasibility Score</span>
              <span className="text-green-600">{analysis.feasibility_score}/10</span>
            </div>
          </div>
          
          {analysis.identified_risks.length > 0 && (
            <div className="analysis-section">
              <h4>Identified Risks</h4>
              <ul>
                {analysis.identified_risks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggested_technologies.length > 0 && (
            <div className="analysis-section">
              <h4>Suggested Technologies</h4>
              <ul>
                {analysis.suggested_technologies.map((tech, index) => (
                  <li key={index}>{tech}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {projectPlan.length > 0 && (
        <div className="analysis-results">
          <h3>Generated Project Plan</h3>
          <div className="analysis-section">
            <ul>
              {projectPlan.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProjectForm;

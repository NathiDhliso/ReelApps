/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import './CreateProjectForm.css';
import { Card } from '@reelapps/ui';
import { supabase } from '../lib/supabase';
import { X, Sparkles, Plus, Trash2 } from 'lucide-react';
import styles from './CreateProjectForm.css';

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
  const [_isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [_analysis, setAnalysis] = useState<ScopeAnalysis | null>(null);
  const [_projectPlan, setProjectPlan] = useState<string[]>([]);
  const [_isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [_handleAnalyzeScope, setHandleAnalyzeScope] = useState<(() => Promise<void>) | null>(null);

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
    setIsLoading(true);
    setError(null);

    try {
      // 1. Analyze project scope
      const { data: analysis, error: analysisError } = await supabase.functions.invoke('analyze-project-scope', {
        body: { projectDescription },
      });

      if (analysisError) throw analysisError;
      setAnalysis(analysis);

      // 2. Generate project plan
      const { data: plan, error: planError } = await supabase.functions.invoke('generate-project-plan', {
        body: { projectName, projectDescription },
      });

      if (planError) throw planError;
      setProjectPlan(plan);

      console.log('Project analysis & plan:', { analysis, plan });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-project-form">
      <Card>
        <Card.Header
          title="Create New Project"
          description="Define your project and get AI-powered insights"
        />
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
            required
          />
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Project Description"
            required
          />
          <button type="submit">Create Project</button>
        </form>
      </Card>
    </div>
  );
};

export default CreateProjectForm;

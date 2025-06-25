import React, { useState } from 'react';
import './CreateProjectForm.css';
import { Card } from '@reelapps/ui';

const CreateProjectForm: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Project creation logic will go here
    console.log('Creating project:', { projectName, projectDescription });
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

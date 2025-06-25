import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@reelapps/ui';
import './ProjectDetailView.css';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  milestone?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const ProjectDetailView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project] = useState<Project | null>(null);
  const [tasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }
  }, [projectId]);

  const loadProjectDetails = async () => {
    // Placeholder for loading project details
    setIsLoading(false);
  };

  const renderTaskColumn = (status: Task['status'], title: string) => {
    const columnTasks = tasks.filter(task => task.status === status);
    
    return (
      <div className="task-column">
        <h3>{title} ({columnTasks.length})</h3>
        <div className="task-list">
          {columnTasks.map(task => (
            <div key={task.id} className="task-card">
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              {task.milestone && <span className="milestone">{task.milestone}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="project-detail-view">
      <Card>
        <Card.Header
          title={project.name}
          description={project.description}
        />
        
        <div className="kanban-board">
          {renderTaskColumn('todo', 'To Do')}
          {renderTaskColumn('in-progress', 'In Progress')}
          {renderTaskColumn('done', 'Done')}
        </div>
      </Card>
    </div>
  );
};

export default ProjectDetailView;

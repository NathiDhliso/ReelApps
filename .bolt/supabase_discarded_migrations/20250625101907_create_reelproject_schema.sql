-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members join table
CREATE TABLE IF NOT EXISTS project_members (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done', 'cancelled')),
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id),
  milestone TEXT
);

-- Create project_assets table for version control
CREATE TABLE IF NOT EXISTS project_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_project_tasks_assignee ON project_tasks(assignee_id);
CREATE INDEX idx_project_assets_project ON project_assets(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects table
CREATE POLICY "Users can view projects they are members of" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = projects.id 
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update their projects" ON projects
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Project owners can delete their projects" ON projects
  FOR DELETE USING (owner_id = auth.uid());

-- RLS Policies for project_members table
CREATE POLICY "Project members can view other members" ON project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id 
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners and admins can manage members" ON project_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      JOIN projects p ON p.id = pm.project_id
      WHERE pm.project_id = project_members.project_id 
      AND pm.user_id = auth.uid()
      AND (pm.role IN ('owner', 'admin') OR p.owner_id = auth.uid())
    )
  );

-- RLS Policies for project_tasks table
CREATE POLICY "Project members can view tasks" ON project_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = project_tasks.project_id 
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can create tasks" ON project_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = project_tasks.project_id 
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can update tasks" ON project_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = project_tasks.project_id 
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can delete tasks" ON project_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = project_tasks.project_id 
      AND project_members.user_id = auth.uid()
      AND project_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for project_assets table
CREATE POLICY "Project members can view assets" ON project_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = project_assets.project_id 
      AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Project members can upload assets" ON project_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members 
      WHERE project_members.project_id = project_assets.project_id 
      AND project_members.user_id = auth.uid()
    )
  );

-- Function to automatically add project owner as member
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add owner as member when project is created
CREATE TRIGGER add_owner_to_members
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_member();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
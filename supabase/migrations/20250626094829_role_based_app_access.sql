-- Migration: Role-based App Access Control
-- This migration creates proper role-based access control for ReelApps ecosystem

-- Create app_access table to define which roles can access which apps
CREATE TABLE IF NOT EXISTS public.app_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id VARCHAR(50) NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, role)
);

-- Enable RLS on app_access table
ALTER TABLE public.app_access ENABLE ROW LEVEL SECURITY;

-- Create policy for reading app access (everyone can see which apps are available for which roles)
CREATE POLICY "Anyone can read app access" ON public.app_access
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default app access rules
INSERT INTO public.app_access (app_id, role) VALUES
  -- ReelCV - for candidates only
  ('reelcv', 'candidate'),
  
  -- ReelHunter - for recruiters only
  ('reelhunter', 'recruiter'),
  
  -- ReelSkills - for candidates only
  ('reelskills', 'candidate'),
  
  -- ReelPersona - for both candidates and recruiters
  ('reelpersona', 'candidate'),
  ('reelpersona', 'recruiter'),
  
  -- ReelProject - for both candidates and recruiters
  ('reelproject', 'candidate'),
  ('reelproject', 'recruiter')
ON CONFLICT (app_id, role) DO NOTHING;

-- Create a function to get apps for a specific user
CREATE OR REPLACE FUNCTION get_user_apps(user_id UUID)
RETURNS TABLE (
  app_id VARCHAR(50),
  app_name VARCHAR(100),
  app_description TEXT,
  app_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    aa.app_id,
    CASE aa.app_id
      WHEN 'reelcv' THEN 'ReelCV'
      WHEN 'reelhunter' THEN 'ReelHunter'
      WHEN 'reelskills' THEN 'ReelSkills'
      WHEN 'reelpersona' THEN 'ReelPersona'
      WHEN 'reelproject' THEN 'ReelProject'
    END as app_name,
    CASE aa.app_id
      WHEN 'reelcv' THEN 'Dynamic candidate profiles that go beyond traditional resumes'
      WHEN 'reelhunter' THEN 'AI-powered recruitment platform for modern hiring teams'
      WHEN 'reelskills' THEN 'Skill verification and development platform'
      WHEN 'reelpersona' THEN 'AI-driven personality assessments for cultural fit'
      WHEN 'reelproject' THEN 'Collaborative project management for freelance teams'
    END as app_description,
    CASE aa.app_id
      WHEN 'reelcv' THEN 'https://www.reelcv.co.za/'
      WHEN 'reelhunter' THEN 'https://www.reelhunter.co.za/'
      WHEN 'reelskills' THEN 'https://www.reelskills.co.za/'
      WHEN 'reelpersona' THEN 'https://www.reelpersona.co.za/'
      WHEN 'reelproject' THEN 'https://www.reelproject.co.za/'
    END as app_url
  FROM public.app_access aa
  JOIN public.profiles p ON p.user_id = $1
  WHERE aa.role = p.role OR p.role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an RPC function to get current user's accessible apps
CREATE OR REPLACE FUNCTION get_my_apps()
RETURNS TABLE (
  app_id VARCHAR(50),
  app_name VARCHAR(100),
  app_description TEXT,
  app_url TEXT
) AS $$
BEGIN
  RETURN QUERY SELECT * FROM get_user_apps(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profiles table to ensure admin role is properly handled
-- Add check constraint to ensure valid roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('candidate', 'recruiter', 'admin'));

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_app_access_role ON public.app_access(role);

-- Add a trigger to log app access (optional, for analytics)
CREATE TABLE IF NOT EXISTS public.app_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id VARCHAR(50) NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on logs
ALTER TABLE public.app_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own access logs
CREATE POLICY "Users can see own access logs" ON public.app_access_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own access logs
CREATE POLICY "Users can create own access logs" ON public.app_access_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create function to log app access
CREATE OR REPLACE FUNCTION log_app_access(app_id VARCHAR(50))
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.app_access_logs (user_id, app_id)
  VALUES (auth.uid(), app_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
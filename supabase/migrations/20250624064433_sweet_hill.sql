/*
  # ReelCV Core Database Schema

  1. New Tables
    - `profiles` - Extended user profiles for candidates
    - `skills` - Individual skill entries with proficiency levels
    - `projects` - Portfolio projects with media and impact metrics
    - `persona_analyses` - AI-generated personality and work style assessments
    - `reviews` - Peer and manager reviews with verification
    - `job_postings` - Recruiter job listings with AI analysis scores
    - `candidate_matches` - AI-generated candidate-job matches with reasoning

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access and privacy
    - Implement role-based access (candidates vs recruiters)

  3. Features
    - Full-text search capabilities
    - Automated timestamps and user tracking
    - Data validation constraints
    - Performance indexes
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'admin');
CREATE TYPE availability_status AS ENUM ('available', 'open', 'not-looking');
CREATE TYPE skill_category AS ENUM ('technical', 'soft', 'language', 'certification');
CREATE TYPE proficiency_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert', 'master');
CREATE TYPE review_relationship AS ENUM ('colleague', 'manager', 'client', 'mentor', 'direct_report');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'paused', 'closed');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'candidate',
  headline text,
  summary text,
  location text,
  avatar_url text,
  availability availability_status DEFAULT 'not-looking',
  preferred_roles text[],
  salary_min integer,
  salary_max integer,
  salary_currency text DEFAULT 'USD',
  completion_score integer DEFAULT 0 CHECK (completion_score >= 0 AND completion_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category skill_category NOT NULL,
  proficiency proficiency_level NOT NULL,
  years_experience integer NOT NULL DEFAULT 0 CHECK (years_experience >= 0),
  verified boolean DEFAULT false,
  endorsements integer DEFAULT 0 CHECK (endorsements >= 0),
  video_demo_url text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, name)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  role text NOT NULL,
  technologies text[] NOT NULL DEFAULT '{}',
  start_date date NOT NULL,
  end_date date,
  impact text,
  github_url text,
  live_url text,
  media_urls text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Persona analyses table
CREATE TABLE IF NOT EXISTS persona_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  emotional_intelligence jsonb NOT NULL DEFAULT '{}',
  work_style jsonb NOT NULL DEFAULT '{}',
  cultural_fit jsonb NOT NULL DEFAULT '{}',
  communication_style text,
  strengths text[] DEFAULT '{}',
  growth_areas text[] DEFAULT '{}',
  ideal_environment text,
  assessment_data jsonb DEFAULT '{}',
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_name text NOT NULL,
  reviewer_role text NOT NULL,
  relationship review_relationship NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text NOT NULL,
  skills_mentioned text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  verification_token text,
  created_at timestamptz DEFAULT now()
);

-- Job postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  requirements text[] NOT NULL DEFAULT '{}',
  location text NOT NULL,
  salary_min integer,
  salary_max integer,
  salary_currency text DEFAULT 'USD',
  remote_allowed boolean DEFAULT false,
  experience_level text,
  employment_type text DEFAULT 'full-time',
  status job_status DEFAULT 'draft',
  ai_analysis_score jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Candidate matches table
CREATE TABLE IF NOT EXISTS candidate_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
  candidate_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  skills_match integer NOT NULL CHECK (skills_match >= 0 AND skills_match <= 100),
  culture_match integer NOT NULL CHECK (culture_match >= 0 AND culture_match <= 100),
  experience_match integer NOT NULL CHECK (experience_match >= 0 AND experience_match <= 100),
  reasoning text,
  strengths text[] DEFAULT '{}',
  concerns text[] DEFAULT '{}',
  ai_confidence integer CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
  recruiter_viewed boolean DEFAULT false,
  recruiter_rating integer CHECK (recruiter_rating >= 1 AND recruiter_rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, candidate_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_skills_profile_id ON skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_name_trgm ON skills USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_projects_profile_id ON projects(profile_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_reviews_profile_id ON reviews(profile_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_recruiter_id ON job_postings(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_candidate_matches_job_id ON candidate_matches(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_matches_candidate_id ON candidate_matches(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_matches_overall_score ON candidate_matches(overall_score DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recruiters can read candidate profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    role = 'candidate' AND 
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'recruiter'
    )
  );

-- RLS Policies for skills
CREATE POLICY "Users can manage own skills"
  ON skills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can read candidate skills"
  ON skills
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = profile_id AND p.role = 'candidate'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles recruiter 
      WHERE recruiter.user_id = auth.uid() AND recruiter.role = 'recruiter'
    )
  );

-- RLS Policies for projects
CREATE POLICY "Users can manage own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can read candidate projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = profile_id AND p.role = 'candidate'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles recruiter 
      WHERE recruiter.user_id = auth.uid() AND recruiter.role = 'recruiter'
    )
  );

-- RLS Policies for persona_analyses
CREATE POLICY "Users can read own persona analysis"
  ON persona_analyses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Recruiters can read candidate persona analyses"
  ON persona_analyses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = profile_id AND p.role = 'candidate'
    ) AND
    EXISTS (
      SELECT 1 FROM profiles recruiter 
      WHERE recruiter.user_id = auth.uid() AND recruiter.role = 'recruiter'
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Users can read own reviews"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reviews for others"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles reviewer 
      WHERE reviewer.user_id = auth.uid()
    ) AND
    NOT EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for job_postings
CREATE POLICY "Recruiters can manage own job postings"
  ON job_postings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = recruiter_id AND p.user_id = auth.uid() AND p.role = 'recruiter'
    )
  );

CREATE POLICY "Active job postings are publicly readable"
  ON job_postings
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- RLS Policies for candidate_matches
CREATE POLICY "Recruiters can read matches for their jobs"
  ON candidate_matches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_postings jp
      JOIN profiles p ON jp.recruiter_id = p.id
      WHERE jp.id = job_id AND p.user_id = auth.uid() AND p.role = 'recruiter'
    )
  );

CREATE POLICY "Candidates can read their own matches"
  ON candidate_matches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = candidate_id AND p.user_id = auth.uid() AND p.role = 'candidate'
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_persona_analyses_updated_at BEFORE UPDATE ON persona_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate profile completion score
CREATE OR REPLACE FUNCTION calculate_completion_score(profile_uuid uuid)
RETURNS integer AS $$
DECLARE
  score integer := 0;
  profile_record profiles%ROWTYPE;
  skills_count integer;
  projects_count integer;
  has_persona boolean;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE id = profile_uuid;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Basic profile info (40 points)
  IF profile_record.headline IS NOT NULL AND profile_record.headline != '' THEN
    score := score + 10;
  END IF;
  
  IF profile_record.summary IS NOT NULL AND profile_record.summary != '' THEN
    score := score + 15;
  END IF;
  
  IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN
    score := score + 5;
  END IF;
  
  IF profile_record.avatar_url IS NOT NULL AND profile_record.avatar_url != '' THEN
    score := score + 5;
  END IF;
  
  IF array_length(profile_record.preferred_roles, 1) > 0 THEN
    score := score + 5;
  END IF;
  
  -- Skills (30 points)
  SELECT COUNT(*) INTO skills_count FROM skills WHERE profile_id = profile_uuid;
  IF skills_count >= 5 THEN
    score := score + 30;
  ELSIF skills_count >= 3 THEN
    score := score + 20;
  ELSIF skills_count >= 1 THEN
    score := score + 10;
  END IF;
  
  -- Projects (20 points)
  SELECT COUNT(*) INTO projects_count FROM projects WHERE profile_id = profile_uuid;
  IF projects_count >= 3 THEN
    score := score + 20;
  ELSIF projects_count >= 2 THEN
    score := score + 15;
  ELSIF projects_count >= 1 THEN
    score := score + 10;
  END IF;
  
  -- Persona analysis (10 points)
  SELECT EXISTS(SELECT 1 FROM persona_analyses WHERE profile_id = profile_uuid) INTO has_persona;
  IF has_persona THEN
    score := score + 10;
  END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update completion score
CREATE OR REPLACE FUNCTION update_profile_completion_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET completion_score = calculate_completion_score(
    CASE 
      WHEN TG_TABLE_NAME = 'profiles' THEN NEW.id
      ELSE NEW.profile_id
    END
  )
  WHERE id = (
    CASE 
      WHEN TG_TABLE_NAME = 'profiles' THEN NEW.id
      ELSE NEW.profile_id
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update completion score
CREATE TRIGGER update_completion_on_profile_change 
  AFTER INSERT OR UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion_score();

CREATE TRIGGER update_completion_on_skills_change 
  AFTER INSERT OR UPDATE OR DELETE ON skills 
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion_score();

CREATE TRIGGER update_completion_on_projects_change 
  AFTER INSERT OR UPDATE OR DELETE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion_score();

CREATE TRIGGER update_completion_on_persona_change 
  AFTER INSERT OR UPDATE OR DELETE ON persona_analyses 
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion_score();
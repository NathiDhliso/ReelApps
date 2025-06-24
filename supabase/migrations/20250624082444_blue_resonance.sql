/*
  # Fix signup flow and RLS policies

  This migration ensures the signup flow works correctly by:
  1. Cleaning up any conflicting policies
  2. Creating proper RLS policies that align with the signup logic
  3. Ensuring all required fields have proper defaults
*/

-- Clean up existing INSERT policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users creating own profile" ON profiles;

-- Create the correct INSERT policy for signup
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure we have proper SELECT policy
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure we have proper UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Keep the recruiter policy for reading candidate profiles
DROP POLICY IF EXISTS "Recruiters can read candidate profiles" ON profiles;
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

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Verify the table structure matches our signup logic
-- The signup logic expects these fields to be nullable or have defaults:
-- headline, summary, location, avatar_url, availability, preferred_roles, 
-- salary_min, salary_max, salary_currency, completion_score

-- Make sure salary_currency has a proper default
ALTER TABLE profiles ALTER COLUMN salary_currency SET DEFAULT 'USD';

-- Make sure completion_score has a proper default
ALTER TABLE profiles ALTER COLUMN completion_score SET DEFAULT 0;

-- Make sure availability has a proper default for candidates
-- (This will be set in the application logic, but ensure it's nullable)
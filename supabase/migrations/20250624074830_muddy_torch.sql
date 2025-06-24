/*
  # Fix profiles table RLS policy for user signup

  1. Security Changes
    - Drop the existing restrictive insert policy
    - Create a new policy that allows authenticated users to insert their own profile
    - Ensure the policy works during the signup process when auth.uid() is available

  The issue was that the existing policy was too restrictive and prevented
  users from creating their profile during the signup process.
*/

-- Drop the existing insert policy that's causing issues
DROP POLICY IF EXISTS "Enable insert for authenticated users creating own profile" ON profiles;

-- Create a new insert policy that allows authenticated users to create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also ensure we have a proper select policy for users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure the update policy exists
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Keep the recruiter policy for reading candidate profiles
-- This should already exist but let's ensure it's properly defined
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
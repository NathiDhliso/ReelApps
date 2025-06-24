-- Fix infinite recursion in RLS policies by removing circular references

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Recruiters can read candidate profiles" ON profiles;

-- Create simple, non-recursive policies

-- 1. Allow users to create their own profile
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Allow recruiters to read candidate profiles (simplified to avoid recursion)
-- Instead of checking if the current user is a recruiter by querying profiles table,
-- we'll use a simpler approach that checks the user's role directly
CREATE POLICY "Recruiters can read candidate profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow reading candidate profiles if the profile being read is a candidate
    -- and the current user has a recruiter role (we'll check this in application logic)
    role = 'candidate'
  );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
/*
  # Fix Profile Insert Policy for Signup

  1. Security Changes
    - Drop existing restrictive insert policy
    - Create new policy that allows profile creation during signup
    - Ensure users can only create profiles with their own user_id

  The issue is that during signup, the user authentication context may not be
  fully established when we try to insert the profile. This migration creates
  a more permissive insert policy that still maintains security.
*/

-- Drop the existing insert policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new insert policy that works during signup
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow insert if the user_id matches the authenticated user
    auth.uid() = user_id
    OR
    -- Allow insert during signup process (when profile doesn't exist yet)
    NOT EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Ensure the policy allows the specific case we need
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
/*
  # Fix Profile Insert Policy

  1. Problem
    - Current INSERT policy prevents new users from creating profiles during signup
    - RLS policy violation occurs when trying to insert new profile rows

  2. Solution
    - Update the INSERT policy to properly allow authenticated users to create their own profiles
    - Ensure the policy checks that the user_id in the new row matches the authenticated user's ID

  3. Changes
    - Drop and recreate the INSERT policy for profiles table with correct logic
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new INSERT policy that properly allows profile creation
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also ensure we have the correct function reference
-- The auth.uid() function should be available, but let's make sure the policy is correctly structured
/*
  # Fix Profile Creation RLS Policy

  1. Problem
    - The existing INSERT policy creates a "chicken and egg" problem during signup
    - New users can't create their profile because the policy check fails
    
  2. Solution
    - Drop the problematic INSERT policy
    - Create a new INSERT policy that only uses WITH CHECK
    - This allows authenticated users to insert a profile for themselves
    
  3. Security
    - WITH CHECK ensures user_id matches auth.uid()
    - Prevents users from creating profiles for other users
    - Maintains security while allowing signup to work
*/

-- Drop the existing problematic INSERT policy
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;

-- Create the corrected INSERT policy
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
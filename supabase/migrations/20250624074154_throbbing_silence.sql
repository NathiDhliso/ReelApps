/*
  # Fix Profile Insert Policy for User Signup

  1. Security Updates
    - Drop existing restrictive INSERT policy on profiles table
    - Create new INSERT policy that properly handles user signup flow
    - Ensure authenticated users can create their own profile during signup

  2. Changes
    - Remove old "Users can insert own profile" policy
    - Add new policy that works correctly with Supabase auth flow
    - Maintain security by ensuring users can only create profiles for themselves
*/

-- Drop the existing INSERT policy that's causing issues
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new INSERT policy that properly handles the signup flow
CREATE POLICY "Enable insert for authenticated users creating own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure the policy is properly applied
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
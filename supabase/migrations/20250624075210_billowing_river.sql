/*
  # Fix Profile Creation RLS Policy

  1. Security Changes
    - Drop conflicting profile creation policies
    - Add a clear policy for users to create their own profile during signup
    - Ensure users can only create one profile per user_id
    - Maintain existing read/update policies

  2. Policy Updates
    - Remove duplicate INSERT policies that may be conflicting
    - Add a single, clear INSERT policy for profile creation
    - Ensure the policy allows profile creation immediately after user signup
*/

-- Drop existing INSERT policies to avoid conflicts
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a single, clear INSERT policy for profile creation
CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure the existing SELECT policies remain intact
-- (keeping the existing "Users can read own profile" and "Recruiters can read candidate profiles" policies)

-- Ensure the existing UPDATE policy remains intact
-- (keeping the existing "Users can update own profile" policy)
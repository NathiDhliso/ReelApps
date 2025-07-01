-- Fix RLS policy recursion issue for profiles table
-- This migration simplifies the RLS policies to avoid infinite recursion

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Recruiters can read candidate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can select own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public read for candidate profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view candidate profiles" ON public.profiles;

-- Create a simple function to get user profile safely
CREATE OR REPLACE FUNCTION public.get_user_profile_safe(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  role public.user_role,
  first_name text,
  last_name text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.role,
    p.first_name,
    p.last_name
  FROM public.profiles p
  WHERE p.user_id = user_id_param;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_profile_safe(uuid) TO authenticated;

-- Create very simple RLS policies to avoid recursion
-- Allow authenticated users to read all profiles (for ReelHunter recruiter functionality)
CREATE POLICY "Simple authenticated read all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to create their own profile
CREATE POLICY "Users can create own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 
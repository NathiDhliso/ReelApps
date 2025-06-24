-- This migration cleans up and consolidates the Row Level Security (RLS)
-- policies for the 'profiles' table to improve clarity and remove redundancy.

-- 1. Drop old, now-unused SELECT policies.
-- These were replaced by the "Authenticated users can read all profiles" policy.
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Recruiters can read candidate profiles" ON public.profiles;

-- 2. Drop the redundant INSERT policies.
-- There were two identical policies for inserting profiles.
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 3. Create a single, consolidated INSERT policy.
-- This ensures that a user can only create a profile for themselves.
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Note: The following policies are correct and remain unchanged:
--
-- - "Authenticated users can read all profiles" (SELECT)
--   This policy fixed the application loading issue.
--
-- - "Users can update own profile" (UPDATE)
--   This policy correctly restricts users to updating only their own profile.
--
-- - "Service role has full access" (ALL for service_role)
--   This is a standard Supabase policy for administrative access. 
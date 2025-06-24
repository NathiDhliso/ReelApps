-- Drop the existing, more restrictive SELECT policies on the profiles table.
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Recruiters can read candidate profiles" ON public.profiles;

-- Create a new, more permissive policy that allows any authenticated user
-- to read any profile. This is a common pattern for public profile data
-- and simplifies application logic, preventing access deadlocks.
CREATE POLICY "Authenticated users can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- The existing policies for INSERT and UPDATE are still in effect,
-- ensuring that users can only modify their own profiles. 
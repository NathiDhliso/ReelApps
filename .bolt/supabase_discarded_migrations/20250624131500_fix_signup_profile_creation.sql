-- This migration fixes the user signup flow by ensuring the
-- "create_profile_for_user" function has the correct permissions
-- to create a profile when a new user signs up.

-- 1. Define the function that creates a new profile entry.
-- This function is designed to be called by a trigger on the auth.users table.
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- This is the key fix: It allows the function to bypass RLS.
SET search_path = public
AS $$
BEGIN
  -- Insert a new profile record, taking details from the new auth.users record.
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    (NEW.raw_user_meta_data ->> 'role')::user_role
  );
  RETURN NEW;
END;
$$;

-- 2. Create the trigger on the auth.users table.
-- This trigger will fire after a new user is created and call the function above.
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_user(); 
-- Drop all existing triggers that cause the recursion
DROP TRIGGER IF EXISTS update_completion_on_profile_change ON profiles;
DROP TRIGGER IF EXISTS update_completion_on_skills_change ON skills;
DROP TRIGGER IF EXISTS update_completion_on_projects_change ON projects;
DROP TRIGGER IF EXISTS update_completion_on_persona_change ON persona_analyses;
DROP TRIGGER IF EXISTS set_initial_profile_completion ON profiles;

-- Drop existing functions to ensure clean state
DROP FUNCTION IF EXISTS update_profile_completion_score();
DROP FUNCTION IF EXISTS update_profile_completion_on_profile_change();
DROP FUNCTION IF EXISTS set_initial_completion_score();

-- Create a smarter trigger function that prevents infinite recursion
CREATE OR REPLACE FUNCTION update_profile_completion_score()
RETURNS TRIGGER AS $$
DECLARE
  target_profile_id UUID;
  should_update BOOLEAN := TRUE;
BEGIN
  -- For profiles table, check if we're only updating completion_score
  IF TG_TABLE_NAME = 'profiles' THEN
    IF TG_OP = 'UPDATE' THEN
      -- Check if only completion_score is being updated
      IF OLD.id = NEW.id AND
         OLD.user_id = NEW.user_id AND
         OLD.first_name = NEW.first_name AND
         OLD.last_name = NEW.last_name AND
         OLD.role = NEW.role AND
         OLD.headline IS NOT DISTINCT FROM NEW.headline AND
         OLD.summary IS NOT DISTINCT FROM NEW.summary AND
         OLD.location IS NOT DISTINCT FROM NEW.location AND
         OLD.avatar_url IS NOT DISTINCT FROM NEW.avatar_url AND
         OLD.availability IS NOT DISTINCT FROM NEW.availability AND
         OLD.preferred_roles IS NOT DISTINCT FROM NEW.preferred_roles AND
         OLD.salary_min IS NOT DISTINCT FROM NEW.salary_min AND
         OLD.salary_max IS NOT DISTINCT FROM NEW.salary_max AND
         OLD.salary_currency IS NOT DISTINCT FROM NEW.salary_currency THEN
        -- Only completion_score (and maybe updated_at) changed, don't trigger update
        RETURN NEW;
      END IF;
    END IF;
    target_profile_id := NEW.id;
  ELSIF TG_TABLE_NAME IN ('skills', 'projects', 'persona_analyses') THEN
    IF TG_OP = 'DELETE' THEN
      target_profile_id := OLD.profile_id;
    ELSE
      target_profile_id := NEW.profile_id;
    END IF;
  ELSE
    -- Unknown table, just return
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Update the completion score
  IF target_profile_id IS NOT NULL AND should_update THEN
    -- Use a direct update to avoid triggering recursion
    UPDATE profiles 
    SET completion_score = calculate_completion_score(target_profile_id)
    WHERE id = target_profile_id
      AND completion_score IS DISTINCT FROM calculate_completion_score(target_profile_id);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Alternative approach: Create a separate function for profile updates that checks column changes
CREATE OR REPLACE FUNCTION update_profile_completion_on_profile_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate if relevant fields changed
  IF NEW.headline IS DISTINCT FROM OLD.headline OR
     NEW.summary IS DISTINCT FROM OLD.summary OR
     NEW.location IS DISTINCT FROM OLD.location OR
     NEW.avatar_url IS DISTINCT FROM OLD.avatar_url OR
     NEW.preferred_roles IS DISTINCT FROM OLD.preferred_roles OR
     NEW.first_name IS DISTINCT FROM OLD.first_name OR
     NEW.last_name IS DISTINCT FROM OLD.last_name THEN
    -- Calculate and update only if the score actually changes
    NEW.completion_score := calculate_completion_score(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers with the fixed approach
-- For profiles: use BEFORE trigger to set the value directly
CREATE TRIGGER update_completion_on_profile_change 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_profile_completion_on_profile_change();

-- For profile inserts: calculate on insert
CREATE OR REPLACE FUNCTION set_initial_completion_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completion_score := calculate_completion_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_initial_profile_completion
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_initial_completion_score();

-- For related tables: use AFTER triggers
CREATE TRIGGER update_completion_on_skills_change 
  AFTER INSERT OR UPDATE OR DELETE ON skills 
  FOR EACH ROW 
  EXECUTE FUNCTION update_profile_completion_score();

CREATE TRIGGER update_completion_on_projects_change 
  AFTER INSERT OR UPDATE OR DELETE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_profile_completion_score();

CREATE TRIGGER update_completion_on_persona_change 
  AFTER INSERT OR UPDATE OR DELETE ON persona_analyses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_profile_completion_score();

-- Update all existing profiles to have correct completion scores
UPDATE profiles 
SET completion_score = calculate_completion_score(id)
WHERE completion_score IS NULL OR completion_score = 0;
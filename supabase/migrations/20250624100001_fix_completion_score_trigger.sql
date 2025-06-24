-- Fix the update_profile_completion_score function to properly handle different table structures
CREATE OR REPLACE FUNCTION update_profile_completion_score()
RETURNS TRIGGER AS $$
DECLARE
  target_profile_id UUID;
BEGIN
  -- Determine the profile_id based on which table triggered this function
  IF TG_TABLE_NAME = 'profiles' THEN
    -- For profiles table, use the id directly
    IF TG_OP = 'DELETE' THEN
      -- Skip update on delete
      RETURN OLD;
    ELSE
      target_profile_id := NEW.id;
    END IF;
  ELSIF TG_TABLE_NAME IN ('skills', 'projects', 'persona_analyses') THEN
    -- For related tables, use profile_id
    IF TG_OP = 'DELETE' THEN
      target_profile_id := OLD.profile_id;
    ELSE
      target_profile_id := NEW.profile_id;
    END IF;
  ELSE
    -- For any other table, just return
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Update the completion score for the target profile
  IF target_profile_id IS NOT NULL THEN
    UPDATE profiles 
    SET completion_score = calculate_completion_score(target_profile_id)
    WHERE id = target_profile_id;
  END IF;

  -- Return the appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate the triggers with the fixed function
DROP TRIGGER IF EXISTS update_completion_on_profile_change ON profiles;
CREATE TRIGGER update_completion_on_profile_change 
  AFTER INSERT OR UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion_score();

DROP TRIGGER IF EXISTS update_completion_on_skills_change ON skills;
CREATE TRIGGER update_completion_on_skills_change 
  AFTER INSERT OR UPDATE OR DELETE ON skills 
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion_score();

DROP TRIGGER IF EXISTS update_completion_on_projects_change ON projects;
CREATE TRIGGER update_completion_on_projects_change 
  AFTER INSERT OR UPDATE OR DELETE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion_score();

DROP TRIGGER IF EXISTS update_completion_on_persona_change ON persona_analyses;
CREATE TRIGGER update_completion_on_persona_change 
  AFTER INSERT OR UPDATE OR DELETE ON persona_analyses 
  FOR EACH ROW EXECUTE FUNCTION update_profile_completion_score(); 
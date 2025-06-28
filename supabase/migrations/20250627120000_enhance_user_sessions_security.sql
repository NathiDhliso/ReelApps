-- Enhanced User Sessions Security Migration
-- Adds security metadata fields to support secure authentication practices

-- Add security metadata columns to user_sessions table
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS session_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS invalidated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS security_flags JSONB DEFAULT '{}';

-- Create index for security lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_security ON user_sessions(user_id, is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_invalidated ON user_sessions(invalidated_at) WHERE invalidated_at IS NOT NULL;

-- Add security check function
CREATE OR REPLACE FUNCTION check_session_security(
  p_user_id UUID,
  p_session_id UUID DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS TABLE (
  is_valid BOOLEAN,
  session_data JSONB,
  security_warnings TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  warnings TEXT[] := '{}';
  is_session_valid BOOLEAN := FALSE;
  session_json JSONB;
BEGIN
  -- Get session record
  SELECT * INTO session_record
  FROM user_sessions 
  WHERE user_id = p_user_id
    AND is_active = true
    AND expires_at > NOW()
    AND (p_session_id IS NULL OR session_id = p_session_id);

  IF session_record IS NULL THEN
    warnings := array_append(warnings, 'No active session found');
    RETURN QUERY SELECT FALSE, '{}'::JSONB, warnings;
    RETURN;
  END IF;

  is_session_valid := TRUE;
  
  -- Build session data
  session_json := jsonb_build_object(
    'session_id', session_record.session_id,
    'last_activity', session_record.last_activity,
    'expires_at', session_record.expires_at,
    'created_at', session_record.created_at
  );

  -- Check for suspicious activity
  IF p_user_agent IS NOT NULL AND session_record.user_agent IS NOT NULL THEN
    IF session_record.user_agent != p_user_agent THEN
      warnings := array_append(warnings, 'User agent mismatch detected');
    END IF;
  END IF;

  -- Check session age
  IF session_record.created_at < NOW() - INTERVAL '7 days' THEN
    warnings := array_append(warnings, 'Session is older than 7 days');
  END IF;

  -- Check for recent password changes (if available)
  -- This would be enhanced with actual password change tracking

  RETURN QUERY SELECT is_session_valid, session_json, warnings;
END;
$$;

-- Add function to clean up old/invalid sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  -- Mark expired sessions as inactive
  UPDATE user_sessions 
  SET is_active = false,
      invalidated_at = NOW()
  WHERE is_active = true 
    AND expires_at < NOW()
    AND invalidated_at IS NULL;
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Log cleanup activity
  INSERT INTO system_logs (event_type, event_data, created_at)
  VALUES (
    'session_cleanup',
    jsonb_build_object('cleaned_sessions', cleaned_count),
    NOW()
  ) ON CONFLICT DO NOTHING;
  
  RETURN cleaned_count;
END;
$$;

-- Create system_logs table if it doesn't exist (for audit logging)
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_event_type ON system_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);

-- Add trigger to log session changes
CREATE OR REPLACE FUNCTION log_session_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO system_logs (event_type, event_data, user_id)
    VALUES (
      'session_created',
      jsonb_build_object(
        'session_id', NEW.session_id,
        'ip_address', NEW.ip_address,
        'user_agent', NEW.user_agent
      ),
      NEW.user_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log when session is invalidated
    IF OLD.is_active = true AND NEW.is_active = false THEN
      INSERT INTO system_logs (event_type, event_data, user_id)
      VALUES (
        'session_invalidated',
        jsonb_build_object(
          'session_id', NEW.session_id,
          'reason', CASE 
            WHEN NEW.invalidated_at IS NOT NULL THEN 'manual_invalidation'
            WHEN NEW.expires_at < NOW() THEN 'expiration'
            ELSE 'unknown'
          END
        ),
        NEW.user_id
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS session_audit_trigger ON user_sessions;
CREATE TRIGGER session_audit_trigger
  AFTER INSERT OR UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION log_session_changes();

-- Add RLS policies for security
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own logs
CREATE POLICY "Users can view own logs" ON system_logs
  FOR SELECT USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Only system can insert logs
CREATE POLICY "System can insert logs" ON system_logs
  FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON COLUMN user_sessions.session_id IS 'Unique identifier for this session instance';
COMMENT ON COLUMN user_sessions.ip_address IS 'IP address when session was created/updated';
COMMENT ON COLUMN user_sessions.user_agent IS 'User agent string for security validation';
COMMENT ON COLUMN user_sessions.invalidated_at IS 'Timestamp when session was manually invalidated';
COMMENT ON COLUMN user_sessions.security_flags IS 'Additional security metadata and flags';

COMMENT ON FUNCTION check_session_security IS 'Validates session security and returns warnings';
COMMENT ON FUNCTION cleanup_expired_sessions IS 'Cleans up expired sessions and returns count';
COMMENT ON TABLE system_logs IS 'Audit log for security events and system activities';

-- Schedule automatic cleanup (requires pg_cron extension if available)
-- This would typically be set up as a scheduled job
-- SELECT cron.schedule('cleanup-sessions', '0 * * * *', 'SELECT cleanup_expired_sessions();'); 
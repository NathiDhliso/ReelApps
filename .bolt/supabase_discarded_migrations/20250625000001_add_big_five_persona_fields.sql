-- Add Big Five personality model fields to persona_analyses table
ALTER TABLE persona_analyses 
ADD COLUMN IF NOT EXISTS openness INTEGER CHECK (openness >= 0 AND openness <= 100),
ADD COLUMN IF NOT EXISTS conscientiousness INTEGER CHECK (conscientiousness >= 0 AND conscientiousness <= 100),
ADD COLUMN IF NOT EXISTS extraversion INTEGER CHECK (extraversion >= 0 AND extraversion <= 100),
ADD COLUMN IF NOT EXISTS agreeableness INTEGER CHECK (agreeableness >= 0 AND agreeableness <= 100),
ADD COLUMN IF NOT EXISTS neuroticism INTEGER CHECK (neuroticism >= 0 AND neuroticism <= 100),
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add comments for documentation
COMMENT ON COLUMN persona_analyses.openness IS 'Big Five: Openness to experience (0-100)';
COMMENT ON COLUMN persona_analyses.conscientiousness IS 'Big Five: Conscientiousness (0-100)';
COMMENT ON COLUMN persona_analyses.extraversion IS 'Big Five: Extraversion (0-100)';
COMMENT ON COLUMN persona_analyses.agreeableness IS 'Big Five: Agreeableness (0-100)';
COMMENT ON COLUMN persona_analyses.neuroticism IS 'Big Five: Neuroticism (0-100)';
COMMENT ON COLUMN persona_analyses.summary IS 'AI-generated personality summary based on Big Five analysis'; 
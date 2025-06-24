-- Add video verification columns to skills table if they don't exist
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS video_demo_url TEXT;

ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS video_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS ai_rating INTEGER CHECK (ai_rating >= 1 AND ai_rating <= 5);

ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS ai_feedback TEXT;

ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS video_uploaded_at TIMESTAMPTZ; 
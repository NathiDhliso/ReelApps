-- Add video verification fields to skills table
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS video_demo_url TEXT,
ADD COLUMN IF NOT EXISTS video_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_rating INTEGER CHECK (ai_rating >= 1 AND ai_rating <= 5),
ADD COLUMN IF NOT EXISTS ai_feedback TEXT,
ADD COLUMN IF NOT EXISTS video_uploaded_at TIMESTAMPTZ;

-- Create a table to store video verification sessions
CREATE TABLE IF NOT EXISTS public.skill_video_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    ai_prompt TEXT NOT NULL,
    ai_rating INTEGER CHECK (ai_rating >= 1 AND ai_rating <= 5),
    ai_feedback TEXT,
    verification_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for video verifications
ALTER TABLE public.skill_video_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create verifications for their own skills" ON public.skill_video_verifications
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.skills s
            JOIN public.profiles p ON s.profile_id = p.id
            WHERE s.id = skill_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own verifications" ON public.skill_video_verifications
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.skills s
            JOIN public.profiles p ON s.profile_id = p.id
            WHERE s.id = skill_id AND p.user_id = auth.uid()
        )
    );

-- Create storage bucket for skill verification videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('skill-videos', 'skill-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for skill videos
CREATE POLICY "Users can upload skill videos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'skill-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view skill videos" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'skill-videos');

CREATE POLICY "Users can delete their own skill videos" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'skill-videos' AND auth.uid()::text = (storage.foldername(name))[1]); 
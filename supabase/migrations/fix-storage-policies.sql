-- Create storage bucket for skill verification videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('skill-videos', 'skill-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload skill videos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view skill videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own skill videos" ON storage.objects;

-- Create storage policies for skill videos
CREATE POLICY "Users can upload skill videos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'skill-videos' AND
        auth.uid()::text = (string_to_array(name, '/'))[1]
    );

CREATE POLICY "Anyone can view skill videos" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'skill-videos');

CREATE POLICY "Users can update their own skill videos" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'skill-videos' AND
        auth.uid()::text = (string_to_array(name, '/'))[1]
    );

CREATE POLICY "Users can delete their own skill videos" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'skill-videos' AND
        auth.uid()::text = (string_to_array(name, '/'))[1]
    );

-- Also create the skills video verification table
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

-- Enable RLS for the verification table
ALTER TABLE public.skill_video_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for video verifications
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
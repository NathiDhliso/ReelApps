import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Generate AI prompt for skill demonstration
const generateSkillPrompt = (skillName: string, category: string): string => {
  const prompts: Record<string, string[]> = {
    technical: [
      `Demonstrate how to use ${skillName} by building a simple example`,
      `Explain the key concepts of ${skillName} and show a practical implementation`,
      `Create a mini-project showcasing your ${skillName} skills`,
      `Walk through debugging a ${skillName} issue and explain your thought process`,
    ],
    soft: [
      `Give an example of how you've used ${skillName} in a professional setting`,
      `Demonstrate ${skillName} by role-playing a workplace scenario`,
      `Explain the importance of ${skillName} and show how you apply it`,
      `Share a story where ${skillName} helped you overcome a challenge`,
    ],
    language: [
      `Have a 2-minute conversation in ${skillName} about your professional experience`,
      `Read a technical paragraph in ${skillName} and explain it`,
      `Introduce yourself professionally in ${skillName}`,
      `Explain a complex concept in ${skillName}`,
    ],
    certification: [
      `Explain the key topics covered in your ${skillName} certification`,
      `Demonstrate a practical application of what you learned in ${skillName}`,
      `Show how ${skillName} certification knowledge applies to real work`,
      `Teach a concept from your ${skillName} certification`,
    ],
  };

  const categoryPrompts = prompts[category] || prompts.technical;
  return categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
};

// Simulate AI video analysis (in production, this would call a real AI service)
const analyzeSkillVideo = async (videoUrl: string, skillName: string): Promise<{ rating: number; feedback: string }> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In production, this would:
  // 1. Download the video
  // 2. Use AI vision models to analyze content
  // 3. Use speech-to-text for verbal explanations
  // 4. Evaluate based on criteria

  // Simulated ratings based on random factors
  const ratings = [3, 4, 4, 5, 5]; // Weighted towards higher ratings
  const rating = ratings[Math.floor(Math.random() * ratings.length)];

  const feedbacks = {
    3: `Good attempt at demonstrating ${skillName}. Consider providing more detailed explanations and practical examples. Your understanding is solid but could benefit from deeper exploration of advanced concepts.`,
    4: `Strong demonstration of ${skillName} skills. You showed good understanding and practical application. To improve, try incorporating more real-world scenarios and edge cases in your explanation.`,
    5: `Excellent demonstration of ${skillName} mastery! You showed deep understanding, clear communication, and practical expertise. Your explanation was comprehensive and well-structured.`,
  };

  return {
    rating,
    feedback: feedbacks[rating as keyof typeof feedbacks] || feedbacks[4],
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { action, skillId, skillName, category, videoUrl } = await req.json();

    if (action === 'get-prompt') {
      // Generate a prompt for the skill demonstration
      const prompt = generateSkillPrompt(skillName, category);
      
      return new Response(JSON.stringify({ prompt }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else if (action === 'verify-video') {
      // Analyze the uploaded video
      const { rating, feedback } = await analyzeSkillVideo(videoUrl, skillName);

      // Create verification record
      const { error: verificationError } = await supabaseClient
        .from('skill_video_verifications')
        .insert({
          skill_id: skillId,
          video_url: videoUrl,
          ai_prompt: 'Video demonstration',
          ai_rating: rating,
          ai_feedback: feedback,
          verification_status: 'completed',
        });

      if (verificationError) {
        throw verificationError;
      }

      // Update the skill with verification results
      const { error: updateError } = await supabaseClient
        .from('skills')
        .update({
          video_demo_url: videoUrl,
          video_verified: true,
          ai_rating: rating,
          ai_feedback: feedback,
          video_uploaded_at: new Date().toISOString(),
        })
        .eq('id', skillId);

      if (updateError) {
        throw updateError;
      }

      return new Response(JSON.stringify({ rating, feedback }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error) {
    console.error('Error in verify-skill-video function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 
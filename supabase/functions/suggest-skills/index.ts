import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { callGemini } from '../_shared/gemini.ts';

// Placeholder for an AI model client. In a real scenario, this would be
// a client for OpenAI, Anthropic, or another AI service.
// For this example, we'll simulate the AI response.
const getAiSuggestions = async (text: string): Promise<string[]> => {
  console.log('Simulating AI analysis for text:', text.substring(0, 100) + '...');
  
  const prompt = `You are an expert career advisor. A candidate provided this profile text:\n\n"""\n${text}\n"""\n\nReturn a JSON array of up to 10 relevant skills (just the skill names, no extra keys).`;

  try {
    const skills: string[] = await callGemini([
      { role: 'system', content: 'Respond ONLY with valid JSON.' },
      { role: 'user', content: prompt },
    ], { parseJson: true });

    return skills;
  } catch (err) {
    console.error('Gemini suggest-skills error', err);
    return [];
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the user's authorization token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the user from the token
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Get the user's profile text from the request body
    const { text } = await req.json();
    if (!text) {
      return new Response(JSON.stringify({ error: 'Missing text for analysis' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Get AI-powered skill suggestions
    const suggestions = await getAiSuggestions(text);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in suggest-skills function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
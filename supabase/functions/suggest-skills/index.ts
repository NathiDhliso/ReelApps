import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Placeholder for an AI model client. In a real scenario, this would be
// a client for OpenAI, Anthropic, or another AI service.
// For this example, we'll simulate the AI response.
const getAiSuggestions = async (text: string): Promise<string[]> => {
  console.log('Simulating AI analysis for text:', text.substring(0, 100) + '...');
  
  // In a real implementation, you would make an API call to an AI service here.
  // Example prompt:
  // `Extract a list of professional skills from the following text.
  //  Return the skills as a JSON array of strings. Text: "${text}"`

  // Simulate a network delay for the AI response.
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulated AI response based on keywords.
  const suggestions = new Set<string>();
  if (text.toLowerCase().includes('react')) suggestions.add('React');
  if (text.toLowerCase().includes('typescript')) suggestions.add('TypeScript');
  if (text.toLowerCase().includes('project management')) suggestions.add('Project Management');
  if (text.toLowerCase().includes('leadership')) suggestions.add('Leadership');
  if (text.toLowerCase().includes('python')) suggestions.add('Python');
  if (text.toLowerCase().includes('sql')) suggestions.add('SQL');
  if (text.toLowerCase().includes('data analysis')) suggestions.add('Data Analysis');
  if (text.toLowerCase().includes('javascript')) suggestions.add('JavaScript');
  if (text.toLowerCase().includes('node')) suggestions.add('Node.js');
  if (text.toLowerCase().includes('database')) suggestions.add('Database Management');
  if (text.toLowerCase().includes('api')) suggestions.add('API Development');
  if (text.toLowerCase().includes('frontend')) suggestions.add('Frontend Development');
  if (text.toLowerCase().includes('backend')) suggestions.add('Backend Development');

  console.log('AI simulation returned suggestions:', Array.from(suggestions));
  return Array.from(suggestions);
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
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { callGeminiAPI } from '../_shared/gemini.ts'

interface AnalyzeProjectRequest {
  projectDescription: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectDescription } = await req.json() as AnalyzeProjectRequest

    const prompt = `You are an expert project manager. Analyze this project description:
    ${projectDescription}
    
    Provide analysis as JSON with: clarity (score & feedback), completeness (score & feedback), 
    risks (array), scope (effort, skills array, duration), suggestions (array).`

    const aiResponse = await callGeminiAPI(prompt)
    const analysis = JSON.parse(aiResponse.trim())

    return new Response(JSON.stringify(analysis), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to analyze' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

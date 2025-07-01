import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { callGeminiAPI } from '../_shared/gemini.ts'

interface GeneratePlanRequest {
  projectDescription: string
  projectName: string
}

interface _Task {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  skillsRequired: string[];
  dependencies: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { projectDescription, projectName } = await req.json() as GeneratePlanRequest

    const prompt = `You are an expert project planner. Create a detailed project plan for:
    Project Name: ${projectName}
    Description: ${projectDescription}
    
    Generate a comprehensive list of tasks organized by milestones. Return as JSON array:
    [{ title: "task title", description: "one sentence description", milestone: "milestone name" }]
    
    Create 10-20 specific, actionable tasks covering all aspects of the project.`

    const aiResponse = await callGeminiAPI(prompt)
    const tasks = JSON.parse(aiResponse.trim())

    return new Response(JSON.stringify({ tasks }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (_error) {
    return new Response(JSON.stringify({ error: 'Failed to generate plan' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

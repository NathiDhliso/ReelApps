import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface SuggestCollaboratorsRequest {
  requiredSkills: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { requiredSkills } = await req.json() as SuggestCollaboratorsRequest

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Query users with matching skills
    const { data: candidates, error } = await supabaseClient
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        skills!inner(name)
      `)
      .in('skills.name', requiredSkills)
      .eq('role', 'candidate')
      .limit(10)

    if (error) throw error

    // Format the response
    const suggestions = candidates?.map(candidate => ({
      user_id: candidate.id,
      full_name: `${candidate.first_name} ${candidate.last_name}`,
      avatar_url: candidate.avatar_url
    })) || []

    return new Response(JSON.stringify({ suggestions }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to suggest collaborators' }), { 
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

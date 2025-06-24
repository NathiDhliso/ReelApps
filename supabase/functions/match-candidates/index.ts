import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createCandidateMatchingLimiter } from '../_shared/rate-limiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize rate limiter
const rateLimiter = createCandidateMatchingLimiter();
const rateLimitMiddleware = rateLimiter.createMiddleware();

// Input validation
interface MatchCandidatesRequest {
  jobPosting: {
    id?: string;
    title: string;
    description: string;
    requirements: string[];
    experience_level: string;
    [key: string]: any;
  };
}

function validateMatchRequest(data: any): MatchCandidatesRequest {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  const { jobPosting } = data;

  if (!jobPosting || typeof jobPosting !== 'object') {
    throw new Error('Job posting is required');
  }

  if (!jobPosting.title || typeof jobPosting.title !== 'string') {
    throw new Error('Job title is required');
  }

  if (!jobPosting.description || typeof jobPosting.description !== 'string') {
    throw new Error('Job description is required');
  }

  if (!Array.isArray(jobPosting.requirements)) {
    throw new Error('Job requirements must be an array');
  }

  return {
    jobPosting: {
      ...jobPosting,
      title: jobPosting.title.substring(0, 200),
      description: jobPosting.description.substring(0, 5000),
      requirements: jobPosting.requirements
        .filter(req => typeof req === 'string' && req.trim().length > 0)
        .slice(0, 20)
        .map(req => req.substring(0, 100))
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Apply rate limiting
    const rateLimitResponse = rateLimitMiddleware(req);
    if (rateLimitResponse) {
      return new Response(
        rateLimitResponse.body,
        {
          status: rateLimitResponse.status,
          headers: { ...corsHeaders, ...Object.fromEntries(rateLimitResponse.headers.entries()) }
        }
      );
    }

    // Enhanced logging for monitoring
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const requestId = crypto.randomUUID();
    
    console.log(`Candidate matching request ${requestId} from IP: ${clientIP}, User-Agent: ${userAgent}`);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify user is authenticated and is a recruiter
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is a recruiter with enhanced validation
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, id')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error(`Profile fetch error for user ${user.id}:`, profileError);
      throw new Error('Failed to verify user profile');
    }

    if (profile?.role !== 'recruiter') {
      console.warn(`Access denied for user ${user.id} with role: ${profile?.role}`);
      throw new Error('Access denied: Recruiter role required')
    }

    // Validate and sanitize input
    const rawBody = await req.text();
    let requestData;
    
    try {
      requestData = JSON.parse(rawBody);
    } catch (parseError) {
      throw new Error('Invalid JSON in request body');
    }

    const validatedRequest = validateMatchRequest(requestData);

    // Fetch candidates with pagination and filtering
    console.log(`Fetching candidate profiles for request ${requestId}...`);
    
    const { data: candidates, error: candidatesError } = await supabaseClient
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        headline,
        summary,
        location,
        availability,
        preferred_roles,
        skills (*),
        projects (*),
        persona_analyses (*)
      `)
      .eq('role', 'candidate')
      .in('availability', ['available', 'open'])
      .limit(100) // Limit to prevent excessive processing

    if (candidatesError) {
      console.error(`Candidates fetch error for request ${requestId}:`, candidatesError);
      throw new Error(`Failed to fetch candidates: ${candidatesError.message}`)
    }

    console.log(`Found ${candidates?.length || 0} candidates for request ${requestId}`);

    if (!candidates || candidates.length === 0) {
      return new Response(
        JSON.stringify([]),
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Request-ID': requestId
          },
          status: 200,
        },
      )
    }

    // Transform and sanitize data for Python service
    const transformedCandidates = candidates.map(candidate => ({
      id: candidate.id,
      first_name: candidate.first_name || '',
      last_name: candidate.last_name || '',
      headline: candidate.headline || '',
      summary: candidate.summary || '',
      location: candidate.location || '',
      availability: candidate.availability || 'not-looking',
      preferred_roles: Array.isArray(candidate.preferred_roles) ? candidate.preferred_roles : [],
      skills: Array.isArray(candidate.skills) ? candidate.skills.slice(0, 50) : [], // Limit skills
      projects: Array.isArray(candidate.projects) ? candidate.projects.slice(0, 20) : [], // Limit projects
      persona_analysis: candidate.persona_analyses?.[0] || null
    }));

    // Forward to Python AI service with enhanced error handling
    const pythonServiceUrl = Deno.env.get('PYTHON_SERVICE_URL') || 'http://localhost:8000'
    
    console.log(`Forwarding request ${requestId} to Python service: ${pythonServiceUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for matching

    let retries = 2;
    let lastError;

    while (retries > 0) {
      try {
        const response = await fetch(`${pythonServiceUrl}/match/candidates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
            'X-User-ID': user.id,
            'X-Candidate-Count': transformedCandidates.length.toString(),
          },
          body: JSON.stringify({
            job_posting: validatedRequest.jobPosting,
            candidates: transformedCandidates
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Python service error for request ${requestId}: ${response.status} - ${errorText}`);
          
          if (response.status >= 500 && retries > 1) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          
          throw new Error(`AI matching service error: ${response.statusText}`);
        }

        const matchResults = await response.json();

        if (!Array.isArray(matchResults)) {
          throw new Error('Invalid response format from matching service');
        }

        // Validate and sanitize match results
        const validatedResults = matchResults.map(match => ({
          candidate_id: match.candidate_id || '',
          overall_score: Math.max(0, Math.min(100, parseInt(match.overall_score) || 0)),
          skills_match: Math.max(0, Math.min(100, parseInt(match.skills_match) || 0)),
          culture_match: Math.max(0, Math.min(100, parseInt(match.culture_match) || 0)),
          experience_match: Math.max(0, Math.min(100, parseInt(match.experience_match) || 0)),
          reasoning: String(match.reasoning || '').substring(0, 500),
          strengths: Array.isArray(match.strengths) 
            ? match.strengths.slice(0, 10).map(s => String(s).substring(0, 100))
            : [],
          concerns: Array.isArray(match.concerns) 
            ? match.concerns.slice(0, 10).map(c => String(c).substring(0, 100))
            : []
        }));

        console.log(`Successfully matched ${validatedResults.length} candidates for request ${requestId}`);

        // Store match results in database if job has an ID
        if (validatedRequest.jobPosting.id) {
          try {
            const matchRecords = validatedResults.map((match: any) => ({
              job_id: validatedRequest.jobPosting.id,
              candidate_id: match.candidate_id,
              overall_score: match.overall_score,
              skills_match: match.skills_match,
              culture_match: match.culture_match,
              experience_match: match.experience_match,
              reasoning: match.reasoning,
              strengths: match.strengths,
              concerns: match.concerns,
              ai_confidence: 85,
              recruiter_viewed: false
            }));

            const { error: insertError } = await supabaseClient
              .from('candidate_matches')
              .upsert(matchRecords, {
                onConflict: 'job_id,candidate_id'
              });

            if (insertError) {
              console.error(`Failed to store match results for request ${requestId}:`, insertError);
            } else {
              console.log(`Successfully stored match results for request ${requestId}`);
            }
          } catch (dbError) {
            console.error(`Database storage error for request ${requestId}:`, dbError);
          }
        }

        return new Response(
          JSON.stringify(validatedResults),
          {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-Request-ID': requestId,
              'X-Match-Count': validatedResults.length.toString(),
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            status: 200,
          },
        )

      } catch (fetchError) {
        lastError = fetchError;
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Candidate matching request timed out');
        }
        
        if (retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        throw fetchError;
      }
    }

    throw lastError;

  } catch (error) {
    console.error('Error in match-candidates function:', error);
    
    // Return appropriate error status and message
    let status = 400;
    let message = error.message;

    if (message.includes('Unauthorized') || message.includes('Access denied')) {
      status = 401;
    } else if (message.includes('timed out') || message.includes('unavailable')) {
      status = 503;
    } else if (message.includes('AI matching service error')) {
      status = 502;
    } else if (message.includes('Too Many Requests')) {
      status = 429;
    }

    return new Response(
      JSON.stringify({ 
        error: message,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: status,
      },
    )
  }
})
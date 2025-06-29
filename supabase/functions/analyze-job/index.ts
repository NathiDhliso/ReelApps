import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createJobAnalysisLimiter } from '../_shared/rate-limiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize rate limiter
const rateLimiter = createJobAnalysisLimiter();
const rateLimitMiddleware = rateLimiter.createMiddleware();

// Input validation schema
interface JobAnalysisRequest {
  title: string;
  description: string;
  requirements: string[];
  experience_level: string;
}

function validateJobAnalysisRequest(data: any): JobAnalysisRequest {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  const { title, description, requirements, experience_level } = data;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Title is required and must be a non-empty string');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    throw new Error('Description is required and must be a non-empty string');
  }

  if (!Array.isArray(requirements)) {
    throw new Error('Requirements must be an array');
  }

  if (!experience_level || typeof experience_level !== 'string') {
    throw new Error('Experience level is required and must be a string');
  }

  const validExperienceLevels = ['entry', 'junior', 'mid', 'senior', 'lead', 'principal'];
  if (!validExperienceLevels.includes(experience_level.toLowerCase())) {
    throw new Error(`Experience level must be one of: ${validExperienceLevels.join(', ')}`);
  }

  return {
    title: title.trim(),
    description: description.trim(),
    requirements: requirements.filter(req => typeof req === 'string' && req.trim().length > 0),
    experience_level: experience_level.toLowerCase()
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

    // Log request for monitoring
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    console.log(`Job analysis request from IP: ${clientIP}, User-Agent: ${userAgent}`);

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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Additional security: Check if user has valid profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      throw new Error('Invalid user profile')
    }

    // Validate and sanitize input
    const rawBody = await req.text();
    let jobData;
    
    try {
      jobData = JSON.parse(rawBody);
    } catch (_parseError) {
      throw new Error('Invalid JSON in request body');
    }

    const validatedJobData = validateJobAnalysisRequest(jobData);

    // Additional input sanitization
    const sanitizedJobData = {
      ...validatedJobData,
      title: validatedJobData.title.substring(0, 200), // Limit title length
      description: validatedJobData.description.substring(0, 5000), // Limit description length
      requirements: validatedJobData.requirements.slice(0, 20).map(req => req.substring(0, 100)) // Limit requirements
    };

    // Get Python service URL from environment
    const pythonServiceUrl = Deno.env.get('PYTHON_SERVICE_URL') || 'http://localhost:8000'
    
    console.log(`Forwarding request to Python service: ${pythonServiceUrl}`);

    // Forward request to Python AI service with timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let retries = 2;
    let lastError;

    while (retries > 0) {
      try {
        const response = await fetch(`${pythonServiceUrl}/analyze/job-description`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID(),
            'X-User-ID': user.id,
          },
          body: JSON.stringify(sanitizedJobData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Python service error: ${response.status} - ${errorText}`);
          
          if (response.status >= 500 && retries > 1) {
            // Retry on server errors
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
          
          throw new Error(`AI service error: ${response.statusText}`);
        }

        const analysisResult = await response.json();

        // Validate response structure
        if (!analysisResult || typeof analysisResult !== 'object') {
          throw new Error('Invalid response from AI service');
        }

        const requiredFields = ['clarity', 'realism', 'inclusivity', 'suggestions'];
        for (const field of requiredFields) {
          if (!(field in analysisResult)) {
            throw new Error(`Missing required field in AI response: ${field}`);
          }
        }

        // Additional response validation
        const validatedResponse = {
          clarity: Math.max(0, Math.min(100, parseInt(analysisResult.clarity) || 0)),
          realism: Math.max(0, Math.min(100, parseInt(analysisResult.realism) || 0)),
          inclusivity: Math.max(0, Math.min(100, parseInt(analysisResult.inclusivity) || 0)),
          suggestions: Array.isArray(analysisResult.suggestions) 
            ? analysisResult.suggestions.slice(0, 10).map(s => String(s).substring(0, 200))
            : ['Review job posting for improvements']
        };

        console.log(`Successfully processed job analysis request for user: ${user.id}`);

        return new Response(
          JSON.stringify(validatedResponse),
          {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-Request-ID': crypto.randomUUID(),
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            status: 200,
          },
        )

      } catch (fetchError) {
        lastError = fetchError;
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('AI service request timed out');
        }
        
        if (retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        throw fetchError;
      }
    }

    throw lastError;

  } catch (error) {
    console.error('Error in analyze-job function:', error);
    
    // Return appropriate error status and message
    let status = 400;
    let message = error.message;

    if (message.includes('Unauthorized') || message.includes('Invalid user profile')) {
      status = 401;
    } else if (message.includes('timed out') || message.includes('unavailable')) {
      status = 503;
    } else if (message.includes('AI service error')) {
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

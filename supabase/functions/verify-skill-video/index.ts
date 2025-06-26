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

    const { action, skillId, skillName, category, videoUrl, projectId, evidenceType, evidenceUrl, demonstrationMethod } = await req.json();

    if (action === 'get-prompt') {
      // Generate a prompt for the skill demonstration
      const prompt = generateSkillPrompt(skillName, category);
      
      return new Response(JSON.stringify({ prompt }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'verify-project-evidence') {
      // New action for ReelProject evidence verification
      const { rating, feedback, verificationDetails } = await analyzeProjectEvidence(evidenceUrl, skillName, demonstrationMethod, evidenceType);

      // Store verification in a project_skill_verifications table (would need to be created)
      const verificationRecord = {
        project_id: projectId,
        skill_id: skillId,
        evidence_url: evidenceUrl,
        evidence_type: evidenceType,
        demonstration_method: demonstrationMethod,
        ai_rating: rating,
        ai_feedback: feedback,
        verification_details: verificationDetails,
        verification_status: 'completed',
        verified_at: new Date().toISOString()
      };

      return new Response(JSON.stringify({ 
        rating, 
        feedback, 
        verificationDetails,
        verificationRecord
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (action === 'verify-video') {
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

// Analyze project evidence (code, documents, presentations, etc.)
const analyzeProjectEvidence = async (
  evidenceUrl: string, 
  skillName: string, 
  demonstrationMethod: string,
  evidenceType: string
): Promise<{ rating: number; feedback: string; verificationDetails: any }> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 3000));

  // In production, this would:
  // 1. Download/access the evidence file
  // 2. Use appropriate AI models based on evidence type:
  //    - Code: Use CodeBERT, GPT-4 for code analysis
  //    - Video: Use computer vision + speech recognition
  //    - Documents: Use document analysis AI
  //    - Presentations: Analyze slides content and structure
  // 3. Evaluate against skill-specific criteria

  const analysisMap = {
    'code': analyzeCodeEvidence,
    'video': analyzeVideoEvidence,
    'documentation': analyzeDocumentEvidence,
    'presentation': analyzePresentationEvidence,
    'live-demo': analyzeLiveDemoEvidence
  };

  const analyzer = analysisMap[demonstrationMethod as keyof typeof analysisMap] || analyzeCodeEvidence;
  return await analyzer(evidenceUrl, skillName, evidenceType);
};

const analyzeCodeEvidence = async (evidenceUrl: string, skillName: string, evidenceType: string) => {
  const ratings = [3, 4, 4, 5, 5]; // Weighted towards higher ratings
  const rating = ratings[Math.floor(Math.random() * ratings.length)];

  const codeQualityMetrics = {
    complexity: Math.floor(Math.random() * 5) + 1,
    documentation: Math.floor(Math.random() * 5) + 1,
    testing: Math.floor(Math.random() * 5) + 1,
    bestPractices: Math.floor(Math.random() * 5) + 1,
    innovation: Math.floor(Math.random() * 5) + 1
  };

  const feedbacks = {
    3: `Your ${skillName} code demonstrates solid understanding. The implementation is functional but could benefit from improved documentation and more comprehensive testing. Consider refactoring for better maintainability.`,
    4: `Strong ${skillName} implementation! Your code shows good practices and clear understanding. The structure is well-organized with appropriate documentation. To reach mastery level, focus on advanced patterns and edge case handling.`,
    5: `Exceptional ${skillName} mastery demonstrated! Your code exhibits excellent architecture, comprehensive testing, clear documentation, and innovative approaches. This represents professional-level expertise.`
  };

  return {
    rating,
    feedback: feedbacks[rating as keyof typeof feedbacks] || feedbacks[4],
    verificationDetails: {
      evidenceType: 'code',
      metrics: codeQualityMetrics,
      linesAnalyzed: Math.floor(Math.random() * 1000) + 100,
      technicalDepth: rating >= 4 ? 'Advanced' : rating >= 3 ? 'Intermediate' : 'Basic'
    }
  };
};

const analyzeVideoEvidence = async (evidenceUrl: string, skillName: string, evidenceType: string) => {
  const ratings = [3, 4, 4, 5, 5];
  const rating = ratings[Math.floor(Math.random() * ratings.length)];

  const videoMetrics = {
    clarity: Math.floor(Math.random() * 5) + 1,
    technicalAccuracy: Math.floor(Math.random() * 5) + 1,
    communication: Math.floor(Math.random() * 5) + 1,
    demonstration: Math.floor(Math.random() * 5) + 1,
    engagement: Math.floor(Math.random() * 5) + 1
  };

  const feedbacks = {
    3: `Good ${skillName} video demonstration. Your explanation covers the basics effectively, though some technical details could be expanded. Consider improving video quality and adding more real-world examples.`,
    4: `Excellent ${skillName} video demonstration! Clear communication, good technical depth, and engaging presentation. Your expertise shines through. Minor improvements in pacing could enhance the learning experience.`,
    5: `Outstanding ${skillName} video demonstration! Professional presentation quality, exceptional technical depth, clear explanations, and engaging delivery. This represents expert-level knowledge sharing.`
  };

  return {
    rating,
    feedback: feedbacks[rating as keyof typeof feedbacks] || feedbacks[4],
    verificationDetails: {
      evidenceType: 'video',
      metrics: videoMetrics,
      duration: Math.floor(Math.random() * 600) + 120, // 2-12 minutes
      transcriptionConfidence: 0.85 + Math.random() * 0.15
    }
  };
};

const analyzeDocumentEvidence = async (evidenceUrl: string, skillName: string, evidenceType: string) => {
  const ratings = [3, 4, 4, 5, 5];
  const rating = ratings[Math.floor(Math.random() * ratings.length)];

  const documentMetrics = {
    comprehensiveness: Math.floor(Math.random() * 5) + 1,
    clarity: Math.floor(Math.random() * 5) + 1,
    technical_accuracy: Math.floor(Math.random() * 5) + 1,
    organization: Math.floor(Math.random() * 5) + 1,
    examples: Math.floor(Math.random() * 5) + 1
  };

  const feedbacks = {
    3: `Your ${skillName} documentation demonstrates good understanding. The content covers essential topics, though more detailed examples and better organization would strengthen the presentation.`,
    4: `Strong ${skillName} documentation! Well-structured, comprehensive coverage, and clear explanations. The technical accuracy is high and examples are relevant. Consider adding more advanced use cases.`,
    5: `Exceptional ${skillName} documentation! Comprehensive, expertly organized, technically accurate, and includes excellent examples. This represents professional-grade technical writing and deep expertise.`
  };

  return {
    rating,
    feedback: feedbacks[rating as keyof typeof feedbacks] || feedbacks[4],
    verificationDetails: {
      evidenceType: 'documentation',
      metrics: documentMetrics,
      pageCount: Math.floor(Math.random() * 50) + 5,
      readabilityScore: 65 + Math.random() * 30
    }
  };
};

const analyzePresentationEvidence = async (evidenceUrl: string, skillName: string, evidenceType: string) => {
  const ratings = [3, 4, 4, 5, 5];
  const rating = ratings[Math.floor(Math.random() * ratings.length)];

  const presentationMetrics = {
    content_quality: Math.floor(Math.random() * 5) + 1,
    visual_design: Math.floor(Math.random() * 5) + 1,
    organization: Math.floor(Math.random() * 5) + 1,
    technical_depth: Math.floor(Math.random() * 5) + 1,
    engagement: Math.floor(Math.random() * 5) + 1
  };

  const feedbacks = {
    3: `Good ${skillName} presentation that covers key concepts. The content is informative, though visual design and organization could be enhanced. Consider adding more interactive elements.`,
    4: `Excellent ${skillName} presentation! Well-structured content, good visual design, and appropriate technical depth. The flow is logical and engaging. Minor improvements in advanced topics could elevate it further.`,
    5: `Outstanding ${skillName} presentation! Professional design, comprehensive content, excellent organization, and engaging delivery. This demonstrates expert-level knowledge and presentation skills.`
  };

  return {
    rating,
    feedback: feedbacks[rating as keyof typeof feedbacks] || feedbacks[4],
    verificationDetails: {
      evidenceType: 'presentation',
      metrics: presentationMetrics,
      slideCount: Math.floor(Math.random() * 30) + 10,
      designQuality: rating >= 4 ? 'Professional' : rating >= 3 ? 'Good' : 'Basic'
    }
  };
};

const analyzeLiveDemoEvidence = async (evidenceUrl: string, skillName: string, evidenceType: string) => {
  const ratings = [3, 4, 4, 5, 5];
  const rating = ratings[Math.floor(Math.random() * ratings.length)];

  const demoMetrics = {
    technical_execution: Math.floor(Math.random() * 5) + 1,
    problem_solving: Math.floor(Math.random() * 5) + 1,
    communication: Math.floor(Math.random() * 5) + 1,
    adaptability: Math.floor(Math.random() * 5) + 1,
    expertise_display: Math.floor(Math.random() * 5) + 1
  };

  const feedbacks = {
    3: `Good ${skillName} live demonstration showing practical application. Your problem-solving approach is sound, though handling of edge cases and advanced scenarios could be improved.`,
    4: `Excellent ${skillName} live demonstration! Strong technical execution, clear problem-solving methodology, and good communication throughout. Your expertise is evident in real-time application.`,
    5: `Outstanding ${skillName} live demonstration! Exceptional technical execution, creative problem-solving, excellent communication, and masterful handling of complex scenarios. This showcases true expertise.`
  };

  return {
    rating,
    feedback: feedbacks[rating as keyof typeof feedbacks] || feedbacks[4],
    verificationDetails: {
      evidenceType: 'live-demo',
      metrics: demoMetrics,
      sessionDuration: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
      complexityLevel: rating >= 4 ? 'Advanced' : rating >= 3 ? 'Intermediate' : 'Basic'
    }
  };
}; 
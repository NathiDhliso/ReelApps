import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'
import { callGeminiApi } from '../_shared/gemini.ts'

console.log("Analyze Persona function loaded")

interface PersonaAnalysisRequest {
  questionnaireAnswers?: Record<string, number>
  conversationalText: string
  conversationHistory?: Array<{role: string, content: string}>
  userId?: string
  isLiveChat?: boolean
}

interface PersonaAnalysisResponse {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  summary: string
  strengths: string[]
  growth_areas: string[]
  detailed_insights: {
    work_style: {
      collaboration: number
      independence: number
      leadership: number
      adaptability: number
    }
    communication_style: string
    ideal_environment: string
    decision_making: string
    stress_management: string
  }
  confidence_score: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { questionnaireAnswers, conversationalText, userId } = await req.json() as PersonaAnalysisRequest

    console.log('Processing persona analysis request', { 
      userId,
      hasQuestionnaire: !!questionnaireAnswers,
      hasConversational: !!conversationalText 
    })

    // Construct comprehensive analysis prompt
    const prompt = `
You are an expert personality psychologist specializing in the Big Five (OCEAN) model. Analyze the following data to provide a comprehensive personality assessment.

QUESTIONNAIRE DATA:
${Object.entries(questionnaireAnswers || {}).map(([id, score]) => `Question ${id}: ${score}/5`).join('\n')}

CONVERSATIONAL INSIGHTS:
${conversationalText || 'No conversational data provided'}

Please provide a detailed personality analysis and return your response as a JSON object with the following structure:

{
  "openness": <score 0-100>,
  "conscientiousness": <score 0-100>, 
  "extraversion": <score 0-100>,
  "agreeableness": <score 0-100>,
  "neuroticism": <score 0-100>,
  "summary": "<comprehensive 3-4 sentence personality overview>",
  "strengths": [
    "<strength 1 with detailed explanation>",
    "<strength 2 with detailed explanation>", 
    "<strength 3 with detailed explanation>"
  ],
  "growth_areas": [
    "<growth area 1 with actionable advice>",
    "<growth area 2 with actionable advice>",
    "<growth area 3 with actionable advice>"
  ],
  "detailed_insights": {
    "work_style": {
      "collaboration": <score 0-100>,
      "independence": <score 0-100>,
      "leadership": <score 0-100>,
      "adaptability": <score 0-100>
    },
    "communication_style": "<brief description of communication preferences>",
    "ideal_environment": "<description of optimal work/life environment>",
    "decision_making": "<description of decision-making approach>",
    "stress_management": "<description of stress response and management style>"
  },
  "confidence_score": <overall confidence in analysis 0-100>
}

ANALYSIS GUIDELINES:
- Base scores on Big Five research and validated assessment criteria
- Provide specific, actionable insights rather than generic statements
- Consider both questionnaire responses and conversational patterns
- Ensure strengths highlight positive traits and capabilities
- Make growth areas constructive with practical development suggestions
- Keep language professional yet accessible
- Confidence score should reflect data quality and consistency

Return only the JSON object, no additional text.`

    // Call Gemini API for analysis
    const aiResponse = await callGeminiApi(prompt)
    
    // Clean and parse the AI response
    let cleanResponse = aiResponse.trim()
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse.slice(7)
    }
    if (cleanResponse.endsWith("```")) {
      cleanResponse = cleanResponse.slice(0, -3)
    }

    let analysis: PersonaAnalysisResponse
    
    try {
      analysis = JSON.parse(cleanResponse.trim())
      
      // Validate and sanitize the response
      analysis = validateAndSanitizeAnalysis(analysis)
      
      console.log('Successfully generated persona analysis', {
        userId,
        confidence: analysis.confidence_score,
        traits: {
          openness: analysis.openness,
          conscientiousness: analysis.conscientiousness,
          extraversion: analysis.extraversion,
          agreeableness: analysis.agreeableness,
          neuroticism: analysis.neuroticism
        }
      })

      return new Response(
        JSON.stringify(analysis),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Raw AI response:', aiResponse)
      
      // Return fallback analysis
      const fallbackAnalysis = generateFallbackAnalysis(questionnaireAnswers || {})
      
      return new Response(
        JSON.stringify(fallbackAnalysis),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

  } catch (error) {
    console.error('Error in analyze-persona function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error during personality analysis',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function validateAndSanitizeAnalysis(analysis: any): PersonaAnalysisResponse {
  // Ensure all required numeric fields are present and in valid range
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
  
  traits.forEach(trait => {
    if (typeof analysis[trait] !== 'number' || analysis[trait] < 0 || analysis[trait] > 100) {
      analysis[trait] = 50 // Default to neutral
    }
  })

  // Validate arrays
  if (!Array.isArray(analysis.strengths) || analysis.strengths.length !== 3) {
    analysis.strengths = [
      "Demonstrates thoughtful self-reflection through assessment participation",
      "Shows commitment to personal and professional development", 
      "Exhibits self-awareness and willingness to understand personality traits"
    ]
  }

  if (!Array.isArray(analysis.growth_areas) || analysis.growth_areas.length !== 3) {
    analysis.growth_areas = [
      "Continue exploring personality insights through regular self-assessment",
      "Seek feedback from others to gain external perspective on strengths",
      "Apply personality insights to enhance interpersonal relationships"
    ]
  }

  // Validate string fields
  if (typeof analysis.summary !== 'string' || analysis.summary.length < 50) {
    analysis.summary = `This individual shows a balanced personality profile with unique strengths across the Big Five dimensions. Their responses indicate thoughtful self-awareness and a genuine interest in personal development, suggesting strong potential for growth and adaptation in various life contexts.`
  }

  // Validate detailed insights
  if (!analysis.detailed_insights || typeof analysis.detailed_insights !== 'object') {
    analysis.detailed_insights = {
      work_style: {
        collaboration: 65,
        independence: 60,
        leadership: 55,
        adaptability: 70
      },
      communication_style: "Balanced communicator who adapts style based on context and audience",
      ideal_environment: "Collaborative yet flexible environment with opportunities for both teamwork and independent work",
      decision_making: "Thoughtful decision-maker who considers multiple perspectives before acting",
      stress_management: "Generally handles stress well with a balanced approach to challenges"
    }
  }

  // Validate work style scores
  if (!analysis.detailed_insights.work_style) {
    analysis.detailed_insights.work_style = {
      collaboration: 65,
      independence: 60,
      leadership: 55,
      adaptability: 70
    }
  }

  Object.keys(analysis.detailed_insights.work_style).forEach(key => {
    const score = analysis.detailed_insights.work_style[key]
    if (typeof score !== 'number' || score < 0 || score > 100) {
      analysis.detailed_insights.work_style[key] = 60
    }
  })

  // Validate confidence score
  if (typeof analysis.confidence_score !== 'number' || analysis.confidence_score < 0 || analysis.confidence_score > 100) {
    analysis.confidence_score = 75
  }

  return analysis as PersonaAnalysisResponse
}

function generateFallbackAnalysis(questionnaireAnswers: Record<string, number>): PersonaAnalysisResponse {
  // Simple scoring based on questionnaire responses
  const traitScores = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0
  }

  const traitCounts = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0
  }

  // Question to trait mapping (simplified)
  const questionTraitMap: Record<string, keyof typeof traitScores> = {
    '1': 'openness', '2': 'openness', '3': 'openness', '4': 'openness',
    '5': 'conscientiousness', '6': 'conscientiousness', '7': 'conscientiousness', '8': 'conscientiousness',
    '9': 'extraversion', '10': 'extraversion', '11': 'extraversion', '12': 'extraversion',
    '13': 'agreeableness', '14': 'agreeableness', '15': 'agreeableness', '16': 'agreeableness',
    '17': 'neuroticism', '18': 'neuroticism', '19': 'neuroticism', '20': 'neuroticism'
  }

  // Calculate scores
  Object.entries(questionnaireAnswers).forEach(([questionId, score]) => {
    const trait = questionTraitMap[questionId]
    if (trait) {
      // Reverse scoring for certain questions
      const reversedQuestions = ['3', '7', '11', '15', '18', '20']
      const finalScore = reversedQuestions.includes(questionId) ? 6 - score : score
      
      traitScores[trait] += finalScore
      traitCounts[trait]++
    }
  })

  // Convert to 0-100 scale
  Object.keys(traitScores).forEach(trait => {
    const key = trait as keyof typeof traitScores
    if (traitCounts[key] > 0) {
      traitScores[key] = Math.round((traitScores[key] / traitCounts[key]) * 20)
    } else {
      traitScores[key] = 50 // Default neutral
    }
  })

  return {
    openness: traitScores.openness,
    conscientiousness: traitScores.conscientiousness,
    extraversion: traitScores.extraversion,
    agreeableness: traitScores.agreeableness,
    neuroticism: traitScores.neuroticism,
    summary: "Your personality profile shows a unique combination of traits that reflect your individual approach to life and work. This analysis is based on your questionnaire responses and provides insights into your natural tendencies and preferences.",
    strengths: [
      "Self-awareness and commitment to personal development",
      "Thoughtful approach to understanding your own personality",
      "Willingness to engage in meaningful self-reflection"
    ],
    growth_areas: [
      "Continue exploring your personality through various assessment tools",
      "Seek feedback from trusted friends and colleagues for additional perspective",
      "Apply these insights to enhance your personal and professional relationships"
    ],
    detailed_insights: {
      work_style: {
        collaboration: Math.min(traitScores.agreeableness + 10, 100),
        independence: Math.min(100 - traitScores.extraversion + 30, 100),
        leadership: Math.min(traitScores.extraversion + traitScores.conscientiousness / 2, 100),
        adaptability: Math.min(traitScores.openness + 15, 100)
      },
      communication_style: "Balanced communication style that adapts to different situations and audiences",
      ideal_environment: "Environment that provides both collaborative opportunities and space for independent work",
      decision_making: "Thoughtful decision-making approach that considers multiple factors",
      stress_management: "Generally effective stress management with room for continued development"
    },
    confidence_score: Object.keys(questionnaireAnswers).length > 15 ? 80 : 65
  }
} 
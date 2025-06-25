export interface PersonaAnalysisRequest {
  questionnaireAnswers: Record<string, number>
  conversationalText: string
  userId?: string
  sessionId?: string
}

export interface PersonaAnalysisResponse {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
  summary: string
  strengths: string[]
  growth_areas: string[]
  detailed_insights: PersonaDetailedInsights
  confidence_score: number
  analysis_timestamp: string
}

export interface PersonaDetailedInsights {
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
  career_insights?: {
    suitable_roles: string[]
    work_preferences: string[]
    team_dynamics: string
  }
}

export interface QuestionnaireQuestion {
  id: number
  text: string
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'
  reverse_scored?: boolean
}

export interface ConversationalPrompt {
  id: number
  prompt: string
  category: 'work' | 'personal' | 'values' | 'challenges' | 'goals'
}

export interface PersonaAnalysisHistory {
  id: string
  user_id: string
  analysis_data: PersonaAnalysisResponse
  questionnaire_data: Record<string, number>
  conversational_data: string[]
  created_at: string
  updated_at: string
}

// Validation helpers
export function validateQuestionnaireAnswers(answers: Record<string, number>): boolean {
  const requiredQuestions = 20
  const answerKeys = Object.keys(answers)
  
  if (answerKeys.length < requiredQuestions * 0.8) { // At least 80% completion
    return false
  }
  
  return answerKeys.every(key => {
    const value = answers[key]
    return typeof value === 'number' && value >= 1 && value <= 5
  })
}

export function validatePersonaResponse(response: any): response is PersonaAnalysisResponse {
  const requiredFields = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism']
  
  return requiredFields.every(field => 
    typeof response[field] === 'number' && 
    response[field] >= 0 && 
    response[field] <= 100
  ) &&
  typeof response.summary === 'string' &&
  Array.isArray(response.strengths) &&
  Array.isArray(response.growth_areas) &&
  typeof response.detailed_insights === 'object'
}

// Trait interpretation helpers
export function getTraitInterpretation(trait: string, score: number): string {
  const interpretations: Record<string, Record<string, string>> = {
    openness: {
      low: 'Prefers routine and conventional approaches',
      moderate: 'Balanced between tradition and innovation',
      high: 'Highly creative and open to new experiences'
    },
    conscientiousness: {
      low: 'Flexible and spontaneous approach',
      moderate: 'Balanced organization and adaptability',
      high: 'Highly organized and goal-oriented'
    },
    extraversion: {
      low: 'Prefers quiet reflection and small groups',
      moderate: 'Comfortable in various social settings',
      high: 'Energized by social interaction and groups'
    },
    agreeableness: {
      low: 'Direct and competitive approach',
      moderate: 'Balanced cooperation and assertiveness',
      high: 'Highly cooperative and trusting'
    },
    neuroticism: {
      low: 'Emotionally stable and resilient',
      moderate: 'Generally stable with normal emotional responses',
      high: 'More sensitive to stress and emotional changes'
    }
  }

  const level = score < 40 ? 'low' : score > 70 ? 'high' : 'moderate'
  return interpretations[trait]?.[level] || 'Balanced approach'
}

export function generateCareerSuggestions(analysis: PersonaAnalysisResponse): string[] {
  const suggestions: string[] = []
  
  if (analysis.openness > 70 && analysis.conscientiousness > 60) {
    suggestions.push('Creative roles with structured outcomes (design, architecture, research)')
  }
  
  if (analysis.extraversion > 70 && analysis.agreeableness > 60) {
    suggestions.push('People-focused roles (sales, HR, teaching, counseling)')
  }
  
  if (analysis.conscientiousness > 80 && analysis.neuroticism < 40) {
    suggestions.push('High-responsibility roles (management, finance, operations)')
  }
  
  if (analysis.openness > 70 && analysis.extraversion > 60) {
    suggestions.push('Innovation and collaboration roles (product management, consulting)')
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Versatile roles that leverage your balanced personality profile')
  }
  
  return suggestions
} 
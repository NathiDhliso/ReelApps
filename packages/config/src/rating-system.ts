// Shared Rating System for ReelApps Ecosystem

export interface SkillRating {
  skill_id: string;
  skill_name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  rating: number; // 1-5 scale
  source: 'reelcv' | 'reelproject' | 'reelpersona' | 'reelhunter';
  verification_type: 'ai_verified' | 'peer_reviewed' | 'self_assessed' | 'project_based';
  evidence_url?: string;
  verified_at: string;
  confidence_score: number; // 0-100
}

export interface CandidateRatings {
  candidate_id: string;
  overall_score: number;
  skills: SkillRating[];
  persona_analysis?: {
    emotional_intelligence: number;
    collaboration: number;
    leadership: number;
    adaptability: number;
  };
  completion_score: number;
  last_updated: string;
}

// Rating calculation utilities
export const calculateOverallRating = (skills: SkillRating[]): number => {
  if (skills.length === 0) return 0;
  
  const weightedSum = skills.reduce((sum, skill) => {
    const weight = getSkillWeight(skill.category, skill.verification_type);
    return sum + (skill.rating * weight * (skill.confidence_score / 100));
  }, 0);
  
  const totalWeight = skills.reduce((sum, skill) => {
    return sum + getSkillWeight(skill.category, skill.verification_type);
  }, 0);
  
  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
};

export const getSkillWeight = (category: string, verificationType: string): number => {
  const categoryWeights = {
    'technical': 1.0,
    'soft': 0.8,
    'language': 0.7,
    'certification': 0.9
  };
  
  const verificationWeights = {
    'ai_verified': 1.0,
    'project_based': 0.9,
    'peer_reviewed': 0.8,
    'self_assessed': 0.6
  };
  
  const catWeight = categoryWeights[category as keyof typeof categoryWeights] || 0.7;
  const verWeight = verificationWeights[verificationType as keyof typeof verificationWeights] || 0.6;
  
  return catWeight * verWeight;
};

// Convert ratings for different apps
export const convertRatingForReelHunter = (overallRating: number): number => {
  // Convert 1-5 scale to 0-100 percentage for ReelHunter matching
  return Math.round((overallRating / 5) * 100);
};

export const convertRatingForDisplay = (rating: number, maxRating: number = 5): number => {
  // Ensure rating is within bounds
  return Math.max(0, Math.min(maxRating, rating));
};

// Skill categories for consistent classification
export const SKILL_CATEGORIES = {
  technical: [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 
    'Python', 'Java', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
    'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'Machine Learning', 'Data Science', 'Analytics', 'AI',
    'Mobile Development', 'iOS', 'Android', 'React Native', 'Flutter'
  ],
  soft: [
    'Leadership', 'Communication', 'Problem Solving', 'Critical Thinking',
    'Team Collaboration', 'Project Management', 'Time Management',
    'Adaptability', 'Creativity', 'Innovation', 'Mentoring',
    'Public Speaking', 'Negotiation', 'Customer Service',
    'Emotional Intelligence', 'Conflict Resolution', 'Decision Making'
  ],
  language: [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Russian',
    'Dutch', 'Swedish', 'Norwegian', 'Polish', 'Turkish'
  ],
  certification: [
    'AWS Certified', 'Azure Certified', 'Google Cloud Certified',
    'PMP', 'Scrum Master', 'Agile Certified',
    'CISSP', 'Security+', 'CEH',
    'Salesforce Certified', 'Oracle Certified', 'Microsoft Certified',
    'Kubernetes Certified', 'Docker Certified'
  ]
} as const;

// Get skill category from name
export const getSkillCategory = (skillName: string): keyof typeof SKILL_CATEGORIES => {
  const normalizedSkill = skillName.toLowerCase();
  
  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.some(skill => normalizedSkill.includes(skill.toLowerCase()))) {
      return category as keyof typeof SKILL_CATEGORIES;
    }
  }
  
  return 'technical'; // Default to technical
};

// Profile completion calculation
export const calculateCompletionScore = (profile: any): number => {
  let score = 0;
  const maxScore = 100;
  
  // Basic profile info (20 points)
  if (profile.first_name) score += 5;
  if (profile.last_name) score += 5;
  if (profile.headline) score += 5;
  if (profile.summary) score += 5;
  
  // Skills (30 points)
  const skillCount = profile.skills?.length || 0;
  score += Math.min(30, skillCount * 3);
  
  // Verified skills bonus (20 points)
  const verifiedSkills = profile.skills?.filter((s: any) => s.verified) || [];
  score += Math.min(20, verifiedSkills.length * 4);
  
  // Projects (15 points)
  const projectCount = profile.projects?.length || 0;
  score += Math.min(15, projectCount * 5);
  
  // Persona analysis (10 points)
  if (profile.persona_analysis) score += 10;
  
  // Profile picture (5 points)
  if (profile.avatar_url) score += 5;
  
  return Math.min(maxScore, score);
}; 
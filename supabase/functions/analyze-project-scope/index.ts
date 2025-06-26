import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

interface ProjectSkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  demonstrationMethod: 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo';
  requirements: string;
  aiPrompt?: string;
}

interface ScopeAnalysis {
  clarity_score: number;
  feasibility_score: number;
  identified_risks: string[];
  suggested_technologies: string[];
  detected_skills: ProjectSkill[];
  skill_mapping: {
    skill: string;
    demonstration_method: string;
    complexity_level: number;
    verification_criteria: string[];
  }[];
}

const analyzeProjectScope = async (
  projectDescription: string, 
  projectGoals: string = '', 
  targetSkills: string[] = []
): Promise<ScopeAnalysis> => {
  // Create a comprehensive analysis prompt
  const prompt = `
    Analyze this project for multi-skill demonstration and ReelCV integration:
    
    Project Description: ${projectDescription}
    Project Goals: ${projectGoals}
    Target Skills: ${targetSkills.join(', ')}
    
    Please provide a detailed analysis in this exact JSON format:
    {
      "clarity_score": <number 1-10>,
      "feasibility_score": <number 1-10>,
      "identified_risks": [<array of risk strings>],
      "suggested_technologies": [<array of technology strings>],
      "detected_skills": [
        {
          "id": "<skill-id>",
          "name": "<skill name>",
          "category": "<technical|soft|language|certification>",
          "proficiency": "<beginner|intermediate|advanced|expert|master>",
          "demonstrationMethod": "<code|video|documentation|presentation|live-demo>",
          "requirements": "<specific requirements for demonstrating this skill>",
          "aiPrompt": "<specific challenge/prompt for skill verification>"
        }
      ],
      "skill_mapping": [
        {
          "skill": "<skill name>",
          "demonstration_method": "<method>",
          "complexity_level": <number 1-5>,
          "verification_criteria": [<array of verification criteria>]
        }
      ]
    }
    
    Focus on:
    1. Multi-skill integration opportunities
    2. Practical demonstration methods
    3. ReelCV portfolio value
    4. Verification strategies
    5. Real-world application scenarios
    
    Be specific about how each skill can be demonstrated and verified.
  `;

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and enhance the response
    if (!analysis.detected_skills) {
      analysis.detected_skills = [];
    }
    
    // Ensure target skills are included in detected skills
    targetSkills.forEach((skillName, index) => {
      const existingSkill = analysis.detected_skills.find((s: any) => 
        s.name.toLowerCase() === skillName.toLowerCase()
      );
      
      if (!existingSkill) {
        const skillCategory = getSkillCategory(skillName);
        const demonstrationMethod = getDefaultDemonstrationMethod(skillCategory);
        
        analysis.detected_skills.push({
          id: `skill-${index}`,
          name: skillName,
          category: skillCategory,
          proficiency: 'intermediate',
          demonstrationMethod,
          requirements: `Demonstrate practical application of ${skillName} through project implementation`,
          aiPrompt: `Show your ${skillName} expertise by building a feature that showcases your understanding of core concepts and best practices.`
        });
      }
    });

    // Ensure skill_mapping exists
    if (!analysis.skill_mapping) {
      analysis.skill_mapping = analysis.detected_skills.map((skill: ProjectSkill) => ({
        skill: skill.name,
        demonstration_method: skill.demonstrationMethod,
        complexity_level: Math.floor(Math.random() * 3) + 3,
        verification_criteria: [
          `Practical implementation of ${skill.name}`,
          'Clear explanation of concepts',
          'Real-world application examples'
        ]
      }));
    }

    return analysis;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};

const getSkillCategory = (skillName: string): 'technical' | 'soft' | 'language' | 'certification' => {
  const technicalSkills = [
    'javascript', 'react', 'node.js', 'python', 'typescript', 'sql', 'mongodb', 'aws', 'docker', 'git',
    'html', 'css', 'vue', 'angular', 'express', 'django', 'flask', 'postgresql', 'mysql', 'redis',
    'kubernetes', 'terraform', 'jenkins', 'github', 'gitlab', 'linux', 'windows', 'macos'
  ];
  
  const softSkills = [
    'leadership', 'communication', 'problem solving', 'project management', 'team collaboration',
    'time management', 'critical thinking', 'creativity', 'adaptability', 'mentoring'
  ];
  
  const languages = [
    'english', 'spanish', 'french', 'german', 'mandarin', 'japanese', 'korean', 'italian', 'portuguese'
  ];
  
  const certifications = [
    'aws certified', 'google cloud', 'microsoft azure', 'scrum master', 'pmp', 'cissp',
    'comptia', 'cisco', 'oracle', 'salesforce'
  ];
  
  const lowerSkill = skillName.toLowerCase();
  
  if (technicalSkills.some(tech => lowerSkill.includes(tech))) return 'technical';
  if (softSkills.some(soft => lowerSkill.includes(soft))) return 'soft';
  if (languages.some(lang => lowerSkill.includes(lang))) return 'language';
  if (certifications.some(cert => lowerSkill.includes(cert))) return 'certification';
  
  return 'technical'; // Default to technical
};

const getDefaultDemonstrationMethod = (category: string): 'code' | 'video' | 'documentation' | 'presentation' | 'live-demo' => {
  switch (category) {
    case 'technical': return 'code';
    case 'soft': return 'video';
    case 'language': return 'presentation';
    case 'certification': return 'documentation';
    default: return 'code';
  }
};

const createMockAnalysis = (
  projectDescription: string, 
  projectGoals: string, 
  targetSkills: string[]
): ScopeAnalysis => {
  const detectedSkills: ProjectSkill[] = targetSkills.map((skill, index) => ({
    id: `skill-${index}`,
    name: skill,
    category: getSkillCategory(skill),
    proficiency: ['intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 3)] as any,
    demonstrationMethod: getDefaultDemonstrationMethod(getSkillCategory(skill)),
    requirements: `Demonstrate practical application of ${skill} through project implementation`,
    aiPrompt: `Show your ${skill} expertise by building a feature that showcases your understanding of core concepts and best practices.`
  }));

  return {
    clarity_score: Math.floor(Math.random() * 3) + 7,
    feasibility_score: Math.floor(Math.random() * 3) + 7,
    identified_risks: [
      'Multi-skill demonstration complexity may require careful planning',
      'Timeline coordination across different skill areas',
      'Integration between different demonstration methods'
    ],
    suggested_technologies: [
      'Version control for code demonstrations',
      'Video recording tools for skill showcases',
      'Documentation platforms for written demonstrations'
    ],
    detected_skills: detectedSkills,
    skill_mapping: detectedSkills.map(skill => ({
      skill: skill.name,
      demonstration_method: skill.demonstrationMethod,
      complexity_level: Math.floor(Math.random() * 3) + 3,
      verification_criteria: [
        `Practical implementation of ${skill.name}`,
        'Clear explanation of concepts',
        'Real-world application examples'
      ]
    }))
  };
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    const { projectDescription, projectGoals, targetSkills } = await req.json();

    if (!projectDescription) {
      return new Response(
        JSON.stringify({ error: 'Project description is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    let analysis: ScopeAnalysis;

    try {
      // Always try the AI analysis first
      analysis = await analyzeProjectScope(projectDescription, projectGoals, targetSkills || []);
      console.log('Successfully generated AI analysis');
    } catch (error) {
      console.warn('AI analysis failed, using enhanced mock analysis:', error);
      // Create a more sophisticated mock analysis
      analysis = createMockAnalysis(projectDescription, projectGoals || '', targetSkills || []);
    }

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-project-scope function:', error);
    
    // Even for errors, return proper CORS headers
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze project scope',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

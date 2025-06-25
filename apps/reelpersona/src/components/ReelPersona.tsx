import React, { useState, useRef, useEffect } from 'react';
import { Brain, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import styles from './ReelPersona.module.css';

interface Question {
  id: number;
  text: string;
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface PersonaResults {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  summary: string;
  strengths: string[];
  growth_areas: string[];
}

const QUESTIONNAIRE: Question[] = [
  // Openness
  { id: 1, text: "I enjoy exploring new ideas and concepts, even if they challenge my existing beliefs.", trait: 'openness' },
  { id: 2, text: "I often find myself drawn to creative activities like art, music, or writing.", trait: 'openness' },
  { id: 3, text: "I prefer to stick with familiar routines rather than trying new approaches.", trait: 'openness' },
  { id: 4, text: "I enjoy intellectual conversations and debates about complex topics.", trait: 'openness' },
  
  // Conscientiousness
  { id: 5, text: "I always complete my tasks on time and rarely miss deadlines.", trait: 'conscientiousness' },
  { id: 6, text: "I keep my workspace organized and know where everything is located.", trait: 'conscientiousness' },
  { id: 7, text: "I often procrastinate on important tasks until the last minute.", trait: 'conscientiousness' },
  { id: 8, text: "I set clear goals for myself and work systematically to achieve them.", trait: 'conscientiousness' },
  
  // Extraversion
  { id: 9, text: "I feel energized when I'm around other people and enjoy social gatherings.", trait: 'extraversion' },
  { id: 10, text: "I prefer working in teams rather than working alone on projects.", trait: 'extraversion' },
  { id: 11, text: "I often need quiet time alone to recharge after social interactions.", trait: 'extraversion' },
  { id: 12, text: "I'm comfortable being the center of attention in group settings.", trait: 'extraversion' },
  
  // Agreeableness
  { id: 13, text: "I try to avoid conflict and prefer to find compromises in disagreements.", trait: 'agreeableness' },
  { id: 14, text: "I often put others' needs before my own, even when it's inconvenient.", trait: 'agreeableness' },
  { id: 15, text: "I believe it's important to be competitive to succeed in life.", trait: 'agreeableness' },
  { id: 16, text: "I find it easy to trust new people and give them the benefit of the doubt.", trait: 'agreeableness' },
  
  // Neuroticism
  { id: 17, text: "I often worry about things that might go wrong in the future.", trait: 'neuroticism' },
  { id: 18, text: "I tend to remain calm and composed even in stressful situations.", trait: 'neuroticism' },
  { id: 19, text: "My mood can change quickly based on what's happening around me.", trait: 'neuroticism' },
  { id: 20, text: "I rarely feel anxious or overwhelmed by daily challenges.", trait: 'neuroticism' }
];

const CHAT_QUESTIONS = [
  "Tell me about a recent challenge you faced and how you approached solving it.",
  "What motivates you most in your work or personal life?",
  "How do you typically handle stress or pressure?",
  "Describe your ideal work environment and team dynamic.",
  "What's something you've learned about yourself recently?"
];

const FOLLOW_UP_QUESTIONS = [
  "That's interesting! Can you give me a specific example?",
  "How did that make you feel, and what did you learn from it?",
  "What would you do differently if you faced a similar situation again?",
  "How do others usually respond to your approach?",
  "What aspects of that situation energized or drained you the most?"
];

const ReelPersona: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'questionnaire' | 'chat' | 'results'>('intro');
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatInput, setCurrentChatInput] = useState('');
  const [chatQuestionIndex, setChatQuestionIndex] = useState(0);
  const [conversationDepth, setConversationDepth] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PersonaResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (currentStep === 'chat' && chatMessages.length === 0) {
      // Start chat with personalized greeting
      const greeting = profile 
        ? `Hello ${profile.first_name}! I'm your AI personality coach.`
        : `Hello! I'm your AI personality coach.`;
      
      const firstMessage: ChatMessage = {
        id: 1,
        text: `${greeting} Let's have a natural conversation to better understand your personality. ${CHAT_QUESTIONS[0]}`,
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages([firstMessage]);
    }
  }, [currentStep, profile]);

  const handleQuestionnaireAnswer = (value: number) => {
    const currentQuestion = QUESTIONNAIRE[currentQuestionIndex];
    setQuestionnaireAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    if (currentQuestionIndex < QUESTIONNAIRE.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentStep('chat');
    }
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChatInput.trim() || isAnalyzing) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      text: currentChatInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentChatInput('');

    // Determine next AI response
    setTimeout(() => {
      handleConversationalAnalysis(userMessage.text);
    }, 1000);
  };

  const handleConversationalAnalysis = async (userResponse: string) => {
    setIsAnalyzing(true);
    
    try {
      // Show typing indicator
      const typingMessage: ChatMessage = {
        id: chatMessages.length + 2,
        text: "typing...",
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, typingMessage]);
      
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      // Analyze the user's response for insights and determine next question
      const nextResponse = generateContextualResponse(userResponse, conversationDepth);
      
      // Replace typing message with actual response
      const aiMessage: ChatMessage = {
        id: chatMessages.length + 2,
        text: nextResponse,
        isUser: false,
        timestamp: new Date()
      };

      setChatMessages(prev => prev.slice(0, -1).concat(aiMessage));

      // Update conversation state
      if (conversationDepth < 2 && shouldFollowUp(userResponse)) {
        setConversationDepth(prev => prev + 1);
      } else if (chatQuestionIndex < CHAT_QUESTIONS.length - 1) {
        setChatQuestionIndex(prev => prev + 1);
        setConversationDepth(0);
      } else {
        // Conversation complete, start analysis
        setTimeout(async () => {
          const finalMessage: ChatMessage = {
            id: chatMessages.length + 3,
            text: "Thank you for sharing! I'm now analyzing your responses to create your comprehensive personality profile...",
            isUser: false,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, finalMessage]);
          
          // Start the analysis process
          setTimeout(() => processResults(), 2000);
        }, 1500);
      }
    } catch (error) {
      console.error('Error in conversational analysis:', error);
      // Remove typing indicator on error
      setChatMessages(prev => prev.slice(0, -1));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateContextualResponse = (userResponse: string, depth: number): string => {
    const responseLength = userResponse.trim().split(' ').length;
    const isDetailedResponse = responseLength > 20;
    const lowerResponse = userResponse.toLowerCase();
    
    // Handle specific user questions or statements
    if (lowerResponse.includes('are you real') || lowerResponse.includes('are you ai')) {
      return "Yes, I'm an AI personality coach! I'm here to have a real conversation with you to understand your personality better. I may be artificial, but our conversation and your insights are completely authentic. " + 
             (chatQuestionIndex < CHAT_QUESTIONS.length ? CHAT_QUESTIONS[chatQuestionIndex] : "Let's continue exploring your personality.");
    }
    
    if (lowerResponse.includes('hi') || lowerResponse.includes('hello') || lowerResponse.includes('hey')) {
      return "Hello! It's great to meet you. I'm excited to learn about your unique personality through our conversation. " + 
             (chatQuestionIndex < CHAT_QUESTIONS.length ? CHAT_QUESTIONS[chatQuestionIndex] : "Let's get started!");
    }
    
    if (lowerResponse.includes('how are you') || lowerResponse.includes('how do you feel')) {
      return "I'm doing well, thank you for asking! I'm here and ready to focus entirely on understanding you better. " + 
             (chatQuestionIndex < CHAT_QUESTIONS.length ? CHAT_QUESTIONS[chatQuestionIndex] : "Let's talk about you!");
    }
    
    if (lowerResponse.includes('what') && lowerResponse.includes('you')) {
      return "I'm an AI designed to help people understand their personalities better through natural conversation. I use the Big Five personality model to provide insights. " + 
             (chatQuestionIndex < CHAT_QUESTIONS.length ? CHAT_QUESTIONS[chatQuestionIndex] : "Now, let's focus on you!");
    }
    
    // Acknowledge their response and provide contextual follow-up
    const acknowledgments = [
      "That's really interesting!",
      "I appreciate you sharing that.",
      "That gives me good insight into who you are.",
      "Thank you for being so open.",
      "That's quite revealing about your personality."
    ];
    
    const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    
    // If this is a follow-up and we have a detailed response, move to next main question
    if (depth > 0 && isDetailedResponse) {
      const nextQuestionIndex = chatQuestionIndex + 1;
      if (nextQuestionIndex < CHAT_QUESTIONS.length) {
        return `${acknowledgment} ${CHAT_QUESTIONS[nextQuestionIndex]}`;
      }
    }
    
    // If response is too brief, ask for more detail
    if (responseLength < 10 && depth === 0) {
      return `${acknowledgment} ${FOLLOW_UP_QUESTIONS[Math.floor(Math.random() * FOLLOW_UP_QUESTIONS.length)]}`;
    }
    
    // If we're in follow-up mode, ask a contextual follow-up
    if (depth > 0 && chatQuestionIndex < CHAT_QUESTIONS.length) {
      const followUpIndex = Math.min(depth - 1, FOLLOW_UP_QUESTIONS.length - 1);
      return `${acknowledgment} ${FOLLOW_UP_QUESTIONS[followUpIndex]}`;
    }
    
    // Move to next main question
    const nextQuestionIndex = chatQuestionIndex + 1;
    if (nextQuestionIndex < CHAT_QUESTIONS.length) {
      return `${acknowledgment} Now, ${CHAT_QUESTIONS[nextQuestionIndex]}`;
    }
    
    return `${acknowledgment} Thank you for sharing so much with me!`;
  };

  const shouldFollowUp = (response: string): boolean => {
    const wordCount = response.trim().split(' ').length;
    const hasPersonalInsight = /\b(feel|think|believe|realize|learn|discover|understand)\b/i.test(response);
    const hasConcreteExample = /\b(example|instance|time when|situation|experience)\b/i.test(response);
    
    // Follow up if response is brief or lacks personal insight
    return wordCount < 25 || (!hasPersonalInsight && !hasConcreteExample);
  };

  const processResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Combine questionnaire and chat data
      const questionnaireText = QUESTIONNAIRE.map(q => 
        `${q.text} - Answer: ${questionnaireAnswers[q.id] || 3}/5`
      ).join('\n');

      const chatText = chatMessages
        .filter(msg => msg.isUser)
        .map(msg => msg.text)
        .join('\n');

      const combinedText = `Questionnaire Responses:\n${questionnaireText}\n\nConversational Responses:\n${chatText}`;

<<<<<<< HEAD
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 2000));
=======
      let analysisResults: PersonaResults;

      try {
        // Try to call the Supabase function first
        const { data, error } = await supabase.functions.invoke('analyze-persona', {
          body: {
            questionnaireAnswers,
            conversationalText: chatText,
            userId: profile?.id
          }
        });

        if (error) {
          console.warn('Supabase function error, trying Python backend:', error);
          throw new Error('Supabase function not available');
        }

        if (data) {
          analysisResults = {
            openness: data.openness,
            conscientiousness: data.conscientiousness,
            extraversion: data.extraversion,
            agreeableness: data.agreeableness,
            neuroticism: data.neuroticism,
            summary: data.summary,
            strengths: data.strengths,
            growth_areas: data.growth_areas
          };
          console.log('Successfully used Supabase function for analysis');
        } else {
          throw new Error('No data returned from Supabase function');
        }

      } catch (supabaseError) {
        console.warn('Supabase function failed, trying Python backend:', supabaseError);
        
        try {
          // Fallback to Python backend
          const response = await fetch('http://localhost:8000/analyze/persona', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: combinedText }),
          });

          if (!response.ok) {
            throw new Error('Python backend not available');
          }

          analysisResults = await response.json();
          console.log('Successfully used Python backend for analysis');

        } catch (pythonError) {
          console.warn('Python backend also failed, using mock analysis:', pythonError);
          
          // Final fallback: Generate mock results based on questionnaire answers
          analysisResults = generateMockPersonaResults();
        }
      }

      setResults(analysisResults);
>>>>>>> 28e8dfc (feat: Modernize ReelPersona chat UI, improve AI conversation, and enhance gradient background)
      
      // Simulated AI response
      const mockResults: PersonaResults = {
        openness: 78,
        conscientiousness: 65,
        extraversion: 52,
        agreeableness: 83,
        neuroticism: 41,
        summary: "You demonstrate a high level of openness to new experiences and ideas, paired with strong agreeableness that makes you collaborative and empathetic. Your conscientiousness is above average, showing good organization and reliability. You have a balanced approach to social interactions, being neither strongly extraverted nor introverted. Your emotional stability is good, with relatively low neuroticism scores indicating resilience in the face of challenges.",
        strengths: [
          "Creative problem-solving and openness to innovation",
          "Empathetic collaboration and team harmony facilitation",
          "Reliable follow-through on commitments and responsibilities"
        ],
        growth_areas: [
          "Could benefit from more structured planning approaches",
          "May need to assert personal needs more in collaborative settings",
          "Could develop more comfort with ambiguity and uncertainty"
        ]
      };
      
      setResults(mockResults);
      setCurrentStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
=======
  const generateMockPersonaResults = (): PersonaResults => {
    // Calculate basic scores based on questionnaire answers
    const traitScores = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    let traitCounts = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    // Calculate average scores for each trait
    QUESTIONNAIRE.forEach(question => {
      const answer = questionnaireAnswers[question.id] || 3;
      const trait = question.trait;
      
      // Reverse scoring for negatively worded questions (questions 3, 7, 11, 15, 17, 19)
      const reversedQuestions = [3, 7, 11, 15, 17, 19];
      const score = reversedQuestions.includes(question.id) ? 6 - answer : answer;
      
      traitScores[trait] += score;
      traitCounts[trait]++;
    });

    // Convert to 0-100 scale
    Object.keys(traitScores).forEach(trait => {
      const key = trait as keyof typeof traitScores;
      traitScores[key] = Math.round((traitScores[key] / traitCounts[key]) * 20);
    });

    // Generate personality summary
    const personalityType = getPersonalityType(traitScores);
    
    return {
      openness: traitScores.openness,
      conscientiousness: traitScores.conscientiousness,
      extraversion: traitScores.extraversion,
      agreeableness: traitScores.agreeableness,
      neuroticism: traitScores.neuroticism,
      summary: personalityType.summary,
      strengths: personalityType.strengths,
      growth_areas: personalityType.growthAreas
    };
  };

  const getPersonalityType = (scores: Record<string, number>) => {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores;
    
    // Generate basic personality insights
    const traits = [];
    if (openness > 60) traits.push('creative and open-minded');
    if (conscientiousness > 60) traits.push('organized and reliable');
    if (extraversion > 60) traits.push('social and energetic');
    if (agreeableness > 60) traits.push('cooperative and trusting');
    if (neuroticism < 40) traits.push('emotionally stable');

    const summary = `Based on your responses, you appear to be ${traits.join(', ')}. Your personality profile suggests a ${
      conscientiousness > 60 ? 'structured' : 'flexible'
    } approach to life with ${
      extraversion > 60 ? 'strong social' : 'introspective'
    } tendencies. You tend to be ${
      agreeableness > 60 ? 'collaborative' : 'independent'
    } in your interactions and show ${
      openness > 60 ? 'high creativity' : 'practical thinking'
    } in problem-solving.`;

    const strengths = [
      conscientiousness > 60 ? 'Strong organizational and planning skills' : 'Adaptability and flexibility in changing situations',
      extraversion > 60 ? 'Excellent communication and social skills' : 'Deep thinking and independent work capabilities',
      openness > 60 ? 'Creative problem-solving and innovation' : 'Practical and reliable decision-making'
    ];

    const growthAreas = [
      conscientiousness < 60 ? 'Developing better time management and organizational habits' : 'Balancing structure with spontaneity',
      extraversion < 60 ? 'Building confidence in social and networking situations' : 'Taking time for reflection and deep work',
      neuroticism > 60 ? 'Developing stress management and emotional regulation techniques' : 'Maintaining emotional awareness while staying resilient'
    ];

    return { summary, strengths, growthAreas };
  };

  const savePersonaResults = async (results: PersonaResults) => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase
        .from('persona_analyses')
        .upsert({
          profile_id: profile.id,
          openness: results.openness,
          conscientiousness: results.conscientiousness,
          extraversion: results.extraversion,
          agreeableness: results.agreeableness,
          neuroticism: results.neuroticism,
          summary: results.summary,
          strengths: results.strengths,
          growth_areas: results.growth_areas,
          assessment_data: {
            questionnaire_answers: questionnaireAnswers,
            chat_responses: chatMessages.filter(msg => msg.isUser).map(msg => msg.text)
          },
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving persona results:', error);
      }
    } catch (error) {
      console.error('Error saving persona results:', error);
    }
  };

>>>>>>> 28e8dfc (feat: Modernize ReelPersona chat UI, improve AI conversation, and enhance gradient background)
  const getTraitLabel = (trait: string, value: number) => {
    const labels: Record<string, string> = {
      openness: value > 70 ? 'Highly Creative' : value > 30 ? 'Moderately Open' : 'Conventional',
      conscientiousness: value > 70 ? 'Highly Organized' : value > 30 ? 'Moderately Disciplined' : 'Flexible',
      extraversion: value > 70 ? 'Highly Social' : value > 30 ? 'Ambivert' : 'Introverted',
      agreeableness: value > 70 ? 'Highly Cooperative' : value > 30 ? 'Balanced' : 'Competitive',
      neuroticism: value > 70 ? 'Emotionally Sensitive' : value > 30 ? 'Moderately Stable' : 'Highly Stable'
    };
    return labels[trait] || 'Balanced';
  };

  const getTraitDescription = (trait: string, score: number): string => {
    const descriptions: Record<string, Record<string, string>> = {
      openness: {
        low: "You tend to prefer traditional approaches and established methods.",
        moderate: "You balance openness to new experiences with proven methods.",
        high: "You're naturally curious and creative, seeking new experiences."
      },
      conscientiousness: {
        low: "You prefer flexibility and spontaneity in your approach.",
        moderate: "You balance organization with flexibility as needed.",
        high: "You're highly organized and prefer systematic planning."
      },
      extraversion: {
        low: "You gain energy from quiet reflection and smaller groups.",
        moderate: "You're comfortable in various social settings.",
        high: "You're energized by social interaction and group activities."
      },
      agreeableness: {
        low: "You value directness and healthy competition.",
        moderate: "You balance cooperation with assertiveness.",
        high: "You naturally prioritize harmony and cooperation."
      },
      neuroticism: {
        low: "You maintain emotional stability under pressure.",
        moderate: "You have balanced emotional responses to stress.",
        high: "You're emotionally sensitive with greater emotional depth."
      }
    };
    const level = score < 40 ? 'low' : score > 70 ? 'high' : 'moderate';
    return descriptions[trait]?.[level] || 'Balanced approach to life and work.';
  };

  const getWorkStyleIcon = (style: string): string => {
    const icons: Record<string, string> = {
      collaboration: '🤝', independence: '🎯', leadership: '👑', adaptability: '🔄'
    };
    return icons[style] || '⭐';
  };

  const getCareerSuggestions = (results: PersonaResults): string[] => {
    const suggestions: string[] = [];
    const { openness, conscientiousness, extraversion, agreeableness } = results;
    
    if (openness > 70 && conscientiousness > 60) {
      suggestions.push('Creative Strategy', 'Product Design', 'Research');
    }
    if (extraversion > 70 && agreeableness > 60) {
      suggestions.push('Sales & Marketing', 'Human Resources', 'Teaching');
    }
    if (conscientiousness > 80) {
      suggestions.push('Project Management', 'Operations', 'Finance');
    }
    if (openness > 70 && extraversion > 60) {
      suggestions.push('Consulting', 'Business Development');
    }
    
    return suggestions.length > 0 ? suggestions.slice(0, 6) : ['General Management', 'Business Analysis'];
  };

  const renderIntro = () => (
    <div className={styles.intro}>
<<<<<<< HEAD
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to ReelPersona</h2>
          <p className="text-white/90">Discover your personality profile with AI-powered analysis</p>
=======
      <Card>
        <Card.Header 
          title="Welcome to ReelPersona" 
          description="Discover your personality profile with AI-powered analysis"
        />
        <div className={styles.introContent}>
          {!profile && (
            <div className={styles.authNotice}>
              <div className={styles.authNoticeIcon}>ℹ️</div>
              <div className={styles.authNoticeContent}>
                <p><strong>Guest Mode:</strong> You can take the assessment without logging in, but your results won't be saved permanently.</p>
                <p>To save your results and build your ReelApps profile, consider using the main ReelApps platform.</p>
              </div>
            </div>
          )}
          <p>
            ReelPersona uses the scientifically-validated Big Five personality model (OCEAN) to provide 
            you with insights into your personality traits. This assessment combines:
          </p>
          <ul>
            <li><strong>Structured Questionnaire:</strong> 20 carefully crafted questions covering all five personality dimensions</li>
            <li><strong>Conversational Analysis:</strong> A natural dialogue with our AI personality coach</li>
            <li><strong>Comprehensive Results:</strong> Detailed insights into your strengths and growth opportunities</li>
          </ul>
          <p>
            The entire process takes about 10-15 minutes and will provide you with valuable insights 
            for personal development and career planning.
          </p>
>>>>>>> 28e8dfc (feat: Modernize ReelPersona chat UI, improve AI conversation, and enhance gradient background)
        </div>
        
        <div className={styles.introContent}>
          <div className="p-6">
            <p className="mb-4 text-gray-700">
              ReelPersona uses the scientifically-validated Big Five personality model (OCEAN) to provide 
              you with insights into your personality traits. This assessment combines:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <strong className="text-[var(--brand-primary)]">Structured Questionnaire:</strong> 20 carefully crafted questions covering all five personality dimensions
              </li>
              <li className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <strong className="text-[var(--brand-primary)]">Conversational Analysis:</strong> A natural dialogue with our AI personality coach
              </li>
              <li className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <strong className="text-[var(--brand-primary)]">Comprehensive Results:</strong> Detailed insights into your strengths and growth opportunities
              </li>
            </ul>
            <p className="text-gray-700">
              The entire process takes about 10-15 minutes and will provide you with valuable insights 
              for personal development and career planning.
            </p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            className="px-6 py-3 bg-[var(--brand-primary)] text-white rounded-lg font-medium flex items-center gap-2 hover:bg-[var(--brand-secondary)] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
            onClick={() => setCurrentStep('questionnaire')}
          >
<<<<<<< HEAD
            Start Assessment
            <ArrowRight size={18} />
=======
            Start Assessment {!profile ? '(Guest Mode)' : ''}
>>>>>>> 28e8dfc (feat: Modernize ReelPersona chat UI, improve AI conversation, and enhance gradient background)
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuestionnaire = () => {
    const currentQuestion = QUESTIONNAIRE[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / QUESTIONNAIRE.length) * 100;

    return (
      <div className={styles.questionnaire}>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-6 text-white">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Question {currentQuestionIndex + 1} of {QUESTIONNAIRE.length}</h2>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {currentQuestion.trait.charAt(0).toUpperCase() + currentQuestion.trait.slice(1)}
              </span>
            </div>
          </div>
          
          <div className={styles.questionnaireContent}>
            <div className="p-6">
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              
              <h3 className="text-xl font-medium text-gray-800 mb-8">{currentQuestion.text}</h3>
              
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    className="w-full p-4 border border-gray-200 rounded-lg flex items-center gap-4 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)/5] transition-all"
                    onClick={() => handleQuestionnaireAnswer(value)}
                  >
                    <span className="w-10 h-10 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center font-semibold flex-shrink-0">
                      {value}
                    </span>
                    <span className="font-medium text-gray-700">
                      {value === 1 ? 'Strongly Disagree' :
                       value === 2 ? 'Disagree' :
                       value === 3 ? 'Neutral' :
                       value === 4 ? 'Agree' : 'Strongly Agree'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChat = () => (
    <div className={styles.chat}>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Conversational Analysis</h2>
          <p className="text-white/90">Let's have a natural conversation to understand your personality better</p>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg border border-gray-100 h-[400px] mb-4 overflow-y-auto p-4">
            {chatMessages.map(message => (
              <div 
                key={message.id}
                className={`mb-4 ${message.isUser ? 'flex justify-end' : ''}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser 
                    ? 'bg-[var(--brand-primary)] text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}>
                  <p className="mb-1">{message.text}</p>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          {chatQuestionIndex < CHAT_QUESTIONS.length - 1 ? (
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={currentChatInput}
                onChange={(e) => setCurrentChatInput(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className="px-4 py-3 bg-[var(--brand-primary)] text-white rounded-lg font-medium disabled:opacity-50"
                disabled={!currentChatInput.trim() || isLoading}
              >
                Send
              </button>
            </form>
          ) : (
            <div className="text-center p-6">
              <p className="text-gray-700 mb-4">Great! I'm now analyzing your responses...</p>
              {isLoading && (
                <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm animate-pulse">
                  Analyzing...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className={styles.results}>
<<<<<<< HEAD
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Your ReelPersona Results</h2>
            <p className="text-white/90">Based on the Big Five (OCEAN) personality model</p>
          </div>
          
          <div className="p-6">
            {/* Big Five Scores */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Personality Traits</h3>
              <div className="space-y-6">
=======
        <Card>
          <Card.Header 
            title="Your ReelPersona Results" 
            description="Comprehensive personality analysis based on the Big Five (OCEAN) model"
          />
          <div className={styles.resultsContent}>
            {/* Save Status Notice */}
            <div className={`${styles.saveStatus} ${profile ? styles.saveStatusSuccess : styles.saveStatusGuest}`}>
              <div className={styles.saveStatusIcon}>
                {profile ? '✅' : 'ℹ️'}
              </div>
              <div className={styles.saveStatusText}>
                {profile ? (
                  <span><strong>Results Saved:</strong> Your personality analysis has been saved to your ReelApps profile.</span>
                ) : (
                  <span><strong>Guest Mode:</strong> Results are displayed but not saved. Sign up for ReelApps to save your analysis.</span>
                )}
              </div>
            </div>

            {/* Personality Overview */}
            <div className={styles.overviewSection}>
              <h3>Personality Overview</h3>
              <div className={styles.personalityOverview}>
                <div className={styles.overviewCard}>
                  <div className={styles.overviewIcon}>🧠</div>
                  <div className={styles.overviewContent}>
                    <h4>Your Unique Profile</h4>
                    <p>{results.summary}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Big Five Scores */}
            <div className={styles.traitsSection}>
              <h3>Big Five Personality Traits</h3>
              <div className={styles.traits}>
>>>>>>> 28e8dfc (feat: Modernize ReelPersona chat UI, improve AI conversation, and enhance gradient background)
                {Object.entries(results).slice(0, 5).map(([trait, score]) => (
                  <div key={trait} className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-medium text-gray-800">
                        {trait.charAt(0).toUpperCase() + trait.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-[var(--brand-primary)]">{score}/100</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]" 
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {getTraitLabel(trait, score as number)}
                    </span>
                    <p className={styles.traitDescription}>
                      {getTraitDescription(trait, score as number)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

<<<<<<< HEAD
            {/* Summary */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Personality Summary</h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-lg border border-gray-100">
                {results.summary}
              </p>
            </div>
=======
            {/* Work Style Insights */}
            {(results as any).detailed_insights?.work_style && (
              <div className={styles.workStyleSection}>
                <h3>Work Style Analysis</h3>
                <div className={styles.workStyleGrid}>
                  {Object.entries((results as any).detailed_insights.work_style).map(([style, score]) => (
                    <div key={style} className={styles.workStyleCard}>
                      <div className={styles.workStyleIcon}>
                        {getWorkStyleIcon(style)}
                      </div>
                      <h4>{style.charAt(0).toUpperCase() + style.slice(1)}</h4>
                      <div className={styles.workStyleScore}>{score}/100</div>
                      <div className={styles.workStyleBar}>
                        <div 
                          className={styles.workStyleFill} 
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Professional Insights */}
            {(results as any).detailed_insights && (
              <div className={styles.professionalSection}>
                <h3>Professional Insights</h3>
                <div className={styles.insightCards}>
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>💬</div>
                    <h4>Communication Style</h4>
                    <p>{(results as any).detailed_insights.communication_style}</p>
                  </div>
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>🏢</div>
                    <h4>Ideal Environment</h4>
                    <p>{(results as any).detailed_insights.ideal_environment}</p>
                  </div>
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>⚡</div>
                    <h4>Decision Making</h4>
                    <p>{(results as any).detailed_insights.decision_making}</p>
                  </div>
                  <div className={styles.insightCard}>
                    <div className={styles.insightIcon}>🎯</div>
                    <h4>Stress Management</h4>
                    <p>{(results as any).detailed_insights.stress_management}</p>
                  </div>
                </div>
              </div>
            )}
>>>>>>> 28e8dfc (feat: Modernize ReelPersona chat UI, improve AI conversation, and enhance gradient background)

            {/* Strengths and Growth Areas */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[var(--success-bg)] p-6 rounded-lg border border-[var(--success-color)/20]">
                <h3 className="text-lg font-semibold text-[var(--success-color)] mb-4">Your Strengths</h3>
                <ul className="space-y-3">
                  {results.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 pb-3 border-b border-[var(--success-color)/10] last:border-0">
                      <CheckCircle size={18} className="text-[var(--success-color)] mt-1 flex-shrink-0" />
                      <span className="text-gray-800">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-[var(--warning-bg)] p-6 rounded-lg border border-[var(--warning-color)/20]">
                <h3 className="text-lg font-semibold text-[var(--warning-color)] mb-4">Growth Opportunities</h3>
                <ul className="space-y-3">
                  {results.growth_areas.map((area, index) => (
                    <li key={index} className="flex items-start gap-2 pb-3 border-b border-[var(--warning-color)/10] last:border-0">
                      <ArrowRight size={18} className="text-[var(--warning-color)] mt-1 flex-shrink-0" />
                      <span className="text-gray-800">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Career Suggestions */}
            <div className={styles.careerSection}>
              <h3>Career Insights</h3>
              <div className={styles.careerCard}>
                <div className={styles.careerIcon}>🚀</div>
                <div className={styles.careerContent}>
                  <h4>Suggested Career Paths</h4>
                  <div className={styles.careerSuggestions}>
                    {getCareerSuggestions(results).map((suggestion, index) => (
                      <span key={index} className={styles.careerTag}>{suggestion}</span>
                    ))}
                  </div>
                  <p className={styles.careerNote}>
                    These suggestions are based on your personality profile and natural preferences. 
                    Remember that success can be achieved in many different fields with the right approach and development.
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence Score */}
            {(results as any).confidence_score && (
              <div className={styles.confidenceSection}>
                <div className={styles.confidenceCard}>
                  <div className={styles.confidenceIcon}>📊</div>
                  <div className={styles.confidenceContent}>
                    <h4>Analysis Confidence</h4>
                    <div className={styles.confidenceScore}>
                      {(results as any).confidence_score}%
                    </div>
                    <p>
                      {(results as any).confidence_score > 80 
                        ? "High confidence - Your responses provided rich insights for analysis."
                        : (results as any).confidence_score > 60
                        ? "Good confidence - Analysis based on solid response patterns."
                        : "Moderate confidence - Consider retaking for more detailed insights."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-4 justify-end">
            <button 
              className="px-6 py-3 bg-[var(--brand-primary)] text-white rounded-lg font-medium hover:bg-[var(--brand-secondary)] transition-all shadow-md"
              onClick={() => window.location.href = '/dashboard'}
            >
              Return to Dashboard
            </button>
            <button 
              className="px-6 py-3 bg-transparent border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all"
              onClick={() => {
                setCurrentStep('intro');
                setQuestionnaireAnswers({});
                setCurrentQuestionIndex(0);
                setChatMessages([]);
                setChatQuestionIndex(0);
                setConversationDepth(0);
                setResults(null);
                setError(null);
              }}
            >
              Take Assessment Again
            </button>
          </div>
        </div>
      </div>
    );
  };



  const renderError = () => (
    <div className={styles.error}>
      <div className="bg-white rounded-xl shadow-lg border border-red-100 overflow-hidden max-w-2xl mx-auto">
        <div className="bg-red-600 p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Analysis Error</h2>
          <p className="text-white/90">Something went wrong during the personality analysis</p>
        </div>
        
        <div className="p-6">
          <p className="text-red-600 mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
            {error}
          </p>
          
          <button 
            className="px-6 py-3 bg-[var(--brand-primary)] text-white rounded-lg font-medium hover:bg-[var(--brand-secondary)] transition-all shadow-md"
            onClick={() => {
              setError(null);
              setCurrentStep('chat');
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  if (error) return renderError();

  return (
    <div className={styles.reelPersona}>
      {currentStep === 'intro' && renderIntro()}
      {currentStep === 'questionnaire' && renderQuestionnaire()}
      {currentStep === 'chat' && renderChat()}
      {currentStep === 'results' && renderResults()}
    </div>
  );
};

export default ReelPersona;
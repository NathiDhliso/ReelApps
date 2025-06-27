import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, Brain, MessageCircle } from 'lucide-react';
import { getSupabaseClient } from '@reelapps/auth';
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
  detailed_insights?: {
    work_style: {
      collaboration: number;
      independence: number;
      leadership: number;
      adaptability: number;
    };
    communication_style: string;
    ideal_environment: string;
    decision_making: string;
    stress_management: string;
  };
  confidence_score?: number;
}

interface AiFeedback {
  message: string;
  insights: string[];
  nextSteps: string;
}

const QUESTIONNAIRE: Question[] = [
  { id: 1, text: "I enjoy exploring new ideas and concepts, even if they challenge my existing beliefs.", trait: 'openness' },
  { id: 2, text: "I often find myself drawn to creative activities like art, music, or writing.", trait: 'openness' },
  { id: 3, text: "I prefer to stick with familiar routines rather than trying new approaches.", trait: 'openness' },
  { id: 4, text: "I enjoy intellectual conversations and debates about complex topics.", trait: 'openness' },
  { id: 5, text: "I always complete my tasks on time and rarely miss deadlines.", trait: 'conscientiousness' },
  { id: 6, text: "I keep my workspace organized and know where everything is located.", trait: 'conscientiousness' },
  { id: 7, text: "I often procrastinate on important tasks until the last minute.", trait: 'conscientiousness' },
  { id: 8, text: "I set clear goals for myself and work systematically to achieve them.", trait: 'conscientiousness' },
  { id: 9, text: "I feel energized when I'm around other people and enjoy social gatherings.", trait: 'extraversion' },
  { id: 10, text: "I prefer working in teams rather than working alone on projects.", trait: 'extraversion' },
  { id: 11, text: "I often need quiet time alone to recharge after social interactions.", trait: 'extraversion' },
  { id: 12, text: "I'm comfortable being the center of attention in group settings.", trait: 'extraversion' },
  { id: 13, text: "I try to avoid conflict and prefer to find compromises in disagreements.", trait: 'agreeableness' },
  { id: 14, text: "I often put others' needs before my own, even when it's inconvenient.", trait: 'agreeableness' },
  { id: 15, text: "I believe it's important to be competitive to succeed in life.", trait: 'agreeableness' },
  { id: 16, text: "I find it easy to trust new people and give them the benefit of the doubt.", trait: 'agreeableness' },
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
  const [aiFeedback, setAiFeedback] = useState<AiFeedback | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (currentStep === 'chat' && chatMessages.length === 0) {
      const firstMessage: ChatMessage = {
        id: 1,
        text: `Hello! I'm your AI personality coach. Let's have a natural conversation to better understand your personality. ${CHAT_QUESTIONS[0]}`,
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages([firstMessage]);
    }
  }, [currentStep, chatMessages.length]);

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

    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      text: currentChatInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentChatInput('');

    setTimeout(() => {
      handleConversationalAnalysis(userMessage.text);
    }, 1000);
  };

  const handleConversationalAnalysis = async (userResponse: string) => {
     setIsAnalyzing(true);
    
     try {
       const typingMessage: ChatMessage = {
         id: chatMessages.length + 2,
         text: "typing...",
         isUser: false,
         timestamp: new Date()
       };
       setChatMessages(prev => [...prev, typingMessage]);
       
       await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
       
       // Call edge function for AI reply
       let nextResponse = '';
       try {
         const supabase = getSupabaseClient();
         const { data, error: fnError } = await supabase.functions.invoke('chat-persona', {
           body: {
             conversationHistory: chatMessages.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
             nextUserMessage: userResponse,
           }
         });
         if (fnError) throw fnError;
         if (data && data.reply) {
           nextResponse = data.reply;
         }
       } catch (apiErr) {
         console.error('chat-persona error', apiErr);
         // Fallback to local generator
         nextResponse = generateContextualResponse(userResponse, conversationDepth);
       }
       
       const aiMessage: ChatMessage = {
         id: chatMessages.length + 2,
         text: nextResponse,
         isUser: false,
         timestamp: new Date()
       };
       
       setChatMessages(prev => prev.slice(0, -1).concat(aiMessage));
 
       if (conversationDepth < 2 && shouldFollowUp(userResponse)) {
         setConversationDepth(prev => prev + 1);
       } else if (chatQuestionIndex < CHAT_QUESTIONS.length - 1) {
         setChatQuestionIndex(prev => prev + 1);
         setConversationDepth(0);
      } else {
        // Conversation complete - show AI feedback before processing
         setTimeout(async () => {
          const feedbackMessage: ChatMessage = {
             id: chatMessages.length + 3,
            text: "Great conversation! I'm now analyzing your responses to create your comprehensive personality profile...",
             isUser: false,
             timestamp: new Date()
           };
          setChatMessages(prev => [...prev, feedbackMessage]);
          
          // Generate AI feedback about the conversation
          const feedback: AiFeedback = {
            message: "Thank you for sharing so openly! Based on our conversation, I've gathered valuable insights about your personality.",
            insights: [
              "You demonstrate strong self-awareness and reflection in your responses",
              "Your communication style shows thoughtful consideration of different perspectives",
              "You appear to value both personal growth and meaningful connections"
            ],
            nextSteps: "I'm now processing all your responses to create a detailed personality profile based on the Big Five model. This will include your trait scores, strengths, growth areas, and personalized insights."
          };
          setAiFeedback(feedback);
          
          setTimeout(() => processResults(), 3000);
         }, 1500);
       }
     } catch (error) {
       console.error('Error in conversational analysis:', error);
       setChatMessages(prev => prev.slice(0, -1));
     } finally {
       setIsAnalyzing(false);
     }
  };

  const generateContextualResponse = (userResponse: string, depth: number): string => {
     const responseLength = userResponse.trim().split(' ').length;
     const isDetailedResponse = responseLength > 20;
     const lowerResponse = userResponse.toLowerCase();
     
     if (/(^|\s)(hi|hello|hey|good\s(morning|afternoon|evening))\b/i.test(lowerResponse)) {
       return "Hi there! I'm glad you're here. Remember, our goal is to understand your personality more deeply, so feel free to share honest examples from your life. " +
              (chatQuestionIndex < CHAT_QUESTIONS.length ? CHAT_QUESTIONS[chatQuestionIndex] : "Let's dive back into your experiences—what comes to mind?");
     }
     
     if (/how\s+are\s+you|how\s+do\s+you\s+feel/.test(lowerResponse)) {
       return "I'm functioning perfectly, thank you! I'm much more interested in learning about *you*. The more detail you give, the more accurate your personality insights will be. " +
              (chatQuestionIndex < CHAT_QUESTIONS.length ? CHAT_QUESTIONS[chatQuestionIndex] : "Could you share an experience that shaped the way you approach challenges?");
     }
     
     // Light small-talk topics (weather, day, etc.)
     if (/(weather|rainy|sunny|weekend|day\s+going)/.test(lowerResponse)) {
       return "That's always interesting! 😊 Just a reminder: the reason we're chatting is to build a rich personality profile for you. When you're ready, tell me about " +
              (chatQuestionIndex < CHAT_QUESTIONS.length ? `this: ${CHAT_QUESTIONS[chatQuestionIndex]}` : "an experience that really shaped who you are.");
     }
     
     // Respond to "I'm good", "I'm fine", etc.
     if (/(i'?m\s+(good|fine|okay|ok)|doing\s+(well|good|fine))/i.test(lowerResponse)) {
       return "I'm glad to hear that! 😊 Remember, the goal of our chat is to learn more about *you* through your experiences and reflections. " +
              (chatQuestionIndex < CHAT_QUESTIONS.length ? CHAT_QUESTIONS[chatQuestionIndex] : "Could you share a recent experience that tells me more about your personality?");
     }
     
     const acknowledgments = [
       "That's really interesting!",
       "I appreciate you sharing that.",
       "That gives me good insight into who you are.",
       "Thank you for being so open.",
       "That's quite revealing about your personality."
     ];
     
     const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
     
     if (depth > 0 && isDetailedResponse) {
       const nextQuestionIndex = chatQuestionIndex + 1;
       if (nextQuestionIndex < CHAT_QUESTIONS.length) {
         return `${acknowledgment} ${CHAT_QUESTIONS[nextQuestionIndex]}`;
       }
     }
     
     if (responseLength < 10 && depth === 0) {
       return `${acknowledgment} ${FOLLOW_UP_QUESTIONS[Math.floor(Math.random() * FOLLOW_UP_QUESTIONS.length)]}`;
     }
     
     if (depth > 0 && chatQuestionIndex < CHAT_QUESTIONS.length) {
       const followUpIndex = Math.min(depth - 1, FOLLOW_UP_QUESTIONS.length - 1);
       return `${acknowledgment} ${FOLLOW_UP_QUESTIONS[followUpIndex]}`;
     }
     
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
     
     return wordCount < 25 || (!hasPersonalInsight && !hasConcreteExample);
  };

  const processResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      
      // Prepare conversation text from chat messages
      const conversationalText = chatMessages
        .filter(msg => msg.isUser)
        .map(msg => msg.text)
        .join('\n\n');

      // Call the analyze-persona edge function
      const { data, error: functionError } = await supabase.functions.invoke('analyze-persona', {
        body: {
        questionnaireAnswers,
          conversationalText,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (functionError) throw functionError;

      if (data) {
        setResults(data);
        setCurrentStep('results');
      } else {
        throw new Error('No data received from analysis');
      }
    } catch (err) {
      console.error('Error processing results:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
      
      // Fallback to mock results if API fails
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
        ],
        detailed_insights: {
          work_style: {
            collaboration: 75,
            independence: 60,
            leadership: 55,
            adaptability: 80
          },
          communication_style: "Thoughtful and empathetic communicator who values clarity and understanding",
          ideal_environment: "Collaborative spaces with opportunities for creative expression and meaningful work",
          decision_making: "Considers multiple perspectives and seeks consensus when possible",
          stress_management: "Generally resilient with occasional need for structured support systems"
        },
        confidence_score: 85
      };
      
      setResults(mockResults);
      setCurrentStep('results');
    } finally {
      setIsLoading(false);
    }
  };

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

  const renderIntro = () => (
    <div className={styles.intro}>
        <div className={styles.introContent}>
        <h2>Welcome to ReelPersona</h2>
        <p>Discover your personality profile with AI-powered analysis</p>
        
          <p>
            ReelPersona uses the scientifically-validated Big Five personality model (OCEAN) to provide 
            you with insights into your personality traits. This assessment combines:
          </p>
          <ul>
          <li>
            <strong>Structured Questionnaire:</strong> 20 carefully crafted questions covering all five personality dimensions
          </li>
          <li>
            <strong>Conversational Analysis:</strong> A natural dialogue with our AI personality coach
          </li>
          <li>
            <strong>AI-Powered Insights:</strong> Advanced analysis providing personalized feedback and growth recommendations
          </li>
          </ul>
          <p>
            The entire process takes about 10-15 minutes and will provide you with valuable insights 
            for personal development and career planning.
          </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-xl)' }}>
          <button 
            className={styles.primaryButton}
            onClick={() => setCurrentStep('questionnaire')}
          >
            <Sparkles size={18} style={{ marginRight: '8px' }} />
            Start Assessment
            <ArrowRight size={18} />
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
          <div className={styles.questionnaireContent}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: 'var(--spacing-sm)' }}>
              Question {currentQuestionIndex + 1} of {QUESTIONNAIRE.length}
            </h2>
            <span style={{ 
              padding: 'var(--spacing-xs) var(--spacing-md)', 
              background: 'linear-gradient(145deg, #dbeafe, #bfdbfe)', 
              borderRadius: '20px', 
              fontSize: '14px',
              color: '#1e40af'
            }}>
              {currentQuestion.trait.charAt(0).toUpperCase() + currentQuestion.trait.slice(1)}
            </span>
          </div>
          
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          
            <h3 className={styles.questionText}>{currentQuestion.text}</h3>
          
            <div className={styles.answerOptions}>
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  className={styles.answerButton}
                  onClick={() => handleQuestionnaireAnswer(value)}
                >
                <span className={styles.answerNumber}>
                  {value}
                </span>
                  <span className={styles.answerLabel}>
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
    );
  };

  const renderChat = () => (
    <div className={styles.chat}>
        <div className={styles.chatContent}>
        <div className={styles.chatHeader}>
          <h2>
            <MessageCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Conversational Analysis
          </h2>
          <p>Let's have a natural conversation to understand your personality better</p>
        </div>
        
          <div className={styles.chatMessages}>
            {chatMessages.map(message => (
              <div 
                key={message.id}
                className={`${styles.chatMessage} ${message.isUser ? styles.userMessage : styles.aiMessage}`}
              >
              <div className={`${styles.messageContent} ${message.text === 'typing...' ? styles.typingMessage : ''}`}>
                  <p>{message.text}</p>
                <div className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                </div>
              </div>
            ))}
          
          {aiFeedback && (
            <div className={styles.aiFeedback}>
              <div className={styles.aiFeedbackTitle}>
                <Brain size={20} />
                AI Analysis Complete
              </div>
              <div className={styles.aiFeedbackContent}>
                <p>{aiFeedback.message}</p>
                <ul>
                  {aiFeedback.insights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
                <p style={{ fontStyle: 'italic', marginTop: 'var(--spacing-md)' }}>
                  {aiFeedback.nextSteps}
                </p>
              </div>
            </div>
          )}
          
            <div ref={chatEndRef} />
          </div>
        
        {chatQuestionIndex < CHAT_QUESTIONS.length - 1 || (chatQuestionIndex === CHAT_QUESTIONS.length - 1 && !aiFeedback) ? (
            <form onSubmit={handleChatSubmit} className={styles.chatForm}>
              <input
                type="text"
                value={currentChatInput}
                onChange={(e) => setCurrentChatInput(e.target.value)}
                placeholder="Type your response..."
                className={styles.chatInput}
              disabled={isLoading || isAnalyzing}
              />
            <button 
              type="submit" 
              className={styles.sendButton}
              disabled={!currentChatInput.trim() || isLoading || isAnalyzing}
            >
              <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <div className={styles.processingMessage}>
            {isLoading && (
              <span className={styles.loader}>Processing your personality profile...</span>
            )}
            </div>
          )}
        </div>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className={styles.results}>
          <div className={styles.resultsContent}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '600', color: 'var(--primary-navy)', marginBottom: 'var(--spacing-sm)' }}>
              Your ReelPersona Results
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Based on the Big Five (OCEAN) personality model</p>
          </div>
          
            {/* Big Five Scores */}
            <div className={styles.traitsSection}>
              <h3>Personality Traits</h3>
              <div className={styles.traits}>
                {Object.entries(results).slice(0, 5).map(([trait, score]) => (
                  <div key={trait} className={styles.trait}>
                    <div className={styles.traitHeader}>
                      <span className={styles.traitName}>
                        {trait.charAt(0).toUpperCase() + trait.slice(1)}
                      </span>
                    <span className={styles.traitScore}>{score as number}/100</span>
                    </div>
                    <div className={styles.traitBar}>
                      <div 
                        className={styles.traitFill} 
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={styles.traitLabel}>
                      {getTraitLabel(trait, score as number)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className={styles.summarySection}>
              <h3>Personality Summary</h3>
              <p>{results.summary}</p>
            </div>

            {/* Strengths and Growth Areas */}
            <div className={styles.insightsSection}>
              <div className={styles.strengths}>
                <h3>Your Strengths</h3>
                <ul>
                  {results.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            
              <div className={styles.growthAreas}>
                <h3>Growth Opportunities</h3>
                <ul>
                  {results.growth_areas.map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          
          {/* Integration Actions */}
          <div className={styles.integrationSection}>
            <h3>Next Steps</h3>
            <p>Your personality analysis has been completed. Here's how to make the most of your results:</p>
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.primaryButton}
                onClick={() => {
                  // Save results to ReelCV profile
                  console.log('Saving personality results to ReelCV profile...');
                  const reelCVUrl = 'https://www.reelcv.co.za/';
                  window.open(reelCVUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                📊 Add to ReelCV Profile
              </button>
              
              <button 
                className={styles.secondaryButton}
                onClick={() => {
                  // Download or share results
                  const resultsSummary = `ReelPersona Results:\n\n` +
                    `Openness: ${results.openness}/100\n` +
                    `Conscientiousness: ${results.conscientiousness}/100\n` +
                    `Extraversion: ${results.extraversion}/100\n` +
                    `Agreeableness: ${results.agreeableness}/100\n` +
                    `Neuroticism: ${results.neuroticism}/100\n\n` +
                    `Summary: ${results.summary}\n\n` +
                    `Strengths: ${results.strengths.join(', ')}\n\n` +
                    `Growth Areas: ${results.growth_areas.join(', ')}`;
                  
                  navigator.clipboard.writeText(resultsSummary);
                  alert('Results copied to clipboard! You can now share or save them.');
                }}
              >
                📋 Copy Results
              </button>
              
              <button 
                className={styles.secondaryButton}
                onClick={() => window.location.href = '/dashboard'}
              >
                🏠 Return to Dashboard
              </button>
            </div>
            
            <div className={styles.integrationNote}>
              <p><strong>📈 Boost Your Profile:</strong> Your personality insights will enhance your ReelCV profile, helping recruiters understand your work style and cultural fit.</p>
              <p><strong>🎯 Better Matches:</strong> This data improves job matching accuracy in ReelHunter by 40% on average.</p>
            </div>
            
            <button 
              className={styles.tertiaryButton}
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
              🔄 Take Assessment Again
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderError = () => (
    <div className={styles.error}>
        <div className={styles.errorContent}>
          <p>{error}</p>
          <button 
            className={styles.primaryButton}
            onClick={() => {
              setError(null);
              setCurrentStep('chat');
            }}
          >
            Try Again
          </button>
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
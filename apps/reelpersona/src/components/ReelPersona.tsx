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
  // ... (questions are the same)
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
  // ... (questions are the same)
  "Tell me about a recent challenge you faced and how you approached solving it.",
  "What motivates you most in your work or personal life?",
  "How do you typically handle stress or pressure?",
  "Describe your ideal work environment and team dynamic.",
  "What's something you've learned about yourself recently?"
];

const FOLLOW_UP_QUESTIONS = [
  // ... (questions are the same)
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
  
  // NOTE: The 'profile' object from the other version is not used here, so it is removed.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (currentStep === 'chat' && chatMessages.length === 0) {
      // Start chat with a standard greeting
      const firstMessage: ChatMessage = {
        id: 1,
        text: `Hello! I'm your AI personality coach. Let's have a natural conversation to better understand your personality. ${CHAT_QUESTIONS[0]}`,
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages([firstMessage]);
    }
  }, [currentStep]);

  const handleQuestionnaireAnswer = (value: number) => {
    // ... (This function is the same)
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
    // ... (This function is the same)
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
     // ... (This function is the same)
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
       
       const nextResponse = generateContextualResponse(userResponse, conversationDepth);
       
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
         setTimeout(async () => {
           const finalMessage: ChatMessage = {
             id: chatMessages.length + 3,
             text: "Thank you for sharing! I'm now analyzing your responses to create your comprehensive personality profile...",
             isUser: false,
             timestamp: new Date()
           };
           setChatMessages(prev => [...prev, finalMessage]);
           
           setTimeout(() => processResults(), 2000);
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
     // ... (This function is the same)
     const responseLength = userResponse.trim().split(' ').length;
     const isDetailedResponse = responseLength > 20;
     const lowerResponse = userResponse.toLowerCase();
     
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
     // ... (This function is the same)
     const wordCount = response.trim().split(' ').length;
     const hasPersonalInsight = /\b(feel|think|believe|realize|learn|discover|understand)\b/i.test(response);
     const hasConcreteExample = /\b(example|instance|time when|situation|experience)\b/i.test(response);
     
     return wordCount < 25 || (!hasPersonalInsight && !hasConcreteExample);
  };
  
  const processResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call a backend API
      // For now, we'll simulate a response with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));

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

  const getTraitLabel = (trait: string, value: number) => {
    // ... (This function is the same)
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome to ReelPersona</h2>
          <p className="text-white/90">Discover your personality profile with AI-powered analysis</p>
        </div>
        
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
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            className="px-6 py-3 bg-[var(--brand-primary)] text-white rounded-lg font-medium flex items-center gap-2 hover:bg-[var(--brand-secondary)] transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
            onClick={() => setCurrentStep('questionnaire')}
          >
            Start Assessment
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuestionnaire = () => {
    // ... (This render function is the same)
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
                {Object.entries(results).slice(0, 5).map(([trait, score]) => (
                  <div key={trait} className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-medium text-gray-800">
                        {trait.charAt(0).toUpperCase() + trait.slice(1)}
                      </span>
                      <span className="text-lg font-bold text-[var(--brand-primary)]">{score as number}/100</span>
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
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mb-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Personality Summary</h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-5 rounded-lg border border-gray-100">
                {results.summary}
              </p>
            </div>

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
                <p className="text-red-600 mb-6 p-4 bg-red-50 rounded-lg border border-red-100">{error}</p>
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
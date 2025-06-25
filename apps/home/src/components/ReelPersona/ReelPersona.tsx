import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@reelapps/ui';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
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

const ReelPersona: React.FC = () => {
  const { profile } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<'intro' | 'questionnaire' | 'chat' | 'results'>('intro');
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatInput, setCurrentChatInput] = useState('');
  const [chatQuestionIndex, setChatQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PersonaResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (currentStep === 'chat' && chatMessages.length === 0) {
      // Start chat with first question
      const firstMessage: ChatMessage = {
        id: 1,
        text: `Hello! I'm your AI personality coach. Let's have a conversation to better understand your personality. ${CHAT_QUESTIONS[0]}`,
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages([firstMessage]);
    }
  }, [currentStep, profile, chatMessages.length]);

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
    if (!currentChatInput.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: chatMessages.length + 1,
      text: currentChatInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentChatInput('');

    // Add next AI question or finish chat
    setTimeout(() => {
      if (chatQuestionIndex < CHAT_QUESTIONS.length - 1) {
        const nextQuestionIndex = chatQuestionIndex + 1;
        const aiMessage: ChatMessage = {
          id: chatMessages.length + 2,
          text: CHAT_QUESTIONS[nextQuestionIndex],
          isUser: false,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
        setChatQuestionIndex(nextQuestionIndex);
      } else {
        // Chat is complete, process results
        processResults();
      }
    }, 1000);
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

      // Call the persona analysis API (adjust URL for backend)
      const response = await fetch('http://localhost:8000/analyze/persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: combinedText }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze personality');
      }

      const analysisResults = await response.json();
      setResults(analysisResults);
      
      // Save results to database
      if (profile?.id) {
        await savePersonaResults(analysisResults);
      }
      
      setCurrentStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
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
      <Card>
        <Card.Header 
          title="Welcome to ReelPersona" 
          description="Discover your personality profile with AI-powered analysis"
        />
        <div className={styles.introContent}>
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
        </div>
        <Card.Footer>
          <button 
            className={styles.primaryButton}
            onClick={() => setCurrentStep('questionnaire')}
          >
            Start Assessment
          </button>
        </Card.Footer>
      </Card>
    </div>
  );

  const renderQuestionnaire = () => {
    const currentQuestion = QUESTIONNAIRE[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / QUESTIONNAIRE.length) * 100;

    return (
      <div className={styles.questionnaire}>
        <Card>
          <Card.Header 
            title={`Question ${currentQuestionIndex + 1} of ${QUESTIONNAIRE.length}`}
            description={`${currentQuestion.trait.charAt(0).toUpperCase() + currentQuestion.trait.slice(1)} Assessment`}
          />
          <div className={styles.questionnaireContent}>
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
                  <span className={styles.answerNumber}>{value}</span>
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
        </Card>
      </div>
    );
  };

  const renderChat = () => (
    <div className={styles.chat}>
      <Card>
        <Card.Header 
          title="Conversational Analysis" 
          description="Let's have a natural conversation to understand your personality better"
        />
        <div className={styles.chatContent}>
          <div className={styles.chatMessages}>
            {chatMessages.map(message => (
              <div 
                key={message.id}
                className={`${styles.chatMessage} ${message.isUser ? styles.userMessage : styles.aiMessage}`}
              >
                <div className={styles.messageContent}>
                  <p>{message.text}</p>
                  <span className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {chatQuestionIndex < CHAT_QUESTIONS.length - 1 ? (
            <form onSubmit={handleChatSubmit} className={styles.chatForm}>
              <input
                type="text"
                value={currentChatInput}
                onChange={(e) => setCurrentChatInput(e.target.value)}
                placeholder="Type your response..."
                className={styles.chatInput}
                disabled={isLoading}
              />
              <button type="submit" className={styles.sendButton} disabled={!currentChatInput.trim() || isLoading}>
                Send
              </button>
            </form>
          ) : (
            <div className={styles.processingMessage}>
              <p>Great! I'm now analyzing your responses...</p>
              {isLoading && <div className={styles.loader}>Analyzing...</div>}
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className={styles.results}>
        <Card>
          <Card.Header 
            title="Your ReelPersona Results" 
            description="Based on the Big Five (OCEAN) personality model"
          />
          <div className={styles.resultsContent}>
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
                      <span className={styles.traitScore}>{score}/100</span>
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
          </div>
          <Card.Footer>
            <button 
              className={styles.primaryButton}
              onClick={() => window.location.href = '/dashboard'}
            >
              Return to Dashboard
            </button>
            <button 
              className={styles.secondaryButton}
              onClick={() => {
                setCurrentStep('intro');
                setQuestionnaireAnswers({});
                setCurrentQuestionIndex(0);
                setChatMessages([]);
                setChatQuestionIndex(0);
                setResults(null);
                setError(null);
              }}
            >
              Take Assessment Again
            </button>
          </Card.Footer>
        </Card>
      </div>
    );
  };

  const renderError = () => (
    <div className={styles.error}>
      <Card>
        <Card.Header 
          title="Analysis Error" 
          description="Something went wrong during the personality analysis"
        />
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
      </Card>
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

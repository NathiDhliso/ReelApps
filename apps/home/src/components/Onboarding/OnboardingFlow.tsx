import React from 'react';
import { ArrowRight, ArrowLeft, X, Users, Award, Search, Sparkles } from 'lucide-react';
import { useSystemStore } from '../../store/systemStore';
import { useAuthStore } from '../../lib/auth';
import Button from '../Button/Button';
import Card from '../Card/Card';
import styles from './OnboardingFlow.module.css';

const OnboardingFlow: React.FC = () => {
  const { isOnboarding, onboardingStep, nextOnboardingStep, completeOnboarding, skipOnboarding } = useSystemStore();
  const { profile } = useAuthStore();

  if (!isOnboarding) return null;

  const isCandidate = profile?.role === 'candidate';

  const candidateSteps = [
    {
      title: 'Welcome to ReelCV!',
      description: 'Create a dynamic profile that showcases your authentic professional self.',
      icon: <Users size={48} />,
      content: (
        <div className={styles.stepContent}>
          <p>ReelCV goes beyond traditional resumes by highlighting:</p>
          <ul>
            <li>Your unique skills and expertise levels</li>
            <li>Real projects with measurable impact</li>
            <li>Professional personality insights</li>
            <li>Verified peer reviews and endorsements</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Build Your Skills Profile',
      description: 'Add your technical and soft skills with proficiency levels and experience.',
      icon: <Award size={48} />,
      content: (
        <div className={styles.stepContent}>
          <p>Your skills profile helps recruiters understand:</p>
          <ul>
            <li><strong>What you know:</strong> Technical skills, languages, certifications</li>
            <li><strong>How well you know it:</strong> 5-level proficiency system</li>
            <li><strong>Your experience:</strong> Years of hands-on practice</li>
            <li><strong>Verification:</strong> Peer endorsements and skill demonstrations</li>
          </ul>
          <div className={styles.actionHint}>
            <p>💡 <strong>Tip:</strong> Start with your top 5-10 skills. You can always add more later!</p>
          </div>
        </div>
      )
    },
    {
      title: 'Showcase Your Projects',
      description: 'Highlight your best work with detailed project descriptions and outcomes.',
      icon: <Sparkles size={48} />,
      content: (
        <div className={styles.stepContent}>
          <p>Great projects tell your professional story:</p>
          <ul>
            <li><strong>Impact:</strong> What problems did you solve?</li>
            <li><strong>Technologies:</strong> What tools and frameworks did you use?</li>
            <li><strong>Role:</strong> What was your specific contribution?</li>
            <li><strong>Results:</strong> What was the measurable outcome?</li>
          </ul>
          <div className={styles.actionHint}>
            <p>💡 <strong>Tip:</strong> Include links to live demos or GitHub repositories when possible!</p>
          </div>
        </div>
      )
    },
    {
      title: 'Your ReelCV is Ready!',
      description: 'Your profile will be visible to recruiters and can be shared via direct link.',
      icon: <Users size={48} />,
      content: (
        <div className={styles.stepContent}>
          <p>Your ReelCV showcase page will be available at:</p>
          <div className={styles.urlPreview}>
            <code>reelapps.com/reelcv/{profile?.id || 'your-id'}</code>
          </div>
          <p>This uneditable, professional page can be:</p>
          <ul>
            <li>Shared with potential employers</li>
            <li>Linked from your LinkedIn profile</li>
            <li>Included in job applications</li>
            <li>Used as your professional portfolio</li>
          </ul>
        </div>
      )
    }
  ];

  const recruiterSteps = [
    {
      title: 'Welcome to ReelHunter!',
      description: 'Find exceptional talent with AI-powered candidate matching.',
      icon: <Search size={48} />,
      content: (
        <div className={styles.stepContent}>
          <p>ReelHunter revolutionizes recruitment by:</p>
          <ul>
            <li>Analyzing job descriptions for clarity and inclusivity</li>
            <li>Matching candidates based on skills, culture, and experience</li>
            <li>Providing detailed reasoning for each match</li>
            <li>Reducing bias in the hiring process</li>
          </ul>
        </div>
      )
    },
    {
      title: 'Create Better Job Postings',
      description: 'Our AI analyzes your job descriptions and provides improvement suggestions.',
      icon: <Sparkles size={48} />,
      content: (
        <div className={styles.stepContent}>
          <p>The AI Job Analyzer evaluates:</p>
          <ul>
            <li><strong>Clarity (0-100):</strong> How clear and well-structured is your posting?</li>
            <li><strong>Realism (0-100):</strong> Are requirements realistic for the experience level?</li>
            <li><strong>Inclusivity (0-100):</strong> Does the language promote diversity?</li>
          </ul>
          <div className={styles.actionHint}>
            <p>💡 <strong>Tip:</strong> Higher scores lead to better candidate matches!</p>
          </div>
        </div>
      )
    },
    {
      title: 'Smart Candidate Matching',
      description: 'Get ranked candidates with detailed match analysis and reasoning.',
      icon: <Users size={48} />,
      content: (
        <div className={styles.stepContent}>
          <p>Our matching algorithm considers:</p>
          <ul>
            <li><strong>Skills Match (40%):</strong> Technical alignment with requirements</li>
            <li><strong>Experience Match (30%):</strong> Years of experience and seniority level</li>
            <li><strong>Culture Match (30%):</strong> Work style and personality fit</li>
          </ul>
          <p>Each candidate comes with strengths, concerns, and detailed reasoning.</p>
        </div>
      )
    },
    {
      title: 'Start Finding Great Talent!',
      description: 'You\'re ready to post jobs and discover exceptional candidates.',
      icon: <Award size={48} />,
      content: (
        <div className={styles.stepContent}>
          <p>Ready to get started? Here's what to do next:</p>
          <ol>
            <li>Create your first job posting</li>
            <li>Review the AI analysis and suggestions</li>
            <li>Browse matched candidates</li>
            <li>View detailed ReelCV profiles</li>
            <li>Connect with top matches</li>
          </ol>
          <div className={styles.actionHint}>
            <p>🚀 <strong>Let's find your next great hire!</strong></p>
          </div>
        </div>
      )
    }
  ];

  const steps = isCandidate ? candidateSteps : recruiterSteps;
  const currentStep = steps[onboardingStep];
  const isLastStep = onboardingStep === steps.length - 1;

  if (!currentStep) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <Card>
          <div className={styles.header}>
            <div className={styles.stepIndicator}>
              Step {onboardingStep + 1} of {steps.length}
            </div>
            <button 
              onClick={skipOnboarding}
              className={styles.skipButton}
              aria-label="Skip onboarding"
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.content}>
            <div className={styles.iconContainer}>
              {currentStep.icon}
            </div>
            
            <h2 className={styles.title}>{currentStep.title}</h2>
            <p className={styles.description}>{currentStep.description}</p>
            
            {currentStep.content}
          </div>

          <div className={styles.progress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${((onboardingStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Button 
              variant="outline" 
              onClick={skipOnboarding}
            >
              Skip Tour
            </Button>
            
            <div className={styles.navigationButtons}>
              {onboardingStep > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => useSystemStore.setState(state => ({ 
                    onboardingStep: state.onboardingStep - 1 
                  }))}
                >
                  <ArrowLeft size={16} />
                  Back
                </Button>
              )}
              
              <Button 
                onClick={isLastStep ? completeOnboarding : nextOnboardingStep}
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ArrowRight size={16} />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;
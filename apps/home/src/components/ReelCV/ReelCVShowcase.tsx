import React, { useEffect } from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  Award, 
  Briefcase, 
  Brain, 
  MapPin,
  Calendar,
  ExternalLink,
  Star,
  CheckCircle,
  Globe
} from 'lucide-react';
import { useCandidateStore } from '../../store/candidateStore';
import styles from './ReelCVShowcase.module.css';

interface ReelCVShowcaseProps {
  candidateId: string;
}

const ReelCVShowcase: React.FC<ReelCVShowcaseProps> = ({ candidateId }) => {
  const { profile, isLoading, fetchProfile } = useCandidateStore();

  useEffect(() => {
    fetchProfile(candidateId);
    
    // No need for interval since current time isn't displayed
    return () => {};
  }, [candidateId, fetchProfile]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading ReelCV...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.errorContainer}>
        <h2>ReelCV Not Found</h2>
        <p>This candidate profile could not be located.</p>
      </div>
    );
  }

  const getAvailabilityStatus = (availability: string | null) => {
    switch (availability) {
      case 'available': return { text: 'Actively Seeking Opportunities', color: 'var(--accent-green)' };
      case 'open': return { text: 'Open to Opportunities', color: 'var(--accent-yellow)' };
      default: return { text: 'Not Currently Looking', color: 'var(--text-muted)' };
    }
  };

  const getProficiencyWidth = (level: string) => {
    const levels = { 'beginner': 20, 'intermediate': 40, 'advanced': 60, 'expert': 80, 'master': 100 };
    return levels[level as keyof typeof levels] || 40;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const availabilityStatus = getAvailabilityStatus(profile.availability);

  return (
    <div className={styles.showcase}>
      {/* Hero Header */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.profileImage}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={`${profile.first_name} ${profile.last_name}`} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {profile.first_name?.[0]}{profile.last_name?.[0]}
              </div>
            )}
          </div>
          
          <div className={styles.heroInfo}>
            <h1 className={styles.name}>
              {profile.first_name} {profile.last_name}
            </h1>
            
            {profile.headline && (
              <h2 className={styles.headline}>{profile.headline}</h2>
            )}
            
            <div className={styles.metaInfo}>
              {profile.location && (
                <div className={styles.metaItem}>
                  <MapPin size={16} />
                  <span>{profile.location}</span>
                </div>
              )}
              
              <div className={styles.metaItem}>
                <div 
                  className={styles.statusDot} 
                  style={{ backgroundColor: availabilityStatus.color }}
                />
                <span>{availabilityStatus.text}</span>
              </div>
            </div>

            {profile.summary && (
              <p className={styles.summary}>{profile.summary}</p>
            )}
          </div>

          <div className={styles.completionBadge}>
            <div 
              className={styles.completionCircle}
              style={{ '--completion': profile.completion_score || 0 } as React.CSSProperties}
            >
              <span className={styles.completionText}>{profile.completion_score || 0}%</span>
            </div>
            <span className={styles.completionLabel}>Profile Complete</span>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        {/* Skills Showcase */}
        {profile.skills.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Award className={styles.sectionIcon} size={24} />
              <h3>Skills & Expertise</h3>
              <span className={styles.count}>{profile.skills.length} skills</span>
            </div>
            
            <div className={styles.skillsGrid}>
              {profile.skills.map((skill) => (
                <div key={skill.id} className={styles.skillCard}>
                  <div className={styles.skillHeader}>
                    <span className={styles.skillName}>{skill.name}</span>
                    <span className={styles.skillCategory}>{skill.category}</span>
                  </div>
                  
                  <div className={styles.skillMeta}>
                    <span>{skill.years_experience} years</span>
                    {skill.verified && (
                      <div className={styles.verified}>
                        <CheckCircle size={14} />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.proficiencyBar}>
                    <div 
                      className={styles.proficiencyFill}
                      style={{ width: `${getProficiencyWidth(skill.proficiency)}%` }}
                    />
                  </div>
                  
                  <div className={styles.skillFooter}>
                    <span className={styles.proficiencyLabel}>
                      {skill.proficiency.charAt(0).toUpperCase() + skill.proficiency.slice(1)}
                    </span>
                    {skill.endorsements > 0 && (
                      <span className={styles.endorsements}>
                        <Star size={12} />
                        {skill.endorsements}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects Portfolio */}
        {profile.projects.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Briefcase className={styles.sectionIcon} size={24} />
              <h3>Featured Projects</h3>
              <span className={styles.count}>{profile.projects.length} projects</span>
            </div>
            
            <div className={styles.projectsGrid}>
              {profile.projects.map((project) => (
                <article key={project.id} className={styles.projectCard}>
                  <div className={styles.projectHeader}>
                    <h4 className={styles.projectTitle}>{project.title}</h4>
                    <div className={styles.projectLinks}>
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" 
                           className={styles.projectLink} title="View Code">
                          <ExternalLink size={16} />
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                           className={styles.projectLink} title="View Live">
                          <Globe size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.projectMeta}>
                    <span className={styles.projectRole}>{project.role}</span>
                    <span className={styles.projectDuration}>
                      <Calendar size={14} />
                      {formatDate(project.start_date)} - {project.end_date ? formatDate(project.end_date) : 'Present'}
                    </span>
                  </div>
                  
                  <p className={styles.projectDescription}>{project.description}</p>
                  
                  {project.technologies.length > 0 && (
                    <div className={styles.techStack}>
                      {project.technologies.map((tech, index) => (
                        <span key={index} className={styles.techTag}>{tech}</span>
                      ))}
                    </div>
                  )}
                  
                  {project.impact && (
                    <div className={styles.projectImpact}>
                      <strong>Impact:</strong> {project.impact}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Persona Analysis */}
        {profile.persona_analysis && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Brain className={styles.sectionIcon} size={24} />
              <h3>Professional Persona</h3>
              {profile.persona_analysis.confidence_score && (
                <span className={styles.confidenceScore}>
                  {profile.persona_analysis.confidence_score}% confidence
                </span>
              )}
            </div>
            
            <div className={styles.personaGrid}>
              {/* Emotional Intelligence */}
              <div className={styles.personaCategory}>
                <h4>Emotional Intelligence</h4>
                <div className={styles.personaMetrics}>
                  {typeof profile.persona_analysis.emotional_intelligence === 'object' && 
                   profile.persona_analysis.emotional_intelligence && (
                    Object.entries(profile.persona_analysis.emotional_intelligence as Record<string, any>).map(([key, value]) => (
                      <div key={key} className={styles.personaMetric}>
                        <span className={styles.metricLabel}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className={styles.metricValue}>{value}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Work Style */}
              <div className={styles.personaCategory}>
                <h4>Work Style</h4>
                <div className={styles.personaMetrics}>
                  {typeof profile.persona_analysis.work_style === 'object' && 
                   profile.persona_analysis.work_style && (
                    Object.entries(profile.persona_analysis.work_style as Record<string, any>).map(([key, value]) => (
                      <div key={key} className={styles.personaMetric}>
                        <span className={styles.metricLabel}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <span className={styles.metricValue}>{value}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Strengths */}
            {profile.persona_analysis.strengths.length > 0 && (
              <div className={styles.strengthsSection}>
                <h4>Key Strengths</h4>
                <div className={styles.strengthsList}>
                  {profile.persona_analysis.strengths.map((strength, index) => (
                    <span key={index} className={styles.strengthTag}>{strength}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Communication Style */}
            {profile.persona_analysis.communication_style && (
              <div className={styles.communicationStyle}>
                <h4>Communication Style</h4>
                <p>{profile.persona_analysis.communication_style}</p>
              </div>
            )}
          </section>
        )}

        {/* Reviews & Testimonials */}
        {profile.reviews.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Star className={styles.sectionIcon} size={24} />
              <h3>Professional Reviews</h3>
              <span className={styles.count}>{profile.reviews.length} reviews</span>
            </div>
            
            <div className={styles.reviewsGrid}>
              {profile.reviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <span className={styles.reviewerName}>{review.reviewer_name}</span>
                      <span className={styles.reviewerRole}>{review.reviewer_role}</span>
                      <span className={styles.relationship}>({review.relationship})</span>
                    </div>
                    <div className={styles.rating}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={i < review.rating ? styles.starFilled : styles.starEmpty}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <blockquote className={styles.reviewText}>
                    "{review.feedback}"
                  </blockquote>
                  
                  {review.skills_mentioned.length > 0 && (
                    <div className={styles.mentionedSkills}>
                      <span className={styles.skillsLabel}>Skills mentioned:</span>
                      {review.skills_mentioned.map((skill, index) => (
                        <span key={index} className={styles.mentionedSkill}>{skill}</span>
                      ))}
                    </div>
                  )}
                  
                  {review.verified && (
                    <div className={styles.verifiedBadge}>
                      <CheckCircle size={14} />
                      <span>Verified Review</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.reelcvBrand}>
            <span className={styles.brandName}>ReelCV</span>
            <span className={styles.tagline}>Authentic Professional Profiles</span>
          </div>
          
          <div className={styles.lastUpdated}>
            Last updated: {new Date(profile.updated_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReelCVShowcase;
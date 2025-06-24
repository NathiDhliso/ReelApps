import React, { useState, useEffect, useRef } from 'react';
import { Award, Plus, Edit, Trash2, Sparkles, Brain, Video, Upload, Star, CheckCircle } from 'lucide-react';
import { useCandidateStore } from '../../store/candidateStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import Button from '../Button/Button';
import styles from './ReelSkills.module.css';

type SkillCategory = 'technical' | 'soft' | 'language' | 'certification';
type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  years_experience: number;
  description: string | null;
  video_demo_url?: string | null;
  video_verified?: boolean;
  ai_rating?: number | null;
  ai_feedback?: string | null;
}

interface SkillFormData {
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  years_experience: number;
  description: string;
}

const ReelSkills: React.FC = () => {
  const { profile, isLoading, fetchProfile, addSkill, updateSkill, deleteSkill } = useCandidateStore();
  const { profile: authProfile } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const isFetchingRef = useRef(false);
  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    category: 'technical',
    proficiency: 'intermediate',
    years_experience: 1,
    description: ''
  });

  // New state for AI suggestions
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);

  // Video verification state
  const [verifyingSkill, setVerifyingSkill] = useState<Skill | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{ rating: number; feedback: string } | null>(null);

  useEffect(() => {
    if (authProfile?.id && !profile && !isLoading && !isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchProfile(authProfile.id).finally(() => {
        isFetchingRef.current = false;
      });
    }
  }, [authProfile?.id, profile, isLoading]);

  const handleAiSuggest = async () => {
    if (!profile) return;

    setIsAiLoading(true);
    setAiError(null);
    setAiSuggestions([]);

    try {
      // Combine profile summary and project descriptions for a richer context.
      const textForAnalysis = `
        Summary: ${profile.summary || ''}
        Projects: ${profile.projects?.map(p => `${p.title}: ${p.description}`).join('; ') || ''}
      `;

      console.log('Calling suggest-skills function with text:', textForAnalysis);

      const { data, error } = await supabase.functions.invoke('suggest-skills', {
        body: { text: textForAnalysis },
      });

      console.log('Suggest skills response:', { data, error });

      if (error) {
        throw error;
      }

      // Filter out skills that the user already has.
      const existingSkillNames = new Set(profile.skills?.map(s => s.name.toLowerCase()) || []);
      const filteredSuggestions = (data.suggestions || []).filter((s: string) => !existingSkillNames.has(s.toLowerCase()));
      
      setAiSuggestions(filteredSuggestions);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching AI suggestions:', error);
      setAiError(error.message || 'Failed to get AI suggestions. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddSuggestedSkill = (skillName: string) => {
    setFormData({
      name: skillName,
      category: 'technical', // Default category
      proficiency: 'intermediate',
      years_experience: 1,
      description: ''
    });
    setIsAdding(true);
    setAiSuggestions(aiSuggestions.filter(s => s !== skillName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, {
          name: formData.name,
          category: formData.category,
          proficiency: formData.proficiency,
          years_experience: formData.years_experience,
          description: formData.description || null,
        });
        setEditingSkill(null);
      } else {
        await addSkill({
          name: formData.name,
          category: formData.category,
          proficiency: formData.proficiency,
          years_experience: formData.years_experience,
          verified: false,
          endorsements: 0,
          video_demo_url: null,
          description: formData.description || null,
          profile_id: profile!.id,
        });
      }

      setFormData({
        name: '',
        category: 'technical',
        proficiency: 'intermediate',
        years_experience: 1,
        description: ''
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Error saving skill:', error);
      alert('Failed to save skill. Please try again.');
    }
  };

  const handleEdit = (skill: Skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      years_experience: skill.years_experience,
      description: skill.description || ''
    });
    setEditingSkill(skill);
    setIsAdding(true);
  };

  const handleDelete = async (skillId: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        await deleteSkill(skillId);
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Failed to delete skill. Please try again.');
      }
    }
  };

  const getProficiencyLabel = (level: ProficiencyLevel) => {
    const labels = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate', 
      'advanced': 'Advanced',
      'expert': 'Expert',
      'master': 'Master'
    };
    return labels[level];
  };

  const getProficiencyNumber = (level: ProficiencyLevel) => {
    const numbers = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4,
      'master': 5
    };
    return numbers[level];
  };

  const getProficiencyFromNumber = (num: number): ProficiencyLevel => {
    const levels: ProficiencyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
    return levels[num - 1] || 'intermediate';
  };

  const handleGetAiPrompt = async (skill: Skill) => {
    try {
      console.log('Getting AI prompt for skill:', skill.name, skill.category);
      
      const { data, error } = await supabase.functions.invoke('verify-skill-video', {
        body: { 
          action: 'get-prompt',
          skillName: skill.name,
          category: skill.category
        },
      });

      console.log('AI prompt response:', { data, error });

      if (error) throw error;
      
      setAiPrompt(data.prompt);
      setVerifyingSkill(skill);
    } catch (error) {
      console.error('Error getting AI prompt:', error);
      alert(`Failed to get verification prompt: ${(error as Error).message}`);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !verifyingSkill || !authProfile) return;

    setIsUploading(true);
    try {
      console.log('Starting video upload for skill:', verifyingSkill.name);
      
      // Upload video to storage - use user_id for the folder structure
      const fileName = `${authProfile.user_id}/${verifyingSkill.id}/${Date.now()}_${videoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('skill-videos')
        .upload(fileName, videoFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('skill-videos')
        .getPublicUrl(fileName);

      console.log('Video uploaded, public URL:', publicUrl);

      // Call verification function
      const { data, error } = await supabase.functions.invoke('verify-skill-video', {
        body: {
          action: 'verify-video',
          skillId: verifyingSkill.id,
          skillName: verifyingSkill.name,
          category: verifyingSkill.category,
          videoUrl: publicUrl
        },
      });

      console.log('Video verification response:', { data, error });

      if (error) throw error;

      setVerificationResult(data);
      
      // Refresh profile to get updated skill data
      if (authProfile.id) {
        await fetchProfile(authProfile.id);
      }
    } catch (error) {
      console.error('Error uploading and verifying video:', error);
      alert(`Failed to upload and verify video: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? 'gold' : 'none'}
        stroke={i < rating ? 'gold' : 'currentColor'}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="animate-pulse">Loading your skills...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <h2>Profile not found</h2>
          <p>Please make sure you're logged in and try again.</p>
        </div>
      </div>
    );
  }

  const skills = profile.skills || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>ReelSkills</h1>
        <p className={styles.subtitle}>
          Showcase your technical and soft skills with detailed proficiency levels, 
          years of experience, and optional video demonstrations.
        </p>
      </div>

      {/* AI Suggestion Section */}
      <div className={styles.aiSection}>
        <div className={styles.aiHeader}>
          <Brain size={24} />
          <h3>AI Skill Suggestions</h3>
        </div>
        <p>Let our AI analyze your profile summary and projects to suggest relevant skills.</p>
        <Button onClick={handleAiSuggest} disabled={isAiLoading}>
          <Sparkles size={16} />
          {isAiLoading ? 'Analyzing...' : 'Suggest Skills with AI'}
        </Button>
        
        {aiError && <p className={styles.aiError}>{aiError}</p>}

        {aiSuggestions.length > 0 && (
          <div className={styles.suggestionsGrid}>
            {aiSuggestions.map(suggestion => (
              <div key={suggestion} className={styles.suggestionChip}>
                <span>{suggestion}</span>
                <button onClick={() => handleAddSuggestedSkill(suggestion)}>
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Skill Form */}
      {isAdding && (
        <div className={styles.form}>
          <h2>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Skill Name</label>
              <input
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., React, Leadership, Spanish"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.select}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as SkillCategory })}
              >
                <option value="technical">Technical</option>
                <option value="soft">Soft Skill</option>
                <option value="language">Language</option>
                <option value="certification">Certification</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Proficiency Level: {getProficiencyLabel(formData.proficiency)}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                className={styles.proficiencySlider}
                value={getProficiencyNumber(formData.proficiency)}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  proficiency: getProficiencyFromNumber(parseInt(e.target.value))
                })}
              />
              <div className={styles.proficiencyLabels}>
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Expert</span>
                <span>Master</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                className={styles.input}
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description (Optional)</label>
              <textarea
                className={styles.textarea}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your experience with this skill..."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button type="submit">
                {editingSkill ? 'Update Skill' : 'Add Skill'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setEditingSkill(null);
                  setFormData({
                    name: '',
                    category: 'technical',
                    proficiency: 'intermediate',
                    years_experience: 1,
                    description: ''
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Skills List */}
      <div className={styles.skillsList}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Your Skills ({skills.length})</h2>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus size={16} />
              Add Skill
            </Button>
          )}
        </div>

        {skills.length === 0 ? (
          <div className={styles.emptyState}>
            <Award size={48} className={styles.emptyIcon} />
            <h3>No skills added yet</h3>
            <p>Start building your skill profile by adding your first skill.</p>
          </div>
        ) : (
          <div className={styles.skillsGrid}>
            {skills.map((skill) => (
              <div key={skill.id} className={styles.skillCard}>
                <div className={styles.skillHeader}>
                  <h3 className={styles.skillName}>{skill.name}</h3>
                  <span className={styles.skillCategory}>{skill.category}</span>
                </div>
                
                <div className={styles.skillMeta}>
                  <span>{skill.years_experience} years experience</span>
                  <span>{skill.endorsements} endorsements</span>
                </div>

                <div className={styles.proficiencyDisplay}>
                  <div className={styles.proficiencyBar}>
                    <div 
                      className={styles.proficiencyFill}
                      style={{ width: `${(getProficiencyNumber(skill.proficiency) / 5) * 100}%` }}
                    />
                  </div>
                  <div className={styles.proficiencyText}>
                    {getProficiencyLabel(skill.proficiency)}
                  </div>
                </div>

                {skill.description && (
                  <p className={styles.skillDescription}>{skill.description}</p>
                )}

                {/* Video Verification Section */}
                {skill.video_verified && skill.ai_rating && (
                  <div className={styles.verificationSection}>
                    <div className={styles.verificationHeader}>
                      <CheckCircle size={16} className={styles.verifiedIcon} />
                      <span>AI Verified</span>
                    </div>
                    <div className={styles.aiRating}>
                      {renderStars(skill.ai_rating)}
                    </div>
                    {skill.ai_feedback && (
                      <p className={styles.aiFeedback}>{skill.ai_feedback}</p>
                    )}
                  </div>
                )}

                <div className={styles.skillActions}>
                  {!skill.video_verified && (
                    <button 
                      className={styles.verifyButton}
                      onClick={() => handleGetAiPrompt(skill)}
                    >
                      <Video size={12} />
                      Verify
                    </button>
                  )}
                  <button 
                    className={styles.editButton}
                    onClick={() => handleEdit(skill)}
                  >
                    <Edit size={12} />
                    Edit
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(skill.id)}
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Verification Modal */}
      {verifyingSkill && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Verify {verifyingSkill.name} Skill</h2>
            
            {!verificationResult ? (
              <>
                <div className={styles.aiPromptSection}>
                  <h3>AI Challenge:</h3>
                  <p className={styles.aiPromptText}>{aiPrompt || 'Getting your challenge...'}</p>
                </div>

                <div className={styles.uploadSection}>
                  <label htmlFor="video-upload" className={styles.uploadLabel}>
                    <Upload size={24} />
                    <span>Upload Video (Max 100MB)</span>
                  </label>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    className={styles.fileInput}
                  />
                  
                  {videoFile && (
                    <p className={styles.fileName}>{videoFile.name}</p>
                  )}
                </div>

                <div className={styles.modalActions}>
                  <Button
                    onClick={handleVideoUpload}
                    disabled={!videoFile || isUploading}
                  >
                    {isUploading ? 'Uploading & Analyzing...' : 'Submit Video'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVerifyingSkill(null);
                      setVideoFile(null);
                      setAiPrompt('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.resultSection}>
                  <h3>Verification Complete!</h3>
                  <div className={styles.resultRating}>
                    {renderStars(verificationResult.rating)}
                  </div>
                  <p className={styles.resultFeedback}>{verificationResult.feedback}</p>
                </div>
                
                <Button
                  onClick={() => {
                    setVerifyingSkill(null);
                    setVideoFile(null);
                    setAiPrompt('');
                    setVerificationResult(null);
                  }}
                >
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReelSkills;
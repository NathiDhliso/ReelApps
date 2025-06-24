import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit, Trash2 } from 'lucide-react';
import { useCandidateStore } from '../../store/candidateStore';
import { useAuthStore } from '../../store/authStore';
import Button from '../Button/Button';
import styles from './ReelSkills.module.css';

type SkillCategory = 'technical' | 'soft' | 'language' | 'certification';
type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

interface SkillFormData {
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  years_experience: number;
  description: string;
}

const ReelSkills: React.FC = () => {
  const { profile, isLoading, fetchProfile, addSkill, updateSkill, deleteSkill } = useCandidateStore();
  const { user } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    category: 'technical',
    proficiency: 'intermediate',
    years_experience: 1,
    description: ''
  });

  useEffect(() => {
    if (user?.id && !profile) {
      fetchProfile(user.id);
    }
  }, [user?.id, profile, fetchProfile]);

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

  const handleEdit = (skill: any) => {
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

                <div className={styles.skillActions}>
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
    </div>
  );
};

export default ReelSkills;
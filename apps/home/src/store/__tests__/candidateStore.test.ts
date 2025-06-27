import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCandidateStore } from '../candidateStore';
import { getSupabaseClient } from '@reelapps/auth';

// Mock Supabase
vi.mock('@reelapps/auth', () => ({
  getSupabaseClient: vi.fn(),
  handleSupabaseError: vi.fn((error) => {
    throw new Error(error.message);
  }),
}));

describe('CandidateStore', () => {
  beforeEach(() => {
    // Reset store state
    useCandidateStore.setState({
      profile: null,
      isLoading: false
    });
    
    vi.clearAllMocks();
  });

  describe('fetchProfile', () => {
    it('should successfully fetch a complete profile', async () => {
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'candidate',
        headline: 'Software Developer',
        summary: 'Experienced developer',
        location: 'San Francisco',
        availability: 'available'
      };

      const mockSkills = [
        {
          id: 'skill-1',
          name: 'Python',
          category: 'technical',
          proficiency: 'advanced',
          years_experience: 5
        }
      ];

      const mockProjects = [
        {
          id: 'project-1',
          title: 'E-commerce Platform',
          description: 'Built a scalable e-commerce platform',
          technologies: ['React', 'Node.js']
        }
      ];

      const mockPersonaAnalysis = {
        id: 'persona-1',
        strengths: ['Problem solving', 'Communication'],
        work_style: { collaboration: 85 }
      };

      const mockReviews = [
        {
          id: 'review-1',
          reviewer_name: 'Jane Manager',
          rating: 5,
          feedback: 'Excellent developer'
        }
      ];

      // Mock Supabase client
      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === 'profiles') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: mockProfile,
                    error: null
                  })
                })
              })
            };
          }
          if (table === 'skills') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: mockSkills,
                    error: null
                  })
                })
              })
            };
          }
          if (table === 'projects') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: mockProjects,
                    error: null
                  })
                })
              })
            };
          }
          if (table === 'persona_analyses') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: mockPersonaAnalysis,
                    error: null
                  })
                })
              })
            };
          }
          if (table === 'reviews') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  order: vi.fn().mockResolvedValue({
                    data: mockReviews,
                    error: null
                  })
                })
              })
            };
          }
          return {};
        })
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const { fetchProfile } = useCandidateStore.getState();
      
      await fetchProfile('user-123');

      const state = useCandidateStore.getState();
      expect(state.profile).toEqual({
        ...mockProfile,
        skills: mockSkills,
        projects: mockProjects,
        persona_analysis: mockPersonaAnalysis,
        reviews: mockReviews
      });
      expect(state.isLoading).toBe(false);
    });

    it('should handle profile not found', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Profile not found' }
              })
            })
          })
        }))
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const { fetchProfile } = useCandidateStore.getState();
      
      await expect(fetchProfile('nonexistent-user')).rejects.toThrow('Profile not found');
    });
  });

  describe('addSkill', () => {
    it('should successfully add a new skill', async () => {
      const mockProfile = {
        id: 'profile-123',
        skills: []
      };

      useCandidateStore.setState({ profile: mockProfile as any });

      const newSkill = {
        name: 'React',
        level: 'intermediate',
        years_experience: 3,
        profile_id: 'profile-123'
      };

      const mockInsertedSkill = {
        id: 'skill-123',
        ...newSkill,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockInsertedSkill,
                error: null
              })
            })
          })
        }))
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const { addSkill } = useCandidateStore.getState();
      
      await addSkill(newSkill);

      const state = useCandidateStore.getState();
      expect(state.profile?.skills).toContain(mockInsertedSkill);
    });

    it('should handle add skill errors', async () => {
      const mockProfile = {
        id: 'profile-123',
        skills: []
      };

      useCandidateStore.setState({ profile: mockProfile as any });

      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Skill already exists' }
              })
            })
          })
        }))
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const { addSkill } = useCandidateStore.getState();
      
      await expect(addSkill({
        name: 'React',
        level: 'intermediate',
        years_experience: 3,
        profile_id: 'profile-123'
      })).rejects.toThrow('Skill already exists');
    });
  });

  describe('updateSkill', () => {
    it('should successfully update an existing skill', async () => {
      const mockProfile = {
        id: 'profile-123',
        skills: [
          {
            id: 'skill-123',
            name: 'React',
            level: 'intermediate',
            years_experience: 3
          }
        ]
      };

      useCandidateStore.setState({ profile: mockProfile as any });

      const updates = { level: 'advanced', years_experience: 5 };
      const updatedSkill = { ...mockProfile.skills[0], ...updates };

      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedSkill,
                  error: null
                })
              })
            })
          })
        }))
      };

      (getSupabaseClient as any).mockReturnValue(mockSupabase);

      const { updateSkill } = useCandidateStore.getState();
      
      await updateSkill('skill-123', updates);

      const state = useCandidateStore.getState();
      const skill = state.profile?.skills.find(s => s.id === 'skill-123');
      expect(skill?.level).toBe('advanced');
      expect(skill?.years_experience).toBe(5);
    });
  });

  describe('deleteSkill', () => {
    it('should successfully delete a skill', async () => {
      const skillToDelete = { id: 'skill-123', name: 'Python' };
      const remainingSkill = { id: 'skill-456', name: 'React' };

      useCandidateStore.setState({
        profile: {
          id: 'profile-123',
          skills: [skillToDelete, remainingSkill]
        } as any
      });

      (getSupabaseClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null
            })
          })
        })
      });

      const { deleteSkill } = useCandidateStore.getState();
      
      await deleteSkill('skill-123');

      const state = useCandidateStore.getState();
      expect(state.profile?.skills).toHaveLength(1);
      expect(state.profile?.skills[0]).toEqual(remainingSkill);
    });
  });
});
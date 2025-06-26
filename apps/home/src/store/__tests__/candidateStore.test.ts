import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCandidateStore } from '../candidateStore';
import { getSupabaseClient } from '@reelapps/auth';

// Mock Supabase
vi.mock('@reelapps/auth', () => ({
  getSupabaseClient: vi.fn(),
  handleSupabaseError: vi.fn(),
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

      // Mock profile fetch
      (getSupabaseClient as any).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null
              })
            })
          })
        })
      });

      // Mock parallel data fetches
      const mockFromCalls = [
        // Skills
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockSkills,
                error: null
              })
            })
          })
        },
        // Projects
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockProjects,
                error: null
              })
            })
          })
        },
        // Persona analysis
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockPersonaAnalysis,
                error: null
              })
            })
          })
        },
        // Reviews
        {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: mockReviews,
                error: null
              })
            })
          })
        }
      ];

      (getSupabaseClient as any)
        .mockReturnValueOnce(mockFromCalls[0])
        .mockReturnValueOnce(mockFromCalls[1])
        .mockReturnValueOnce(mockFromCalls[2])
        .mockReturnValueOnce(mockFromCalls[3]);

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
      (getSupabaseClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Profile not found' }
              })
            })
          })
        })
      });

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
        category: 'technical' as const,
        proficiency: 'intermediate' as const,
        years_experience: 3,
        verified: false,
        endorsements: 0,
        video_demo_url: null,
        description: 'Frontend development',
        profile_id: 'profile-123'
      };

      const mockInsertedSkill = {
        id: 'skill-123',
        ...newSkill,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      (getSupabaseClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockInsertedSkill,
                error: null
              })
            })
          })
        })
      });

      const { addSkill } = useCandidateStore.getState();
      
      await addSkill(newSkill);

      const state = useCandidateStore.getState();
      expect(state.profile?.skills).toHaveLength(1);
      expect(state.profile?.skills[0]).toEqual(mockInsertedSkill);
    });

    it('should handle add skill errors', async () => {
      useCandidateStore.setState({ profile: { id: 'profile-123', skills: [] } as any });

      (getSupabaseClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Skill already exists' }
              })
            })
          })
        })
      });

      const { addSkill } = useCandidateStore.getState();
      
      await expect(addSkill({
        name: 'Python',
        category: 'technical',
        proficiency: 'advanced',
        years_experience: 5,
        verified: false,
        endorsements: 0,
        video_demo_url: null,
        description: null,
        profile_id: 'profile-123'
      })).rejects.toThrow('Skill already exists');
    });
  });

  describe('updateSkill', () => {
    it('should successfully update an existing skill', async () => {
      const existingSkill = {
        id: 'skill-123',
        name: 'Python',
        proficiency: 'intermediate',
        years_experience: 3
      };

      useCandidateStore.setState({
        profile: {
          id: 'profile-123',
          skills: [existingSkill]
        } as any
      });

      const updates = {
        proficiency: 'advanced' as const,
        years_experience: 5
      };

      const updatedSkill = {
        ...existingSkill,
        ...updates
      };

      (getSupabaseClient as any).mockReturnValue({
        from: vi.fn().mockReturnValue({
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
        })
      });

      const { updateSkill } = useCandidateStore.getState();
      
      await updateSkill('skill-123', updates);

      const state = useCandidateStore.getState();
      expect(state.profile?.skills[0]).toEqual(updatedSkill);
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
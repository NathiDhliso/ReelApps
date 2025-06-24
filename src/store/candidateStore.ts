import { create } from 'zustand';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Skill = Database['public']['Tables']['skills']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type PersonaAnalysis = Database['public']['Tables']['persona_analyses']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

interface CandidateProfile extends Profile {
  skills: Skill[];
  projects: Project[];
  persona_analysis: PersonaAnalysis | null;
  reviews: Review[];
}

interface CandidateState {
  profile: CandidateProfile | null;
  isLoading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  addSkill: (skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSkill: (skillId: string, updates: Partial<Skill>) => Promise<void>;
  deleteSkill: (skillId: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
}

export const useCandidateStore = create<CandidateState>((set, get) => ({
  profile: null,
  isLoading: false,
  
  fetchProfile: async (userId: string) => {
    set({ isLoading: true });
    try {
      // First get the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        handleSupabaseError(profileError);
      }

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Fetch related data in parallel
      const [skillsResult, projectsResult, personaResult, reviewsResult] = await Promise.all([
        supabase
          .from('skills')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('projects')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('persona_analyses')
          .select('*')
          .eq('profile_id', profile.id)
          .single(),
        
        supabase
          .from('reviews')
          .select('*')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })
      ]);

      if (skillsResult.error) {
        console.error('Error fetching skills:', skillsResult.error);
      }
      
      if (projectsResult.error) {
        console.error('Error fetching projects:', projectsResult.error);
      }
      
      if (personaResult.error && personaResult.error.code !== 'PGRST116') {
        console.error('Error fetching persona analysis:', personaResult.error);
      }
      
      if (reviewsResult.error) {
        console.error('Error fetching reviews:', reviewsResult.error);
      }

      const candidateProfile: CandidateProfile = {
        ...profile,
        skills: skillsResult.data || [],
        projects: projectsResult.data || [],
        persona_analysis: personaResult.data || null,
        reviews: reviewsResult.data || [],
      };

      set({ profile: candidateProfile, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateProfile: async (updates: Partial<Profile>) => {
    const { profile } = get();
    if (!profile) throw new Error('No profile loaded');

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      set(state => ({
        profile: state.profile ? { ...state.profile, ...data } : null,
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addSkill: async (skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) => {
    const { profile } = get();
    if (!profile) throw new Error('No profile loaded');

    try {
      const { data, error } = await supabase
        .from('skills')
        .insert({ ...skill, profile_id: profile.id })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      set(state => ({
        profile: state.profile ? {
          ...state.profile,
          skills: [data, ...state.profile.skills]
        } : null
      }));
    } catch (error) {
      throw error;
    }
  },

  updateSkill: async (skillId: string, updates: Partial<Skill>) => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', skillId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      set(state => ({
        profile: state.profile ? {
          ...state.profile,
          skills: state.profile.skills.map(skill => 
            skill.id === skillId ? data : skill
          )
        } : null
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteSkill: async (skillId: string) => {
    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId);

      if (error) {
        handleSupabaseError(error);
      }

      set(state => ({
        profile: state.profile ? {
          ...state.profile,
          skills: state.profile.skills.filter(skill => skill.id !== skillId)
        } : null
      }));
    } catch (error) {
      throw error;
    }
  },

  addProject: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const { profile } = get();
    if (!profile) throw new Error('No profile loaded');

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...project, profile_id: profile.id })
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      set(state => ({
        profile: state.profile ? {
          ...state.profile,
          projects: [data, ...state.profile.projects]
        } : null
      }));
    } catch (error) {
      throw error;
    }
  },

  updateProject: async (projectId: string, updates: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      set(state => ({
        profile: state.profile ? {
          ...state.profile,
          projects: state.profile.projects.map(project => 
            project.id === projectId ? data : project
          )
        } : null
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        handleSupabaseError(error);
      }

      set(state => ({
        profile: state.profile ? {
          ...state.profile,
          projects: state.profile.projects.filter(project => project.id !== projectId)
        } : null
      }));
    } catch (error) {
      throw error;
    }
  },
}));
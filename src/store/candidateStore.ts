import { create } from 'zustand';
import { supabase, handleSupabaseError } from '../lib/supabase';
// Database types (simplified for now - you can expand this as needed)
type Database = any;

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
  fetchProfile: (_profileId: string) => Promise<void>;
  updateProfile: (_updates: Partial<Profile>) => Promise<void>;
  addSkill: (_skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSkill: (_skillId: string, _updates: Partial<Skill>) => Promise<void>;
  deleteSkill: (_skillId: string) => Promise<void>;
  addProject: (_project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProject: (_projectId: string, _updates: Partial<Project>) => Promise<void>;
  deleteProject: (_projectId: string) => Promise<void>;
}

export const useCandidateStore = create<CandidateState>((set, get) => ({
  profile: null,
  isLoading: false,
  
  fetchProfile: async (profileId: string) => {
    set({ isLoading: true });
    console.log(`[candidateStore] fetchProfile started for profileId: ${profileId}`);
    try {
      // First get the profile by its primary key
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) {
        console.error('[candidateStore] Error fetching main profile:', profileError);
        handleSupabaseError(profileError);
      }

      if (!profile) {
        console.error(`[candidateStore] Profile with id ${profileId} not found.`);
        set({ isLoading: false });
        throw new Error('Profile not found');
      }
      console.log('[candidateStore] Main profile fetched:', profile);

      // Fetch related data in parallel
      console.log('[candidateStore] Fetching related data (skills, projects, etc.)...');
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
          .maybeSingle(),
        
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
        // Ignore 406 errors for persona_analyses as the table might not exist
        if (personaResult.error.code !== '406') {
          console.error('Error fetching persona analysis:', personaResult.error);
        }
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
      console.log('[candidateStore] Profile fetch complete, state updated.');
    } catch (error) {
      console.error('[candidateStore] An error occurred in fetchProfile:', error);
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
  },

  updateSkill: async (skillId: string, updates: Partial<Skill>) => {
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
  },

  deleteSkill: async (skillId: string) => {
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
  },

  addProject: async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const { profile } = get();
    if (!profile) throw new Error('No profile loaded');
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
  },

  updateProject: async (projectId: string, updates: Partial<Project>) => {
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
  },

  deleteProject: async (projectId: string) => {
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
  },
}));
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          role: 'candidate' | 'recruiter' | 'admin'
          headline: string | null
          summary: string | null
          location: string | null
          avatar_url: string | null
          availability: 'available' | 'open' | 'not-looking' | null
          preferred_roles: string[] | null
          salary_min: number | null
          salary_max: number | null
          salary_currency: string | null
          completion_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          role?: 'candidate' | 'recruiter' | 'admin'
          headline?: string | null
          summary?: string | null
          location?: string | null
          avatar_url?: string | null
          availability?: 'available' | 'open' | 'not-looking' | null
          preferred_roles?: string[] | null
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          completion_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          role?: 'candidate' | 'recruiter' | 'admin'
          headline?: string | null
          summary?: string | null
          location?: string | null
          avatar_url?: string | null
          availability?: 'available' | 'open' | 'not-looking' | null
          preferred_roles?: string[] | null
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          completion_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          profile_id: string
          name: string
          category: 'technical' | 'soft' | 'language' | 'certification'
          proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
          years_experience: number
          verified: boolean
          endorsements: number
          video_demo_url: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          category: 'technical' | 'soft' | 'language' | 'certification'
          proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
          years_experience?: number
          verified?: boolean
          endorsements?: number
          video_demo_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          category?: 'technical' | 'soft' | 'language' | 'certification'
          proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
          years_experience?: number
          verified?: boolean
          endorsements?: number
          video_demo_url?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          profile_id: string
          title: string
          description: string
          role: string
          technologies: string[]
          start_date: string
          end_date: string | null
          impact: string | null
          github_url: string | null
          live_url: string | null
          media_urls: string[]
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          description: string
          role: string
          technologies?: string[]
          start_date: string
          end_date?: string | null
          impact?: string | null
          github_url?: string | null
          live_url?: string | null
          media_urls?: string[]
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          description?: string
          role?: string
          technologies?: string[]
          start_date?: string
          end_date?: string | null
          impact?: string | null
          github_url?: string | null
          live_url?: string | null
          media_urls?: string[]
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      persona_analyses: {
        Row: {
          id: string
          profile_id: string
          openness: number | null
          conscientiousness: number | null
          extraversion: number | null
          agreeableness: number | null
          neuroticism: number | null
          summary: string | null
          emotional_intelligence: Json
          work_style: Json
          cultural_fit: Json
          communication_style: string | null
          strengths: string[]
          growth_areas: string[]
          ideal_environment: string | null
          assessment_data: Json
          confidence_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          openness?: number | null
          conscientiousness?: number | null
          extraversion?: number | null
          agreeableness?: number | null
          neuroticism?: number | null
          summary?: string | null
          emotional_intelligence?: Json
          work_style?: Json
          cultural_fit?: Json
          communication_style?: string | null
          strengths?: string[]
          growth_areas?: string[]
          ideal_environment?: string | null
          assessment_data?: Json
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          openness?: number | null
          conscientiousness?: number | null
          extraversion?: number | null
          agreeableness?: number | null
          neuroticism?: number | null
          summary?: string | null
          emotional_intelligence?: Json
          work_style?: Json
          cultural_fit?: Json
          communication_style?: string | null
          strengths?: string[]
          growth_areas?: string[]
          ideal_environment?: string | null
          assessment_data?: Json
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          profile_id: string
          reviewer_id: string | null
          reviewer_name: string
          reviewer_role: string
          relationship: 'colleague' | 'manager' | 'client' | 'mentor' | 'direct_report'
          rating: number
          feedback: string
          skills_mentioned: string[]
          verified: boolean
          verification_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          reviewer_id?: string | null
          reviewer_name: string
          reviewer_role: string
          relationship: 'colleague' | 'manager' | 'client' | 'mentor' | 'direct_report'
          rating: number
          feedback: string
          skills_mentioned?: string[]
          verified?: boolean
          verification_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          reviewer_id?: string | null
          reviewer_name?: string
          reviewer_role?: string
          relationship?: 'colleague' | 'manager' | 'client' | 'mentor' | 'direct_report'
          rating?: number
          feedback?: string
          skills_mentioned?: string[]
          verified?: boolean
          verification_token?: string | null
          created_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          recruiter_id: string
          title: string
          company: string
          description: string
          requirements: string[]
          location: string
          salary_min: number | null
          salary_max: number | null
          salary_currency: string | null
          remote_allowed: boolean
          experience_level: string | null
          employment_type: string | null
          status: 'draft' | 'active' | 'paused' | 'closed'
          ai_analysis_score: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          recruiter_id: string
          title: string
          company: string
          description: string
          requirements?: string[]
          location: string
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          remote_allowed?: boolean
          experience_level?: string | null
          employment_type?: string | null
          status?: 'draft' | 'active' | 'paused' | 'closed'
          ai_analysis_score?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recruiter_id?: string
          title?: string
          company?: string
          description?: string
          requirements?: string[]
          location?: string
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          remote_allowed?: boolean
          experience_level?: string | null
          employment_type?: string | null
          status?: 'draft' | 'active' | 'paused' | 'closed'
          ai_analysis_score?: Json
          created_at?: string
          updated_at?: string
        }
      }
      candidate_matches: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          overall_score: number
          skills_match: number
          culture_match: number
          experience_match: number
          reasoning: string | null
          strengths: string[]
          concerns: string[]
          ai_confidence: number | null
          recruiter_viewed: boolean
          recruiter_rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          overall_score: number
          skills_match: number
          culture_match: number
          experience_match: number
          reasoning?: string | null
          strengths?: string[]
          concerns?: string[]
          ai_confidence?: number | null
          recruiter_viewed?: boolean
          recruiter_rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          candidate_id?: string
          overall_score?: number
          skills_match?: number
          culture_match?: number
          experience_match?: number
          reasoning?: string | null
          strengths?: string[]
          concerns?: string[]
          ai_confidence?: number | null
          recruiter_viewed?: boolean
          recruiter_rating?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_completion_score: {
        Args: {
          profile_uuid: string
        }
        Returns: number
      }
    }
    Enums: {
      availability_status: 'available' | 'open' | 'not-looking'
      job_status: 'draft' | 'active' | 'paused' | 'closed'
      proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
      review_relationship: 'colleague' | 'manager' | 'client' | 'mentor' | 'direct_report'
      skill_category: 'technical' | 'soft' | 'language' | 'certification'
      user_role: 'candidate' | 'recruiter' | 'admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
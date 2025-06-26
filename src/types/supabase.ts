export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      app_access: {
        Row: {
          app_id: string
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          app_id: string
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          app_id?: string
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      app_access_logs: {
        Row: {
          accessed_at: string | null
          app_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          app_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          app_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      candidate_matches: {
        Row: {
          ai_confidence: number | null
          candidate_id: string
          concerns: string[] | null
          created_at: string | null
          culture_match: number
          experience_match: number
          id: string
          job_id: string
          overall_score: number
          reasoning: string | null
          recruiter_rating: number | null
          recruiter_viewed: boolean | null
          skills_match: number
          strengths: string[] | null
        }
        Insert: {
          ai_confidence?: number | null
          candidate_id: string
          concerns?: string[] | null
          created_at?: string | null
          culture_match: number
          experience_match: number
          id?: string
          job_id: string
          overall_score: number
          reasoning?: string | null
          recruiter_rating?: number | null
          recruiter_viewed?: boolean | null
          skills_match: number
          strengths?: string[] | null
        }
        Update: {
          ai_confidence?: number | null
          candidate_id?: string
          concerns?: string[] | null
          created_at?: string | null
          culture_match?: number
          experience_match?: number
          id?: string
          job_id?: string
          overall_score?: number
          reasoning?: string | null
          recruiter_rating?: number | null
          recruiter_viewed?: boolean | null
          skills_match?: number
          strengths?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          ai_analysis_score: Json | null
          company: string
          created_at: string | null
          description: string
          employment_type: string | null
          experience_level: string | null
          id: string
          location: string
          recruiter_id: string
          remote_allowed: boolean | null
          requirements: string[]
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_analysis_score?: Json | null
          company: string
          created_at?: string | null
          description: string
          employment_type?: string | null
          experience_level?: string | null
          id?: string
          location: string
          recruiter_id: string
          remote_allowed?: boolean | null
          requirements?: string[]
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_analysis_score?: Json | null
          company?: string
          created_at?: string | null
          description?: string
          employment_type?: string | null
          experience_level?: string | null
          id?: string
          location?: string
          recruiter_id?: string
          remote_allowed?: boolean | null
          requirements?: string[]
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_analyses: {
        Row: {
          assessment_data: Json | null
          communication_style: string | null
          confidence_score: number | null
          created_at: string | null
          cultural_fit: Json
          emotional_intelligence: Json
          growth_areas: string[] | null
          id: string
          ideal_environment: string | null
          profile_id: string
          strengths: string[] | null
          updated_at: string | null
          work_style: Json
        }
        Insert: {
          assessment_data?: Json | null
          communication_style?: string | null
          confidence_score?: number | null
          created_at?: string | null
          cultural_fit?: Json
          emotional_intelligence?: Json
          growth_areas?: string[] | null
          id?: string
          ideal_environment?: string | null
          profile_id: string
          strengths?: string[] | null
          updated_at?: string | null
          work_style?: Json
        }
        Update: {
          assessment_data?: Json | null
          communication_style?: string | null
          confidence_score?: number | null
          created_at?: string | null
          cultural_fit?: Json
          emotional_intelligence?: Json
          growth_areas?: string[] | null
          id?: string
          ideal_environment?: string | null
          profile_id?: string
          strengths?: string[] | null
          updated_at?: string | null
          work_style?: Json
        }
        Relationships: [
          {
            foreignKeyName: "persona_analyses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability:
            | Database["public"]["Enums"]["availability_status"]
            | null
          avatar_url: string | null
          completion_score: number | null
          created_at: string | null
          first_name: string
          headline: string | null
          id: string
          last_name: string
          location: string | null
          preferred_roles: string[] | null
          role: Database["public"]["Enums"]["user_role"]
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          summary: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          avatar_url?: string | null
          completion_score?: number | null
          created_at?: string | null
          first_name: string
          headline?: string | null
          id?: string
          last_name: string
          location?: string | null
          preferred_roles?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          summary?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability?:
            | Database["public"]["Enums"]["availability_status"]
            | null
          avatar_url?: string | null
          completion_score?: number | null
          created_at?: string | null
          first_name?: string
          headline?: string | null
          id?: string
          last_name?: string
          location?: string | null
          preferred_roles?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          summary?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string
          end_date: string | null
          featured: boolean | null
          github_url: string | null
          id: string
          impact: string | null
          live_url: string | null
          media_urls: string[] | null
          profile_id: string
          role: string
          start_date: string
          technologies: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          end_date?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          impact?: string | null
          live_url?: string | null
          media_urls?: string[] | null
          profile_id: string
          role: string
          start_date: string
          technologies?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          end_date?: string | null
          featured?: boolean | null
          github_url?: string | null
          id?: string
          impact?: string | null
          live_url?: string | null
          media_urls?: string[] | null
          profile_id?: string
          role?: string
          start_date?: string
          technologies?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          feedback: string
          id: string
          profile_id: string
          rating: number
          relationship: Database["public"]["Enums"]["review_relationship"]
          reviewer_id: string | null
          reviewer_name: string
          reviewer_role: string
          skills_mentioned: string[] | null
          verification_token: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          feedback: string
          id?: string
          profile_id: string
          rating: number
          relationship: Database["public"]["Enums"]["review_relationship"]
          reviewer_id?: string | null
          reviewer_name: string
          reviewer_role: string
          skills_mentioned?: string[] | null
          verification_token?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          feedback?: string
          id?: string
          profile_id?: string
          rating?: number
          relationship?: Database["public"]["Enums"]["review_relationship"]
          reviewer_id?: string | null
          reviewer_name?: string
          reviewer_role?: string
          skills_mentioned?: string[] | null
          verification_token?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_video_verifications: {
        Row: {
          ai_feedback: string | null
          ai_prompt: string
          ai_rating: number | null
          created_at: string | null
          id: string
          skill_id: string | null
          updated_at: string | null
          verification_status: string | null
          video_url: string
        }
        Insert: {
          ai_feedback?: string | null
          ai_prompt: string
          ai_rating?: number | null
          created_at?: string | null
          id?: string
          skill_id?: string | null
          updated_at?: string | null
          verification_status?: string | null
          video_url: string
        }
        Update: {
          ai_feedback?: string | null
          ai_prompt?: string
          ai_rating?: number | null
          created_at?: string | null
          id?: string
          skill_id?: string | null
          updated_at?: string | null
          verification_status?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_video_verifications_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          ai_feedback: string | null
          ai_rating: number | null
          category: Database["public"]["Enums"]["skill_category"]
          created_at: string | null
          description: string | null
          endorsements: number | null
          id: string
          name: string
          proficiency: Database["public"]["Enums"]["proficiency_level"]
          profile_id: string
          updated_at: string | null
          verified: boolean | null
          video_demo_url: string | null
          video_uploaded_at: string | null
          video_verified: boolean | null
          years_experience: number
        }
        Insert: {
          ai_feedback?: string | null
          ai_rating?: number | null
          category: Database["public"]["Enums"]["skill_category"]
          created_at?: string | null
          description?: string | null
          endorsements?: number | null
          id?: string
          name: string
          proficiency: Database["public"]["Enums"]["proficiency_level"]
          profile_id: string
          updated_at?: string | null
          verified?: boolean | null
          video_demo_url?: string | null
          video_uploaded_at?: string | null
          video_verified?: boolean | null
          years_experience?: number
        }
        Update: {
          ai_feedback?: string | null
          ai_rating?: number | null
          category?: Database["public"]["Enums"]["skill_category"]
          created_at?: string | null
          description?: string | null
          endorsements?: number | null
          id?: string
          name?: string
          proficiency?: Database["public"]["Enums"]["proficiency_level"]
          profile_id?: string
          updated_at?: string | null
          verified?: boolean | null
          video_demo_url?: string | null
          video_uploaded_at?: string | null
          video_verified?: boolean | null
          years_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_completion_score: {
        Args: { profile_uuid: string }
        Returns: number
      }
      get_my_apps: {
        Args: Record<PropertyKey, never>
        Returns: {
          app_id: string
          app_name: string
          app_description: string
          app_url: string
        }[]
      }
      get_user_apps: {
        Args: { user_id: string }
        Returns: {
          app_id: string
          app_name: string
          app_description: string
          app_url: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      log_app_access: {
        Args: { app_id: string }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      availability_status: "available" | "open" | "not-looking"
      job_status: "draft" | "active" | "paused" | "closed"
      proficiency_level:
        | "beginner"
        | "intermediate"
        | "advanced"
        | "expert"
        | "master"
      review_relationship:
        | "colleague"
        | "manager"
        | "client"
        | "mentor"
        | "direct_report"
      skill_category: "technical" | "soft" | "language" | "certification"
      user_role: "candidate" | "recruiter" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      availability_status: ["available", "open", "not-looking"],
      job_status: ["draft", "active", "paused", "closed"],
      proficiency_level: [
        "beginner",
        "intermediate",
        "advanced",
        "expert",
        "master",
      ],
      review_relationship: [
        "colleague",
        "manager",
        "client",
        "mentor",
        "direct_report",
      ],
      skill_category: ["technical", "soft", "language", "certification"],
      user_role: ["candidate", "recruiter", "admin"],
    },
  },
} as const

/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />

declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
      set(key: string, value: string): void;
      delete(key: string): void;
      toObject(): Record<string, string>;
    };
  };
}

// Make this a module to avoid global pollution
export {};

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
      profiles: {
        Row: {
          id: string
          user_id: string
          updated_at: string | null
          username: string | null
          first_name: string | null
          last_name: string | null
          email: string | null
          role: 'candidate' | 'recruiter' | 'admin'
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          github_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          years_experience: number | null
          hourly_rate: number | null
          availability: string | null
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          updated_at?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          role?: 'candidate' | 'recruiter' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          years_experience?: number | null
          hourly_rate?: number | null
          availability?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          updated_at?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          role?: 'candidate' | 'recruiter' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          years_experience?: number | null
          hourly_rate?: number | null
          availability?: string | null
          created_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: string
          profile_id: string
          name: string
          level: string | null
          years_experience: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          level?: string | null
          years_experience?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          level?: string | null
          years_experience?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          profile_id: string
          title: string
          description: string | null
          image_url: string | null
          project_url: string | null
          github_url: string | null
          tech_stack: string[] | null
          status: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          description?: string | null
          image_url?: string | null
          project_url?: string | null
          github_url?: string | null
          tech_stack?: string[] | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          project_url?: string | null
          github_url?: string | null
          tech_stack?: string[] | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      persona_analyses: {
        Row: {
          id: string
          profile_id: string
          analysis_type: string
          analysis_data: Json
          score: number | null
          recommendations: string[] | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          analysis_type: string
          analysis_data: Json
          score?: number | null
          recommendations?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          analysis_type?: string
          analysis_data?: Json
          score?: number | null
          recommendations?: string[] | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persona_analyses_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          profile_id: string
          reviewer_id: string
          rating: number
          comment: string | null
          project_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          reviewer_id: string
          rating: number
          comment?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          reviewer_id?: string
          rating?: number
          comment?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string | null
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
          }
        ]
      }
      job_postings: {
        Row: {
          id: string
          title: string
          company: string
          description: string | null
          requirements: string[] | null
          location: string | null
          salary_min: number | null
          salary_max: number | null
          employment_type: string | null
          posted_by: string
          created_at: string
          updated_at: string | null
          status: string | null
        }
        Insert: {
          id?: string
          title: string
          company: string
          description?: string | null
          requirements?: string[] | null
          location?: string | null
          salary_min?: number | null
          salary_max?: number | null
          employment_type?: string | null
          posted_by: string
          created_at?: string
          updated_at?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          title?: string
          company?: string
          description?: string | null
          requirements?: string[] | null
          location?: string | null
          salary_min?: number | null
          salary_max?: number | null
          employment_type?: string | null
          posted_by?: string
          created_at?: string
          updated_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      app_access: {
        Row: {
          id: string
          user_id: string
          app_name: string
          access_level: string
          granted_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          app_name: string
          access_level?: string
          granted_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          app_name?: string
          access_level?: string
          granted_at?: string
          expires_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
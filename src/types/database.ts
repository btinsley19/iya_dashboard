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
          full_name: string
          email: string
          avatar_url: string | null
          bio: string | null
          graduation_year: number | null
          location: string | null
          hometown: string | null
          cohort: string | null
          modality: 'in-person' | 'online' | 'hybrid' | null
          links: Json
          status: 'pending' | 'active' | 'suspended'
          role: 'user' | 'admin'
          visibility: 'public' | 'private' | 'unlisted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          avatar_url?: string | null
          bio?: string | null
          graduation_year?: number | null
          location?: string | null
          hometown?: string | null
          cohort?: string | null
          modality?: 'in-person' | 'online' | 'hybrid' | null
          links?: Json
          status?: 'pending' | 'active' | 'suspended'
          role?: 'user' | 'admin'
          visibility?: 'public' | 'private' | 'unlisted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          avatar_url?: string | null
          bio?: string | null
          graduation_year?: number | null
          location?: string | null
          hometown?: string | null
          cohort?: string | null
          modality?: 'in-person' | 'online' | 'hybrid' | null
          links?: Json
          status?: 'pending' | 'active' | 'suspended'
          role?: 'user' | 'admin'
          visibility?: 'public' | 'private' | 'unlisted'
          created_at?: string
          updated_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          school: string
          code: string
          title: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school?: string
          code: string
          title: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school?: string
          code?: string
          title?: string
          description?: string | null
          created_at?: string
        }
      }
      profile_classes: {
        Row: {
          profile_id: string
          class_id: string
          created_at: string
        }
        Insert: {
          profile_id: string
          class_id: string
          created_at?: string
        }
        Update: {
          profile_id?: string
          class_id?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          summary: string | null
          description: string | null
          owner_id: string
          visibility: 'public' | 'private' | 'unlisted'
          links: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          description?: string | null
          owner_id: string
          visibility?: 'public' | 'private' | 'unlisted'
          links?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string | null
          description?: string | null
          owner_id?: string
          visibility?: 'public' | 'private' | 'unlisted'
          links?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_status: 'pending' | 'active' | 'suspended'
      user_role: 'user' | 'admin'
      visibility: 'public' | 'private' | 'unlisted'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

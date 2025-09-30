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
          major: string | null
          location: string | null
          hometown: string | null
          cohort: string | null
          modality: 'in-person' | 'online' | 'hybrid' | null
          degree: string | null
          links: Json
          status: 'pending' | 'active' | 'suspended'
          role: 'user' | 'admin'
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
          major?: string | null
          location?: string | null
          hometown?: string | null
          cohort?: string | null
          modality?: 'in-person' | 'online' | 'hybrid' | null
          degree?: string | null
          links?: Json
          status?: 'pending' | 'active' | 'suspended'
          role?: 'user' | 'admin'
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
          major?: string | null
          location?: string | null
          hometown?: string | null
          cohort?: string | null
          modality?: 'in-person' | 'online' | 'hybrid' | null
          degree?: string | null
          links?: Json
          status?: 'pending' | 'active' | 'suspended'
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          school: string
          code: string
          title: string
          term: string | null
          year: number | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school?: string
          code: string
          title: string
          term?: string | null
          year?: number | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school?: string
          code?: string
          title?: string
          term?: string | null
          year?: number | null
          description?: string | null
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
          archived: boolean
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
          archived?: boolean
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
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string | null
          location: string | null
          organizer_id: string
          visibility: 'public' | 'private' | 'unlisted'
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time: string
          end_time?: string | null
          location?: string | null
          organizer_id: string
          visibility?: 'public' | 'private' | 'unlisted'
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string | null
          location?: string | null
          organizer_id?: string
          visibility?: 'public' | 'private' | 'unlisted'
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          visibility: 'public' | 'private' | 'unlisted'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          visibility?: 'public' | 'private' | 'unlisted'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          visibility?: 'public' | 'private' | 'unlisted'
          created_at?: string
          updated_at?: string
        }
      }
      profile_skills: {
        Row: {
          profile_id: string
          skill_id: string
          level: number
          created_at: string
        }
        Insert: {
          profile_id: string
          skill_id: string
          level?: number
          created_at?: string
        }
        Update: {
          profile_id?: string
          skill_id?: string
          level?: number
          created_at?: string
        }
      }
      profile_tags: {
        Row: {
          profile_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          profile_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          profile_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      profile_classes: {
        Row: {
          profile_id: string
          class_id: string
          role: 'ta' | 'mentor'
          created_at: string
        }
        Insert: {
          profile_id: string
          class_id: string
          role?: 'ta' | 'mentor'
          created_at?: string
        }
        Update: {
          profile_id?: string
          class_id?: string
          role?: 'ta' | 'mentor'
          created_at?: string
        }
      }
      project_members: {
        Row: {
          project_id: string
          profile_id: string
          role: 'owner' | 'member' | 'mentor'
          created_at: string
        }
        Insert: {
          project_id: string
          profile_id: string
          role?: 'owner' | 'member' | 'mentor'
          created_at?: string
        }
        Update: {
          project_id?: string
          profile_id?: string
          role?: 'owner' | 'member' | 'mentor'
          created_at?: string
        }
      }
      project_tags: {
        Row: {
          project_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          project_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          project_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      event_attendees: {
        Row: {
          event_id: string
          profile_id: string
          rsvp_status: 'going' | 'maybe' | 'not_going'
          created_at: string
        }
        Insert: {
          event_id: string
          profile_id: string
          rsvp_status?: 'going' | 'maybe' | 'not_going'
          created_at?: string
        }
        Update: {
          event_id?: string
          profile_id?: string
          rsvp_status?: 'going' | 'maybe' | 'not_going'
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          entity_type: 'profile' | 'project' | 'class' | 'event' | 'note' | 'post'
          entity_id: string
          source: string | null
          title: string
          content_text: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entity_type: 'profile' | 'project' | 'class' | 'event' | 'note' | 'post'
          entity_id: string
          source?: string | null
          title: string
          content_text: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entity_type?: 'profile' | 'project' | 'class' | 'event' | 'note' | 'post'
          entity_id?: string
          source?: string | null
          title?: string
          content_text?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      document_embeddings: {
        Row: {
          id: string
          doc_id: string
          embedding: number[] | null
          provider: string
          model: string
          created_at: string
        }
        Insert: {
          id?: string
          doc_id: string
          embedding?: number[] | null
          provider?: string
          model?: string
          created_at?: string
        }
        Update: {
          id?: string
          doc_id?: string
          embedding?: number[] | null
          provider?: string
          model?: string
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          entity_type: 'profile' | 'project' | 'class' | 'event' | 'note' | 'post'
          entity_id: string
          actor_id: string | null
          action: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: 'profile' | 'project' | 'class' | 'event' | 'note' | 'post'
          entity_id: string
          actor_id?: string | null
          action: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: 'profile' | 'project' | 'class' | 'event' | 'note' | 'post'
          entity_id?: string
          actor_id?: string | null
          action?: string
          metadata?: Json
          created_at?: string
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
      entity_type: 'profile' | 'project' | 'class' | 'event' | 'note' | 'post'
      rsvp_status: 'going' | 'maybe' | 'not_going'
      project_role: 'owner' | 'member' | 'mentor'
      class_role: 'ta' | 'mentor'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

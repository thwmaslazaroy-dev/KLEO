// Auto-generated via: supabase gen types typescript --local > packages/supabase/database.types.ts
// Run this command after applying migrations to regenerate.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          expo_push_token: string | null
          notification_push: boolean
          notification_email: boolean
          pin_hash: string | null
          biometric_enabled: boolean
          auto_lock_minutes: number
          timezone: string
          shift_type: string
          shifts: Json | null
          current_shift_index: number
          theme: string
          onboarding_done: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          status: string
          priority: string
          due_date: string | null
          reminder_at: string | null
          reminder_sent: boolean
          recurring: string | null
          original_due_date: string | null
          overdue_days: number
          rolled_over: boolean
          tags: string[] | null
          contact_id: string | null
          goal_id: string | null
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Row']>
      }
      thoughts: {
        Row: {
          id: string
          user_id: string
          content: string
          linked_task_id: string | null
          linked_goal_id: string | null
          category: string
          archived: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['thoughts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['thoughts']['Row']>
      }
      events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          start_at: string
          end_at: string | null
          location: string | null
          contact_id: string | null
          reminder_at: string | null
          reminder_sent: boolean
          archived: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['events']['Row']>
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          category: string
          tags: string[] | null
          pinned: boolean
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notes']['Row']>
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          target_date: string | null
          status: string
          progress: number
          archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['goals']['Row']>
      }
      alarms: {
        Row: {
          id: string
          user_id: string
          label: string | null
          time: string
          days_of_week: number[] | null
          enabled: boolean
          smart_alarm: boolean
          shift_offset_minutes: number
          sound_type: string
          sound_uri: string | null
          snooze_minutes: number
          vibrate: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['alarms']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['alarms']['Row']>
      }
    }
  }
}

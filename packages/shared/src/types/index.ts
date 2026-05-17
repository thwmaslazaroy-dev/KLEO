export type Category = 'university' | 'bills' | 'projects' | 'clients' | 'misc'
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type RecurringType = 'daily' | 'weekly' | 'monthly' | null
export type ShiftType = 'fixed' | 'rotating'

export interface Shift {
  label: string
  start: string
  end: string
}

export interface WorkSchedule {
  id: string
  user_id: string
  label: string
  start_date: string
  end_date?: string
  shift_type: ShiftType
  shifts: Shift[]
  rotation_weeks: number
  is_active: boolean
  created_at: string
}

export interface Alarm {
  id: string
  user_id: string
  label?: string
  time: string
  days_of_week?: number[]
  enabled: boolean
  smart_alarm: boolean
  shift_offset_minutes: number
  sound_type: 'default' | 'file' | 'spotify'
  sound_uri?: string
  snooze_minutes: number
  vibrate: boolean
  created_at: string
  updated_at: string
}

export interface UserInsight {
  id: string
  user_id: string
  key: string
  value: unknown
  confidence: number
  last_updated: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  category: Category
  status: TaskStatus
  priority: Priority
  due_date?: string
  reminder_at?: string
  reminder_sent: boolean
  recurring?: RecurringType
  original_due_date?: string
  overdue_days: number
  rolled_over: boolean
  tags?: string[]
  contact_id?: string
  goal_id?: string
  archived: boolean
  created_at: string
  updated_at: string
}

export interface Thought {
  id: string
  user_id: string
  content: string
  linked_task_id?: string
  linked_goal_id?: string
  category: Category
  archived: boolean
  created_at: string
}

export interface Event {
  id: string
  user_id: string
  title: string
  description?: string
  category: Category
  start_at: string
  end_at?: string
  location?: string
  contact_id?: string
  reminder_at?: string
  reminder_sent: boolean
  archived: boolean
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  title?: string
  content: string
  category: Category
  tags?: string[]
  pinned: boolean
  archived: boolean
  created_at: string
  updated_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  date: string
  content?: string
  mood?: 1 | 2 | 3 | 4 | 5
  highlights?: string[]
  tomorrow_focus?: string
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  category: Category
  target_date?: string
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  progress: number
  steps?: GoalStep[]
  archived: boolean
  created_at: string
  updated_at: string
}

export interface GoalStep {
  id: string
  goal_id: string
  user_id: string
  title: string
  done: boolean
  order_index: number
  created_at: string
}

export interface Contact {
  id: string
  user_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  category: string
  notes?: string
  last_contact_at?: string
  next_followup_at?: string
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_start: string
  completed_tasks: number
  rolled_over_tasks: number
  mood_average: number
  reflection?: string
  focus_next_week?: string
  created_at: string
}

export interface Profile {
  id: string
  full_name?: string
  expo_push_token?: string
  notification_push: boolean
  notification_email: boolean
  pin_hash?: string
  biometric_enabled: boolean
  auto_lock_minutes: number
  timezone: string
  shift_type: ShiftType
  shifts?: Shift[]
  current_shift_index: number
  theme: 'dark' | 'light'
  onboarding_done: boolean
}

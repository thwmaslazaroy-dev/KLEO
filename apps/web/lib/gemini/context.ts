import { createClient } from '@/lib/supabase/server'
import { getCurrentShift, getNextShift, processRollovers } from '@kleo/shared'
import type { WorkSchedule, Task } from '@kleo/shared'

export async function buildUserContext(userId: string) {
  const supabase = await createClient()
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().split('T')[0]

  const [
    { data: profile },
    { data: rawTasks },
    { data: events },
    { data: goals },
    { data: thoughts },
    { data: insights },
    { data: scheduleRows },
    { data: alarms },
    { data: journalToday },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('tasks').select('*').eq('user_id', userId)
      .in('status', ['pending', 'in_progress']).eq('archived', false),
    supabase.from('events').select('*').eq('user_id', userId)
      .gte('start_at', todayStr).lt('start_at', tomorrowStr).order('start_at'),
    supabase.from('goals').select('*, goal_steps(*)').eq('user_id', userId)
      .eq('status', 'active').eq('archived', false),
    supabase.from('thoughts').select('*').eq('user_id', userId)
      .eq('archived', false).order('created_at', { ascending: false }).limit(5),
    supabase.from('user_insights').select('*').eq('user_id', userId),
    supabase.from('work_schedules').select('*').eq('user_id', userId)
      .eq('is_active', true).order('start_date', { ascending: false }).limit(1),
    supabase.from('alarms').select('time, label, enabled').eq('user_id', userId)
      .eq('enabled', true).order('time').limit(3),
    supabase.from('journal_entries').select('mood, content').eq('user_id', userId)
      .eq('date', todayStr).maybeSingle(),
  ])

  const schedule = (scheduleRows?.[0] ?? null) as WorkSchedule | null
  const tasks    = processRollovers((rawTasks ?? []) as Task[])

  const insightVal = (key: string) =>
    insights?.find((i: { key: string; value: unknown }) => i.key === key)?.value

  return {
    // Identity
    name:             profile?.full_name ?? 'Tommy',
    timezone:         profile?.timezone ?? 'Europe/Athens',

    // Time
    current_datetime: now.toLocaleString('el-GR'),
    day_of_week:      now.toLocaleDateString('el-GR', { weekday: 'long' }),
    is_weekend:       [0, 6].includes(now.getDay()),

    // Work schedule
    current_shift:    getCurrentShift(schedule),
    next_shift:       getNextShift(schedule),
    schedule_label:   schedule?.label ?? null,

    // Tasks
    overdue_tasks:    tasks
      .filter(t => t.overdue_days > 0)
      .sort((a, b) => b.overdue_days - a.overdue_days)
      .map(t => ({ title: t.title, category: t.category, overdue_days: t.overdue_days, priority: t.priority })),
    todays_tasks:     tasks
      .filter(t => t.overdue_days === 0)
      .map(t => ({ title: t.title, category: t.category, priority: t.priority, due_date: t.due_date })),

    // Events
    todays_events:    (events ?? []).map((e: { title: string; start_at: string; location?: string }) => ({
      title: e.title,
      time:  new Date(e.start_at).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' }),
      location: e.location,
    })),

    // Goals
    active_goals:     (goals ?? []).map((g: { title: string; progress: number; goal_steps: Array<{ done: boolean; title: string }> }) => ({
      title:     g.title,
      progress:  g.progress,
      next_step: g.goal_steps?.find((s: { done: boolean }) => !s.done)?.title ?? null,
    })),

    // Thoughts (last 5)
    recent_thoughts: (thoughts ?? []).map((t: { content: string }) => t.content),

    // Alarms
    next_alarms: (alarms ?? []).map((a: { time: string; label?: string }) => `${a.time}${a.label ? ' – ' + a.label : ''}`),

    // Today's journal mood
    today_mood: (journalToday as { mood?: number } | null)?.mood ?? null,

    // Adaptive insights
    insights: {
      avg_daily_tasks:       insightVal('avg_daily_tasks_completed'),
      most_delayed_category: insightVal('most_delayed_category'),
      completion_rate:       insightVal('completion_rate'),
      avg_mood:              insightVal('avg_mood'),
    },
  }
}

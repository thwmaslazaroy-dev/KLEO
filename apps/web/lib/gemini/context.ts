import { createClient } from '@/lib/supabase/server'
import { getCurrentShift, getNextShift } from '@kleo/shared'
import type { WorkSchedule } from '@kleo/shared'

export async function buildUserContext(userId: string) {
  const supabase = await createClient()
  const now = new Date()

  const [
    { data: profile },
    { data: tasks },
    { data: events },
    { data: goals },
    { data: thoughts },
    { data: insights },
    { data: schedules },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'in_progress'])
      .eq('archived', false),
    supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_at', now.toISOString().split('T')[0])
      .lt('start_at', new Date(now.getTime() + 86400000).toISOString().split('T')[0]),
    supabase
      .from('goals')
      .select('*, goal_steps(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('archived', false),
    supabase
      .from('thoughts')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.from('user_insights').select('*').eq('user_id', userId),
    supabase
      .from('work_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single(),
  ])

  const schedule = schedules as WorkSchedule | null

  return {
    name: profile?.full_name ?? 'Tommy',
    timezone: profile?.timezone ?? 'Europe/Athens',
    current_datetime: now.toLocaleString('el-GR'),
    day_of_week: now.toLocaleDateString('el-GR', { weekday: 'long' }),
    current_shift: getCurrentShift(schedule),
    next_shift: getNextShift(schedule),
    overdue_tasks: (tasks ?? [])
      .filter((t) => (t.overdue_days ?? 0) > 0)
      .sort((a, b) => (b.overdue_days ?? 0) - (a.overdue_days ?? 0)),
    todays_tasks: tasks ?? [],
    todays_events: events ?? [],
    active_goals: (goals ?? []).map((g) => ({
      title: g.title,
      progress: g.progress,
      next_step: (g.goal_steps as Array<{ done: boolean; title: string }>)?.find(
        (s) => !s.done
      )?.title,
    })),
    recent_thoughts: (thoughts ?? []).map((t: { content: string }) => t.content),
    insights: {
      productive_hours: insights?.find((i: { key: string }) => i.key === 'productive_hours')?.value,
      avg_daily_tasks: insights?.find((i: { key: string }) => i.key === 'avg_daily_tasks_completed')?.value,
      most_delayed_category: insights?.find((i: { key: string }) => i.key === 'most_delayed_category')?.value,
    },
  }
}

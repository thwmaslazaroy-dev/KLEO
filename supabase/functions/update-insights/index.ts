import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const { user_id } = await req.json() as { user_id: string }

  const [{ data: tasks }, { data: journal }] = await Promise.all([
    supabase.from('tasks').select('status, category, overdue_days, created_at, updated_at').eq('user_id', user_id),
    supabase.from('journal_entries').select('mood, date').eq('user_id', user_id).order('date', { ascending: false }).limit(30),
  ])

  if (!tasks) return new Response('no data', { status: 200 })

  const completed = tasks.filter((t: { status: string }) => t.status === 'done')

  // avg daily tasks completed (last 7 days)
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentDone = completed.filter((t: { updated_at: string }) => new Date(t.updated_at) >= sevenDaysAgo)
  const avgDailyTasks = Math.round(recentDone.length / 7 * 10) / 10

  // most delayed category
  const delayCounts: Record<string, number> = {}
  tasks.filter((t: { overdue_days: number }) => t.overdue_days > 0).forEach((t: { category: string }) => {
    delayCounts[t.category] = (delayCounts[t.category] ?? 0) + 1
  })
  const mostDelayed = Object.entries(delayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // completion rate
  const completionRate = tasks.length > 0
    ? Math.round(completed.length / tasks.length * 100) / 100
    : 0

  // avg mood
  const moods = (journal ?? []).map((j: { mood: number | null }) => j.mood).filter(Boolean) as number[]
  const avgMood = moods.length ? Math.round(moods.reduce((a: number, b: number) => a + b, 0) / moods.length * 10) / 10 : null

  const insights = [
    { key: 'avg_daily_tasks_completed', value: avgDailyTasks },
    { key: 'most_delayed_category',     value: mostDelayed },
    { key: 'completion_rate',           value: completionRate },
    ...(avgMood !== null ? [{ key: 'avg_mood', value: avgMood }] : []),
  ]

  for (const insight of insights) {
    if (insight.value === null) continue
    await supabase.from('user_insights').upsert(
      { user_id, key: insight.key, value: insight.value, last_updated: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
  }

  return new Response(JSON.stringify({ updated: insights.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

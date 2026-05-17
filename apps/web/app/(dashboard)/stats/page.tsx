import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StreakCard from '@/components/stats/StreakCard'
import WeeklyChart from '@/components/stats/WeeklyChart'
import CategoryBreakdown from '@/components/stats/CategoryBreakdown'
import type { Task, JournalEntry } from '@kleo/shared'

function startOfDay(d: Date) {
  const r = new Date(d); r.setHours(0,0,0,0); return r
}

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sevenDaysAgo  = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [{ data: allTasks }, { data: journalData }, { data: goalData }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', user.id).eq('archived', false).gte('created_at', thirtyDaysAgo.toISOString()),
    supabase.from('journal_entries').select('date, mood').eq('user_id', user.id).gte('date', sevenDaysAgo.toISOString().split('T')[0]).order('date'),
    supabase.from('goals').select('status').eq('user_id', user.id).eq('archived', false),
  ])

  const tasks = (allTasks ?? []) as Task[]
  const done  = tasks.filter(t => t.status === 'done')
  const total = tasks.length
  const completionRate = total > 0 ? Math.round((done.length / total) * 100) : 0

  // Weekly chart — last 7 days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return startOfDay(d)
  })
  const chartData = weekDays.map(day => {
    const dayTasks = tasks.filter(t => {
      const c = startOfDay(new Date(t.created_at))
      return c.toDateString() === day.toDateString()
    })
    return { label: day.toLocaleDateString('el-GR', { weekday: 'short' }), total: dayTasks.length, completed: dayTasks.filter(t => t.status === 'done').length }
  })

  // Category breakdown (done tasks)
  const catBreakdown: Record<string, number> = {}
  done.forEach(t => { catBreakdown[t.category] = (catBreakdown[t.category] ?? 0) + 1 })

  // Streak — consecutive days with ≥1 completed task
  let streak = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const dayStr = startOfDay(d).toDateString()
    const hasDone = done.some(t => startOfDay(new Date(t.updated_at ?? t.created_at)).toDateString() === dayStr)
    if (hasDone) streak++; else break
  }

  // Avg mood
  const moods = (journalData ?? []).map((j: { mood: number | null }) => j.mood).filter(Boolean) as number[]
  const avgMood = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : '–'

  const activeGoals    = (goalData ?? []).filter((g: { status: string }) => g.status === 'active').length
  const completedGoals = (goalData ?? []).filter((g: { status: string }) => g.status === 'completed').length

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-heading font-bold">Στατιστικά</h1>
      <p className="text-muted text-sm -mt-4">Τελευταίες 30 μέρες</p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StreakCard label="Streak" value={streak} sub="συνεχόμενες μέρες" accent="#E8523A" icon="🔥" />
        <StreakCard label="Ολοκλ. tasks" value={done.length} sub={`από ${total} συνολικά`} accent="#2BB8B8" icon="✅" />
        <StreakCard label="Completion rate" value={`${completionRate}%`} sub="ποσοστό επιτυχίας" accent="#10b981" icon="📈" />
        <StreakCard label="Μέση διάθεση" value={avgMood} sub="από 5 (εβδομάδα)" accent="#f59e0b" icon="😊" />
      </div>

      {/* Goals row */}
      <div className="grid grid-cols-2 gap-3">
        <StreakCard label="Ενεργοί στόχοι" value={activeGoals} accent="#6366f1" icon="🎯" />
        <StreakCard label="Ολοκλ. στόχοι" value={completedGoals} accent="#2BB8B8" icon="🏆" />
      </div>

      {/* Weekly chart */}
      <WeeklyChart data={chartData} />

      {/* Category breakdown */}
      {done.length > 0 && (
        <CategoryBreakdown data={catBreakdown} total={done.length} />
      )}

      {/* Most productive day */}
      {chartData.some(d => d.completed > 0) && (() => {
        const best = [...chartData].sort((a, b) => b.completed - a.completed)[0]
        return (
          <div className="bg-bg-elevated rounded-2xl p-4 border border-white/5 flex items-center gap-4">
            <span className="text-3xl">⭐</span>
            <div>
              <p className="text-xs text-muted">Καλύτερη μέρα εβδομάδας</p>
              <p className="font-medium text-white">{best.label} — {best.completed} tasks</p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

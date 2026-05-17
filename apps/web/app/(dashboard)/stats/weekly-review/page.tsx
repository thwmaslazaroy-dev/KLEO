import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WeeklyReview from '@/components/ai/WeeklyReview'
import type { WeeklyReview as WeeklyReviewType, JournalEntry, Task } from '@kleo/shared'

function getWeekStart(d = new Date()): Date {
  const r = new Date(d)
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7))
  r.setHours(0,0,0,0)
  return r
}

export default async function WeeklyReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const weekStart = getWeekStart()
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7)

  const [{ data: savedReview }, { data: weekTasks }, { data: weekJournal }] = await Promise.all([
    supabase.from('weekly_reviews').select('*').eq('user_id', user.id).eq('week_start', weekStartStr).maybeSingle(),
    supabase.from('tasks').select('*').eq('user_id', user.id)
      .gte('updated_at', weekStart.toISOString()).lt('updated_at', weekEnd.toISOString()),
    supabase.from('journal_entries').select('*').eq('user_id', user.id)
      .gte('date', weekStartStr).lt('date', weekEnd.toISOString().split('T')[0]).order('date'),
  ])

  const tasks = (weekTasks ?? []) as Task[]
  const completedCount = tasks.filter(t => t.status === 'done').length
  const rolledOver = tasks.filter(t => t.rolled_over).length
  const moods = (weekJournal ?? []).map((j: JournalEntry) => j.mood).filter(Boolean) as number[]
  const avgMood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null

  const review = savedReview as WeeklyReviewType | null

  // Stats cards
  const stats = [
    { label: 'Tasks ολοκλήρωσες', value: completedCount, icon: '✅' },
    { label: 'Μεταφέρθηκαν', value: rolledOver, icon: '↩' },
    { label: 'Μέρες journal', value: weekJournal?.length ?? 0, icon: '📔' },
    { label: 'Μέση διάθεση', value: avgMood ? avgMood.toFixed(1) : '–', icon: '😊' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Weekly Review</h1>
        <p className="text-muted text-sm mt-1">
          Εβδομάδα {weekStart.toLocaleDateString('el-GR', { day: 'numeric', month: 'long' })} –{' '}
          {new Date(weekEnd.getTime() - 1).toLocaleDateString('el-GR', { day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-bg-elevated rounded-xl p-3 border border-white/5 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-muted mt-0.5 leading-snug">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Review */}
      <WeeklyReview
        initialReview={review?.reflection ?? ''}
        weekStart={weekStartStr}
        completedTasks={completedCount}
        moodAverage={avgMood}
      />

      {/* Past reviews */}
      <PastReviews userId={user.id} />
    </div>
  )
}

async function PastReviews({ userId }: { userId: string }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(4)

  if (!data?.length) return null

  return (
    <section className="border-t border-white/5 pt-6">
      <h2 className="text-sm font-medium text-muted mb-4">Προηγούμενες εβδομάδες</h2>
      <div className="space-y-3">
        {(data as WeeklyReviewType[]).map(r => (
          <div key={r.id} className="bg-bg-elevated rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white">
                {new Date(r.week_start).toLocaleDateString('el-GR', { day: 'numeric', month: 'long' })}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted">
                <span>✅ {r.completed_tasks}</span>
                {r.mood_average && <span>😊 {Number(r.mood_average).toFixed(1)}</span>}
              </div>
            </div>
            {r.reflection && <p className="text-xs text-muted line-clamp-2">{r.reflection}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

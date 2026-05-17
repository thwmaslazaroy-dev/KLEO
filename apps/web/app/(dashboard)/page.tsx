import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { processRollovers, sortTodayTasks, isToday, CATEGORIES } from '@kleo/shared'
import DailyBrief from '@/components/ai/DailyBrief'
import TaskList from '@/components/tasks/TaskList'
import type { Task, Thought, Goal } from '@kleo/shared'

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: rawTasks },
    { data: thoughts },
    { data: goals },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'in_progress'])
      .eq('archived', false)
      .order('created_at', { ascending: false }),
    supabase
      .from('thoughts')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('goals')
      .select('*, goal_steps(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('archived', false)
      .limit(3),
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
  ])

  const tasks = processRollovers((rawTasks ?? []) as Task[])
  const overdueTasks = tasks.filter((t) => t.overdue_days > 0)
  const todayTasks = sortTodayTasks(tasks.filter((t) => isToday(t.due_date) && t.overdue_days === 0))
  const name = profile?.full_name ?? 'Tommy'

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-heading font-bold">
          Γεια σου, {name}! 👋
        </h1>
        <p className="text-muted text-sm mt-1">
          {new Date().toLocaleDateString('el-GR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* AI Daily Brief */}
      <DailyBrief userId={user.id} />

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-coral mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            Καθυστερούν ({overdueTasks.length})
          </h2>
          <TaskList tasks={overdueTasks} userId={user.id} showOverdueBadge />
        </section>
      )}

      {/* Today Tasks */}
      <section>
        <h2 className="text-sm font-medium text-muted mb-3 flex items-center gap-2">
          <span>📌</span> Σήμερα
        </h2>
        {todayTasks.length === 0 ? (
          <p className="text-muted text-sm bg-bg-elevated rounded-xl px-4 py-3">
            Δεν έχεις tasks για σήμερα.
          </p>
        ) : (
          <TaskList tasks={todayTasks} userId={user.id} />
        )}
      </section>

      {/* Recent Thoughts */}
      {(thoughts?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted mb-3 flex items-center gap-2">
            <span>💭</span> Σκέψεις
          </h2>
          <div className="space-y-2">
            {(thoughts as Thought[]).map((t) => (
              <div
                key={t.id}
                className="bg-bg-elevated rounded-xl px-4 py-3 text-sm text-white/80 border border-white/5"
              >
                {t.content}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Goals Snapshot */}
      {(goals?.length ?? 0) > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted mb-3 flex items-center gap-2">
            <span>🎯</span> Goals
          </h2>
          <div className="space-y-3">
            {(goals as Goal[]).map((g) => (
              <div key={g.id} className="bg-bg-elevated rounded-xl px-4 py-3 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {CATEGORIES[g.category as keyof typeof CATEGORIES]?.emoji} {g.title}
                  </span>
                  <span className="text-xs text-muted">{g.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal rounded-full transition-all"
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

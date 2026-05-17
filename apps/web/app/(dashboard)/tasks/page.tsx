import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { processRollovers } from '@kleo/shared'
import TaskList from '@/components/tasks/TaskList'
import TaskForm from '@/components/tasks/TaskForm'
import AIPrioritize from '@/components/ai/AIPrioritize'
import type { Task } from '@kleo/shared'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('archived', false)
    .order('created_at', { ascending: false })

  const tasks = processRollovers((rawTasks ?? []) as Task[])

  const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Tasks</h1>
        <TaskForm userId={user.id} />
      </div>

      <AIPrioritize />

      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted mb-3">
            Εκκρεμεί ({pending.length})
          </h2>
          <TaskList tasks={pending} userId={user.id} showOverdueBadge />
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted mb-3">
            Ολοκληρώθηκαν ({done.length})
          </h2>
          <TaskList tasks={done} userId={user.id} />
        </section>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-muted">Δεν έχεις tasks. Πρόσθεσε ένα!</p>
        </div>
      )}
    </div>
  )
}

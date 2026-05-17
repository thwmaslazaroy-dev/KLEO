'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, PRIORITY_COLORS, PRIORITY_LABELS } from '@kleo/shared'
import RolloverBadge from './RolloverBadge'
import Badge from '@/components/ui/Badge'
import type { Task } from '@kleo/shared'

interface TaskCardProps {
  task: Task
  showOverdueBadge?: boolean
  onUpdate?: (id: string, patch: Partial<Task>) => void
  onDelete?: (id: string) => void
}

export default function TaskCard({ task, showOverdueBadge, onUpdate, onDelete }: TaskCardProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const category = CATEGORIES[task.category]

  async function markDone() {
    if (loading) return
    setLoading(true)
    const status = task.status === 'done' ? 'pending' : 'done'
    await supabase.from('tasks').update({ status }).eq('id', task.id)
    onUpdate?.(task.id, { status })
    setLoading(false)
  }

  async function archive() {
    await supabase.from('tasks').update({ archived: true }).eq('id', task.id)
    onDelete?.(task.id)
  }

  const isDone = task.status === 'done'

  return (
    <div className={`flex items-start gap-3 bg-bg-elevated rounded-xl px-4 py-3 border border-white/5 group transition hover:border-white/10 ${isDone ? 'opacity-50' : ''}`}>
      <button
        onClick={markDone}
        disabled={loading}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition ${
          isDone
            ? 'bg-teal border-teal'
            : 'border-white/30 hover:border-teal'
        }`}
      >
        {isDone && <span className="text-white text-xs flex items-center justify-center h-full">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-muted' : 'text-white'}`}>
            {task.title}
          </p>
          <button
            onClick={archive}
            className="opacity-0 group-hover:opacity-100 text-muted hover:text-white text-xs transition flex-shrink-0"
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge color={category.color}>
            {category.emoji} {category.label}
          </Badge>
          <Badge
            color={PRIORITY_COLORS[task.priority]}
          >
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          {showOverdueBadge && task.overdue_days > 0 && (
            <RolloverBadge days={task.overdue_days} />
          )}
          {task.due_date && (
            <span className="text-xs text-muted">
              {new Date(task.due_date).toLocaleDateString('el-GR', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

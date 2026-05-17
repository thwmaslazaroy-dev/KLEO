'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import ProgressBar from './ProgressBar'
import StepList from './StepList'
import Badge from '@/components/ui/Badge'
import type { Goal, GoalStep } from '@kleo/shared'

interface GoalCardProps {
  goal: Goal
  userId: string
  onDelete?: (id: string) => void
  onUpdate?: (goal: Goal) => void
}

export default function GoalCard({ goal, userId, onDelete, onUpdate }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [steps, setSteps] = useState<GoalStep[]>(goal.steps ?? [])
  const supabase = createClient()
  const cat = CATEGORIES[goal.category as keyof typeof CATEGORIES]

  const statusColors: Record<string, string> = {
    active: '#10b981', completed: '#2BB8B8', paused: '#f59e0b', cancelled: '#6b7280',
  }
  const statusLabels: Record<string, string> = {
    active: 'Ενεργός', completed: 'Ολοκληρώθηκε', paused: 'Παύση', cancelled: 'Ακυρώθηκε',
  }

  async function archive() {
    await supabase.from('goals').update({ archived: true }).eq('id', goal.id)
    onDelete?.(goal.id)
  }

  async function toggleStatus() {
    const next = goal.status === 'active' ? 'paused' : 'active'
    await supabase.from('goals').update({ status: next }).eq('id', goal.id)
    onUpdate?.({ ...goal, status: next })
  }

  function handleStepsChange(updated: GoalStep[]) {
    setSteps(updated)
    const progress = updated.length ? Math.round(updated.filter(s => s.done).length / updated.length * 100) : goal.progress
    onUpdate?.({ ...goal, steps: updated, progress })
  }

  const currentProgress = steps.length
    ? Math.round(steps.filter(s => s.done).length / steps.length * 100)
    : goal.progress

  return (
    <div className={`bg-bg-elevated rounded-2xl border transition ${expanded ? 'border-white/10' : 'border-white/5'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge color={cat?.color}>{cat?.emoji} {cat?.label}</Badge>
              <Badge color={statusColors[goal.status]}>{statusLabels[goal.status]}</Badge>
            </div>
            <h3 className="font-medium text-white">{goal.title}</h3>
            {goal.description && <p className="text-xs text-muted mt-0.5 line-clamp-1">{goal.description}</p>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={toggleStatus} className="text-xs text-muted hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5">
              {goal.status === 'active' ? '⏸' : '▶'}
            </button>
            <button onClick={archive} className="text-xs text-muted hover:text-coral transition px-2 py-1 rounded-lg hover:bg-coral/5">×</button>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{steps.length ? `${steps.filter(s => s.done).length}/${steps.length} βήματα` : 'Πρόοδος'}</span>
            <span className="font-medium text-white">{currentProgress}%</span>
          </div>
          <ProgressBar value={currentProgress} />
        </div>

        {goal.target_date && (
          <p className="text-xs text-muted mt-2">
            📅 {new Date(goal.target_date).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      <div className="px-4 pb-3 border-t border-white/5 pt-3">
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-muted hover:text-white transition flex items-center gap-1">
          {expanded ? '▲' : '▼'} {expanded ? 'Απόκρυψη βημάτων' : `Βήματα (${steps.length})`}
        </button>
        {expanded && (
          <StepList goalId={goal.id} userId={userId} steps={steps} onStepsChange={handleStepsChange} />
        )}
      </div>
    </div>
  )
}

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

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981', completed: '#2BB8B8', paused: '#f59e0b', cancelled: '#6b7280',
}
const STATUS_LABELS: Record<string, string> = {
  active: 'Ενεργός', completed: 'Ολοκληρώθηκε', paused: 'Παύση', cancelled: 'Ακυρώθηκε',
}

export default function GoalCard({ goal, userId, onDelete, onUpdate }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [steps, setSteps] = useState<GoalStep[]>(goal.steps ?? [])
  const supabase = createClient()
  const cat = CATEGORIES[goal.category as keyof typeof CATEGORIES]

  const currentProgress = steps.length
    ? Math.round(steps.filter(s => s.done).length / steps.length * 100)
    : goal.progress

  const daysLeft = goal.target_date
    ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000)
    : null

  async function archive() {
    await supabase.from('goals').update({ archived: true }).eq('id', goal.id)
    onDelete?.(goal.id)
  }

  async function cycleStatus() {
    const next = goal.status === 'active' ? 'paused' : 'active'
    await supabase.from('goals').update({ status: next }).eq('id', goal.id)
    onUpdate?.({ ...goal, status: next as Goal['status'] })
  }

  async function markComplete() {
    await supabase.from('goals').update({ status: 'completed', progress: 100 }).eq('id', goal.id)
    onUpdate?.({ ...goal, status: 'completed', progress: 100 })
  }

  function handleStepsChange(updated: GoalStep[]) {
    setSteps(updated)
    const progress = updated.length
      ? Math.round(updated.filter(s => s.done).length / updated.length * 100)
      : goal.progress
    onUpdate?.({ ...goal, steps: updated, progress })
  }

  return (
    <div className={`bg-bg-elevated rounded-2xl border transition-all ${expanded ? 'border-white/10' : 'border-white/5'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge color={cat?.color}>{cat?.emoji} {cat?.label}</Badge>
              <Badge color={STATUS_COLORS[goal.status]}>{STATUS_LABELS[goal.status]}</Badge>
              {daysLeft !== null && goal.status === 'active' && (
                <span className={`text-xs ${daysLeft < 7 ? 'text-coral' : daysLeft < 30 ? 'text-yellow-400' : 'text-muted'}`}>
                  {daysLeft > 0 ? `${daysLeft} μέρες` : daysLeft === 0 ? 'Σήμερα!' : 'Έληξε'}
                </span>
              )}
            </div>
            <h3 className="font-medium text-white leading-snug">{goal.title}</h3>
            {goal.description && <p className="text-xs text-muted mt-1 line-clamp-2">{goal.description}</p>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {goal.status === 'active' && (
              <button onClick={markComplete} className="text-xs text-teal hover:bg-teal/10 transition px-2 py-1 rounded-lg" title="Ολοκλήρωση">✓</button>
            )}
            <button onClick={cycleStatus} className="text-xs text-muted hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5">
              {goal.status === 'active' ? '⏸' : '▶'}
            </button>
            <button onClick={archive} className="text-xs text-muted hover:text-coral transition px-2 py-1 rounded-lg hover:bg-coral/5">×</button>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">
              {steps.length ? `${steps.filter(s => s.done).length} / ${steps.length} βήματα` : 'Πρόοδος'}
            </span>
            <span className={`font-semibold ${currentProgress === 100 ? 'text-teal' : 'text-white'}`}>{currentProgress}%</span>
          </div>
          <ProgressBar value={currentProgress} color={currentProgress === 100 ? '#2BB8B8' : STATUS_COLORS[goal.status]} />
        </div>
      </div>

      <div className="px-4 pb-4 border-t border-white/5 pt-3">
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-muted hover:text-white transition flex items-center gap-1.5">
          <span>{expanded ? '▲' : '▼'}</span>
          <span>{expanded ? 'Απόκρυψη βημάτων' : `Βήματα (${steps.length})`}</span>
        </button>
        {expanded && (
          <StepList goalId={goal.id} userId={userId} steps={steps} onStepsChange={handleStepsChange} />
        )}
      </div>
    </div>
  )
}

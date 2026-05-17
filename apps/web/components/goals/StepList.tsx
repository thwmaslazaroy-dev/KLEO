'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GoalStep } from '@kleo/shared'

interface StepListProps {
  goalId: string
  userId: string
  steps: GoalStep[]
  onStepsChange: (steps: GoalStep[]) => void
}

export default function StepList({ goalId, userId, steps, onStepsChange }: StepListProps) {
  const [newStep, setNewStep] = useState('')
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  async function toggleStep(step: GoalStep) {
    await supabase.from('goal_steps').update({ done: !step.done }).eq('id', step.id)
    const updated = steps.map(s => s.id === step.id ? { ...s, done: !step.done } : s)
    onStepsChange(updated)
    updateGoalProgress(updated)
  }

  async function addStep() {
    if (!newStep.trim()) return
    setAdding(true)
    const { data } = await supabase.from('goal_steps').insert({
      goal_id: goalId, user_id: userId,
      title: newStep.trim(), order_index: steps.length,
    }).select().single()
    if (data) {
      const updated = [...steps, data as GoalStep]
      onStepsChange(updated)
      updateGoalProgress(updated)
    }
    setNewStep('')
    setAdding(false)
  }

  async function deleteStep(id: string) {
    await supabase.from('goal_steps').delete().eq('id', id)
    const updated = steps.filter(s => s.id !== id)
    onStepsChange(updated)
    updateGoalProgress(updated)
  }

  async function updateGoalProgress(currentSteps: GoalStep[]) {
    if (currentSteps.length === 0) return
    const progress = Math.round((currentSteps.filter(s => s.done).length / currentSteps.length) * 100)
    await supabase.from('goals').update({ progress }).eq('id', goalId)
  }

  return (
    <div className="space-y-2 mt-3">
      {steps.map(step => (
        <div key={step.id} className="flex items-center gap-2 group">
          <button
            onClick={() => toggleStep(step)}
            className={`w-4 h-4 rounded border-2 flex-shrink-0 transition flex items-center justify-center ${step.done ? 'bg-teal border-teal' : 'border-white/30 hover:border-teal'}`}
          >
            {step.done && <span className="text-white text-xs leading-none">✓</span>}
          </button>
          <span className={`text-sm flex-1 ${step.done ? 'line-through text-muted' : 'text-white/80'}`}>{step.title}</span>
          <button onClick={() => deleteStep(step.id)} className="opacity-0 group-hover:opacity-100 text-muted hover:text-coral text-xs transition">×</button>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <input
          value={newStep}
          onChange={e => setNewStep(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addStep()}
          placeholder="+ Νέο βήμα..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-muted focus:outline-none border-b border-white/10 focus:border-teal py-1 transition"
        />
        {newStep.trim() && (
          <button onClick={addStep} disabled={adding} className="text-xs text-teal hover:text-teal-light transition">
            {adding ? '...' : 'Προσθήκη'}
          </button>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Alarm } from '@kleo/shared'

interface AlarmCardProps {
  alarm: Alarm
  onToggle: (id: string, enabled: boolean) => void
  onDelete: (id: string) => void
}

const DAY_LABELS = ['Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ', 'Κ']
const DAY_FULL   = ['Δευτ', 'Τρίτη', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ', 'Κυρ']

export default function AlarmCard({ alarm, onToggle, onDelete }: AlarmCardProps) {
  const [toggling, setToggling] = useState(false)
  const supabase = createClient()

  async function handleToggle() {
    setToggling(true)
    await supabase.from('alarms').update({ enabled: !alarm.enabled }).eq('id', alarm.id)
    onToggle(alarm.id, !alarm.enabled)
    setToggling(false)
  }

  async function handleDelete() {
    await supabase.from('alarms').delete().eq('id', alarm.id)
    onDelete(alarm.id)
  }

  const days = alarm.days_of_week
  const daysLabel = !days?.length
    ? 'Κάθε μέρα'
    : days.length === 5 && !days.includes(6) && !days.includes(7)
      ? 'Καθημερινές'
      : days.map(d => DAY_FULL[d - 1]).join(', ')

  return (
    <div className={`bg-bg-elevated rounded-2xl p-4 border transition ${alarm.enabled ? 'border-white/8' : 'border-white/5 opacity-60'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-1">
            <span className={`text-3xl font-heading font-bold tabular-nums ${alarm.enabled ? 'text-white' : 'text-muted'}`}>
              {alarm.time}
            </span>
            {alarm.smart_alarm && (
              <span className="text-xs bg-teal/20 text-teal px-2 py-0.5 rounded-full">Smart ⚡</span>
            )}
          </div>
          {alarm.label && <p className="text-sm text-white/70 mb-1">{alarm.label}</p>}
          <p className="text-xs text-muted">{daysLabel}</p>
          {alarm.smart_alarm && alarm.shift_offset_minutes > 0 && (
            <p className="text-xs text-teal/70 mt-0.5">{alarm.shift_offset_minutes} λεπτά πριν τη βάρδια</p>
          )}
          {/* Days of week dots */}
          {days && days.length > 0 && (
            <div className="flex gap-1 mt-2">
              {DAY_LABELS.map((d, i) => (
                <span key={i} className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${days.includes(i + 1) ? 'bg-teal/20 text-teal' : 'bg-white/5 text-muted'}`}>
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative w-11 h-6 rounded-full transition-colors ${alarm.enabled ? 'bg-teal' : 'bg-white/20'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${alarm.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <button onClick={handleDelete} className="text-muted hover:text-coral transition text-sm px-2 py-1 rounded-lg hover:bg-coral/5">×</button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { getCurrentShift } from '@kleo/shared'
import type { WorkSchedule } from '@kleo/shared'

interface ShiftBadgeProps {
  schedule: WorkSchedule | null
  onSwitch?: () => void
}

export default function ShiftBadge({ schedule, onSwitch }: ShiftBadgeProps) {
  const shift = getCurrentShift(schedule)

  if (!schedule) return null

  return (
    <div className="flex items-center gap-2 bg-bg-elevated rounded-xl px-3 py-2 border border-white/5">
      <span className="text-base">🏢</span>
      <div className="flex-1 min-w-0">
        {shift ? (
          <>
            <p className="text-xs text-muted leading-none mb-0.5">{schedule.label ?? 'Βάρδια'}</p>
            <p className="text-sm font-medium text-white">
              {shift.label} · {shift.start}–{shift.end}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">Δεν υπάρχει ενεργή βάρδια</p>
        )}
      </div>
      {onSwitch && (
        <button
          onClick={onSwitch}
          className="text-xs text-teal hover:bg-teal/10 px-2 py-1 rounded-lg transition flex-shrink-0"
        >
          Αλλαγή
        </button>
      )}
    </div>
  )
}

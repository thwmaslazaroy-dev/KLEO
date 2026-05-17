'use client'

import { MOOD_LABELS } from '@kleo/shared'

interface MoodPickerProps {
  value?: number
  onChange: (mood: number) => void
}

export default function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div>
      <label className="block text-sm text-muted mb-2">Πώς ήταν η μέρα σου;</label>
      <div className="flex gap-3">
        {([1, 2, 3, 4, 5] as const).map(m => {
          const mood = MOOD_LABELS[m]
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition ${value === m ? 'border-teal bg-teal/10' : 'border-white/10 bg-bg-elevated hover:border-white/20'}`}
            >
              <span className="text-xl">{mood.emoji}</span>
              <span className={`text-xs ${value === m ? 'text-teal' : 'text-muted'}`}>{mood.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

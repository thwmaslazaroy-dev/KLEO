'use client'

import { useState, useEffect } from 'react'

interface DateTimePickerProps {
  label?: string
  value: string          // ISO "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void
  min?: string
  placeholder?: string
}

function pad(n: number) { return String(n).padStart(2, '0') }

function parseValue(val: string) {
  if (!val) return { date: '', hours: 9, minutes: 0 }
  const [datePart, timePart] = val.split('T')
  const [h, m] = (timePart ?? '09:00').split(':').map(Number)
  return { date: datePart ?? '', hours: h ?? 9, minutes: m ?? 0 }
}

function buildValue(date: string, hours: number, minutes: number): string {
  if (!date) return ''
  return `${date}T${pad(hours)}:${pad(minutes)}`
}

export default function DateTimePicker({ label, value, onChange, min, placeholder }: DateTimePickerProps) {
  const parsed   = parseValue(value)
  const [date, setDate]       = useState(parsed.date)
  const [hours, setHours]     = useState(parsed.hours)
  const [minutes, setMinutes] = useState(parsed.minutes)

  // Sync when value changes externally (e.g. auto-reminder)
  useEffect(() => {
    const p = parseValue(value)
    setDate(p.date)
    setHours(p.hours)
    setMinutes(p.minutes)
  }, [value])

  function emit(d: string, h: number, m: number) {
    onChange(buildValue(d, h, m))
  }

  function handleHourChange(raw: string) {
    const n = Math.min(23, Math.max(0, parseInt(raw) || 0))
    setHours(n)
    emit(date, n, minutes)
  }

  function handleMinuteChange(raw: string) {
    const n = Math.min(59, Math.max(0, parseInt(raw) || 0))
    setMinutes(n)
    emit(date, hours, n)
  }

  function handleDateChange(d: string) {
    setDate(d)
    emit(d, hours, minutes)
  }

  const isAM   = hours < 12
  const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours

  return (
    <div>
      {label && <label className="block text-sm text-muted mb-1">{label}</label>}
      <div className={`flex items-center gap-2 bg-bg-elevated border rounded-xl px-3 py-2.5 transition ${date ? 'border-white/20' : 'border-white/10'} focus-within:border-teal`}>
        {/* Date */}
        <input
          type="date"
          value={date}
          min={min?.split('T')[0]}
          onChange={e => handleDateChange(e.target.value)}
          className="bg-transparent text-white text-sm focus:outline-none flex-shrink-0 w-32"
          placeholder={placeholder ?? 'Ημερομηνία'}
        />

        {date && (
          <>
            <span className="text-white/20 flex-shrink-0">·</span>

            {/* Hour */}
            <input
              type="number"
              min={0}
              max={23}
              value={pad(hours)}
              onChange={e => handleHourChange(e.target.value)}
              onBlur={e  => handleHourChange(e.target.value)}
              className="bg-transparent text-white text-sm text-center focus:outline-none w-8 tabular-nums"
            />
            <span className="text-muted text-sm flex-shrink-0">:</span>
            {/* Minutes */}
            <input
              type="number"
              min={0}
              max={59}
              value={pad(minutes)}
              onChange={e => handleMinuteChange(e.target.value)}
              onBlur={e  => handleMinuteChange(e.target.value)}
              className="bg-transparent text-white text-sm text-center focus:outline-none w-8 tabular-nums"
            />

            {/* AM/PM badge — auto, read-only */}
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${isAM ? 'bg-teal/20 text-teal' : 'bg-coral/20 text-coral'}`}>
              {isAM ? 'AM' : 'PM'}
            </span>

            {/* 12h display hint */}
            <span className="text-xs text-muted flex-shrink-0 ml-auto">
              {hour12}:{pad(minutes)} {isAM ? 'πμ' : 'μμ'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

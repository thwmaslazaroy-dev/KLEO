'use client'

import { useMemo } from 'react'
import EventCard from './EventCard'
import type { Event } from '@kleo/shared'

interface WeekViewProps {
  events: Event[]
  weekStart: Date
  onDelete: (id: string) => void
}

const DAY_NAMES = ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ']

export default function WeekView({ events, weekStart, onDelete }: WeekViewProps) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    })
  }, [weekStart])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, i) => {
        const isToday = day.toDateString() === today.toDateString()
        const dayEvents = events.filter(e => {
          const d = new Date(e.start_at)
          return d.toDateString() === day.toDateString()
        })

        return (
          <div key={i} className={`min-h-24 rounded-xl p-2 border transition ${isToday ? 'border-teal/30 bg-teal/5' : 'border-white/5 bg-bg-elevated'}`}>
            <div className={`text-xs font-medium mb-2 ${isToday ? 'text-teal' : 'text-muted'}`}>
              <div>{DAY_NAMES[i]}</div>
              <div className={`text-lg font-bold ${isToday ? 'text-teal' : 'text-white'}`}>{day.getDate()}</div>
            </div>
            <div className="space-y-1">
              {dayEvents.map(e => (
                <div key={e.id} className="text-xs bg-teal/20 text-teal rounded px-1.5 py-0.5 truncate cursor-default" title={e.title}>
                  {e.title}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

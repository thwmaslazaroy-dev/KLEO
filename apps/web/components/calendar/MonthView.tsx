'use client'

import { useMemo, useState } from 'react'
import { CATEGORIES } from '@kleo/shared'
import EventForm from './EventForm'
import type { Event } from '@kleo/shared'

interface MonthViewProps {
  events: Event[]
  month: Date
  userId: string
  onDelete: (id: string) => void
  onCreated: () => void
}

const DAY_HEADERS = ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ']

function getMonthGrid(month: Date): (Date | null)[] {
  const year = month.getFullYear()
  const m = month.getMonth()
  const firstDay = new Date(year, m, 1)
  const lastDay = new Date(year, m + 1, 0)

  // Monday-based: getDay() → 0=Sun → shift to Mon=0
  const startDow = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()
  const grid: (Date | null)[] = Array(startDow).fill(null)
  for (let d = 1; d <= totalDays; d++) grid.push(new Date(year, m, d))
  while (grid.length % 7 !== 0) grid.push(null)
  return grid
}

export default function MonthView({ events, month, userId, onDelete, onCreated }: MonthViewProps) {
  const [quickDate, setQuickDate] = useState<string | null>(null)
  const grid = useMemo(() => getMonthGrid(month), [month])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  function eventsForDay(day: Date): Event[] {
    return events.filter(e => {
      const d = new Date(e.start_at)
      return d.getFullYear() === day.getFullYear() &&
             d.getMonth() === day.getMonth() &&
             d.getDate() === day.getDate()
    })
  }

  return (
    <>
      <div className="rounded-2xl border border-white/5 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-bg-elevated border-b border-white/5">
          {DAY_HEADERS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted py-3">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-white/5">
          {grid.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="min-h-24 bg-bg/30" />

            const isToday = day.toDateString() === today.toDateString()
            const isPast = day < today
            const dayEvents = eventsForDay(day)
            const dateStr = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`

            return (
              <div
                key={dateStr}
                onClick={() => setQuickDate(dateStr + 'T09:00')}
                className={`min-h-24 p-2 cursor-pointer transition hover:bg-white/3 ${isPast ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-end mb-1">
                  <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-coral text-white'
                      : 'text-muted'
                  }`}>
                    {day.getDate()}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map(e => {
                    const cat = CATEGORIES[e.category as keyof typeof CATEGORIES]
                    return (
                      <div
                        key={e.id}
                        onClick={ev => ev.stopPropagation()}
                        className="text-xs rounded px-1.5 py-0.5 truncate font-medium"
                        style={{ backgroundColor: `${cat?.color}30`, color: cat?.color }}
                        title={e.title}
                      >
                        {e.title}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted px-1">+{dayEvents.length - 3} ακόμα</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick-add form when day is clicked */}
      {quickDate && (
        <EventForm
          userId={userId}
          prefillDate={quickDate}
          onCreated={() => { setQuickDate(null); onCreated() }}
          onCancel={() => setQuickDate(null)}
          autoOpen
        />
      )}
    </>
  )
}

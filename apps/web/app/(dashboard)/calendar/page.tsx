'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import MonthView from '@/components/calendar/MonthView'
import WeekView from '@/components/calendar/WeekView'
import EventCard from '@/components/calendar/EventCard'
import EventForm from '@/components/calendar/EventForm'
import type { Event } from '@kleo/shared'

type View = 'month' | 'week' | 'list'

function getWeekStart(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay()
  r.setDate(r.getDate() - ((day + 6) % 7))
  r.setHours(0, 0, 0, 0)
  return r
}

const MONTH_NAMES = ['Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος','Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος']

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [userId, setUserId] = useState('')
  const [view, setView] = useState<View>('month')
  const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d })
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    let from: Date, to: Date
    if (view === 'month') {
      from = new Date(month.getFullYear(), month.getMonth(), 1)
      to   = new Date(month.getFullYear(), month.getMonth() + 1, 1)
    } else {
      from = new Date(weekStart)
      to   = new Date(weekStart); to.setDate(to.getDate() + 7)
    }

    const { data } = await supabase
      .from('events').select('*')
      .eq('user_id', user.id).eq('archived', false)
      .gte('start_at', from.toISOString())
      .lt('start_at', to.toISOString())
      .order('start_at')

    setEvents((data ?? []) as Event[])
  }, [view, month, weekStart])

  useEffect(() => { load() }, [load])

  function prevPeriod() {
    if (view === 'month') setMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    else setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
  }
  function nextPeriod() {
    if (view === 'month') setMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    else setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
  }
  function goToday() {
    setMonth(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d })
    setWeekStart(getWeekStart(new Date()))
  }

  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6)

  const periodLabel = view === 'month'
    ? `${MONTH_NAMES[month.getMonth()]} ${month.getFullYear()}`
    : `${weekStart.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })} – ${weekEnd.toLocaleDateString('el-GR', { day: 'numeric', month: 'short', year: 'numeric' })}`

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-heading font-bold">Ημερολόγιο</h1>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl border border-white/10 overflow-hidden">
            {(['month','week','list'] as View[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium transition ${view === v ? 'bg-coral text-white' : 'text-muted hover:text-white hover:bg-white/5'}`}
              >
                {v === 'month' ? 'Μήνας' : v === 'week' ? 'Εβδομάδα' : 'Λίστα'}
              </button>
            ))}
          </div>
          {userId && <EventForm userId={userId} onCreated={load} />}
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center gap-3">
        <button onClick={prevPeriod} className="w-8 h-8 flex items-center justify-center text-muted hover:text-white hover:bg-white/5 rounded-lg transition text-lg">‹</button>
        <button onClick={nextPeriod} className="w-8 h-8 flex items-center justify-center text-muted hover:text-white hover:bg-white/5 rounded-lg transition text-lg">›</button>
        <span className="font-heading font-semibold text-white">{periodLabel}</span>
        <button onClick={goToday} className="ml-auto text-xs text-muted hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition">Σήμερα</button>
      </div>

      {/* Views */}
      {view === 'month' && (
        <MonthView
          events={events}
          month={month}
          userId={userId}
          onDelete={id => setEvents(p => p.filter(e => e.id !== id))}
          onCreated={load}
        />
      )}

      {view === 'week' && (
        <WeekView
          events={events}
          weekStart={weekStart}
          onDelete={id => setEvents(p => p.filter(e => e.id !== id))}
        />
      )}

      {view === 'list' && (
        <div className="space-y-2">
          {events.length === 0
            ? <p className="text-muted text-sm text-center py-16">Δεν έχεις events αυτή την περίοδο.</p>
            : events.map(e => <EventCard key={e.id} event={e} onDelete={id => setEvents(p => p.filter(ev => ev.id !== id))} />)
          }
        </div>
      )}
    </div>
  )
}

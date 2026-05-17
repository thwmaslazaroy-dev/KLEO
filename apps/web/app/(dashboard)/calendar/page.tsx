'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import EventCard from '@/components/calendar/EventCard'
import EventForm from '@/components/calendar/EventForm'
import WeekView from '@/components/calendar/WeekView'
import type { Event } from '@kleo/shared'

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [userId, setUserId] = useState<string>('')
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()))
  const [view, setView] = useState<'week' | 'list'>('week')
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const from = new Date(weekStart)
    const to = new Date(weekStart)
    to.setDate(to.getDate() + 7)

    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', false)
      .gte('start_at', from.toISOString())
      .lt('start_at', to.toISOString())
      .order('start_at')

    setEvents((data ?? []) as Event[])
  }, [weekStart])

  useEffect(() => { load() }, [load])

  function prevWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n })
  }
  function nextWeek() {
    setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n })
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const todayEvents = events.filter(e => {
    const d = new Date(e.start_at)
    const t = new Date()
    return d.toDateString() === t.toDateString()
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Ημερολόγιο</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(v => v === 'week' ? 'list' : 'week')} className="text-xs text-muted hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition">
            {view === 'week' ? '📋 Λίστα' : '📅 Εβδομάδα'}
          </button>
          {userId && <EventForm userId={userId} onCreated={load} />}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={prevWeek} className="text-muted hover:text-white transition px-2">‹</button>
        <span className="text-sm font-medium">
          {weekStart.toLocaleDateString('el-GR', { day: 'numeric', month: 'long' })} –{' '}
          {weekEnd.toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <button onClick={nextWeek} className="text-muted hover:text-white transition px-2">›</button>
      </div>

      {view === 'week' ? (
        <WeekView events={events} weekStart={weekStart} onDelete={id => setEvents(p => p.filter(e => e.id !== id))} />
      ) : (
        <div className="space-y-2">
          {events.length === 0 ? (
            <p className="text-muted text-sm text-center py-12">Δεν έχεις events αυτή την εβδομάδα.</p>
          ) : (
            events.map(e => <EventCard key={e.id} event={e} onDelete={id => setEvents(p => p.filter(ev => ev.id !== id))} />)
          )}
        </div>
      )}

      {todayEvents.length > 0 && view === 'week' && (
        <section>
          <h2 className="text-sm font-medium text-muted mb-3">📌 Σήμερα</h2>
          <div className="space-y-2">
            {todayEvents.map(e => <EventCard key={e.id} event={e} onDelete={id => setEvents(p => p.filter(ev => ev.id !== id))} />)}
          </div>
        </section>
      )}
    </div>
  )
}

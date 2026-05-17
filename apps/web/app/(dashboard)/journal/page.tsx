'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import JournalEntryForm from '@/components/journal/JournalEntry'
import { MOOD_LABELS } from '@kleo/shared'
import type { JournalEntry } from '@kleo/shared'

export default function JournalPage() {
  const [userId, setUserId] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      loadEntries(user.id)
    })
  }, [])

  useEffect(() => {
    if (userId) loadEntry(userId, selectedDate)
  }, [selectedDate, userId])

  async function loadEntry(uid: string, date: string) {
    setLoading(true)
    const { data } = await supabase.from('journal_entries').select('*').eq('user_id', uid).eq('date', date).maybeSingle()
    setEntry(data as JournalEntry | null)
    setLoading(false)
  }

  async function loadEntries(uid: string) {
    const { data } = await supabase.from('journal_entries').select('*').eq('user_id', uid).order('date', { ascending: false }).limit(30)
    setPastEntries((data ?? []) as JournalEntry[])
  }

  const today = new Date().toISOString().split('T')[0]
  const isToday = selectedDate === today

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Ημερολόγιο</h1>
          <p className="text-muted text-sm mt-1">{isToday ? 'Σήμερα' : new Date(selectedDate).toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={e => setSelectedDate(e.target.value)}
          className="bg-bg-elevated border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal"
        />
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-bg-elevated rounded-xl" />)}
        </div>
      ) : (
        <JournalEntryForm
          userId={userId}
          date={selectedDate}
          existing={entry}
          onSaved={saved => {
            setEntry(saved)
            setPastEntries(p => {
              const exists = p.find(e => e.id === saved.id)
              if (exists) return p.map(e => e.id === saved.id ? saved : e)
              return [saved, ...p]
            })
          }}
        />
      )}

      {pastEntries.length > 0 && (
        <section className="border-t border-white/5 pt-6">
          <h2 className="text-sm font-medium text-muted mb-4">Ιστορικό</h2>
          <div className="space-y-2">
            {pastEntries.map(e => {
              const mood = e.mood ? MOOD_LABELS[e.mood as keyof typeof MOOD_LABELS] : null
              return (
                <button
                  key={e.id}
                  onClick={() => setSelectedDate(e.date)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition ${selectedDate === e.date ? 'border-teal/30 bg-teal/5' : 'border-white/5 bg-bg-elevated hover:border-white/10'}`}
                >
                  <span className="text-lg">{mood?.emoji ?? '📔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{new Date(e.date).toLocaleDateString('el-GR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    {e.content && <p className="text-xs text-muted truncate">{e.content}</p>}
                  </div>
                  {mood && <span className="text-xs text-muted">{mood.label}</span>}
                </button>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

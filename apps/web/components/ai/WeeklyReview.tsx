'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface WeeklyReviewProps {
  initialReview?: string
  weekStart?: string
  completedTasks?: number
  moodAverage?: number | null
}

function getWeekStart() {
  const d = new Date()
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.toISOString().split('T')[0]
}

export default function WeeklyReview({ initialReview, weekStart, completedTasks, moodAverage }: WeeklyReviewProps) {
  const [review, setReview]       = useState(initialReview ?? '')
  const [editing, setEditing]     = useState(false)
  const [draft, setDraft]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState('')
  const supabase = createClient()

  async function generate() {
    if (!navigator.onLine) { setError('Χρειάζεται σύνδεση'); return }
    setLoading(true); setError(''); setEditing(false)
    try {
      const res  = await fetch('/api/ai/weekly-review')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReview(data.data)
      setDraft(data.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Κάτι πήγε στραβά')
    } finally {
      setLoading(false)
    }
  }

  function startEdit() {
    setDraft(review)
    setEditing(true)
  }

  async function saveReview() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const ws = weekStart ?? getWeekStart()
    await supabase.from('weekly_reviews').upsert(
      {
        user_id:         user.id,
        week_start:      ws,
        reflection:      draft,
        completed_tasks: completedTasks ?? 0,
        mood_average:    moodAverage ?? null,
      },
      { onConflict: 'user_id,week_start' }
    )

    setReview(draft)
    setEditing(false)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="bg-bg-elevated rounded-2xl border border-teal/20 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal" />
          <span className="text-teal text-sm font-medium">✦ Kleo</span>
          <span className="text-xs text-muted">Weekly Review</span>
        </div>
        <div className="flex items-center gap-2">
          {review && !editing && (
            <button onClick={startEdit} className="text-xs text-muted hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5">
              ✎ Επεξεργασία
            </button>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="text-xs bg-teal/10 hover:bg-teal/20 text-teal px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Φορτώνει...' : review ? '↺ Ανανέωση' : '✦ Δημιουργία AI'}
          </button>
        </div>
      </div>

      {error && <p className="text-coral text-sm">{error}</p>}

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-3 bg-white/10 rounded" style={{ width: `${[80,100,65,90][i-1]}%` }} />)}
        </div>
      )}

      {!loading && !review && (
        <p className="text-sm text-muted leading-relaxed">
          Πάτα «Δημιουργία AI» για την εβδομαδιαία ανασκόπησή σου από τον Kleo — βάσει των tasks, διάθεσης και στόχων σου.
        </p>
      )}

      {!loading && review && !editing && (
        <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{review}</p>
      )}

      {editing && (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={8}
            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal resize-none leading-relaxed"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <button onClick={() => setEditing(false)} className="text-xs text-muted hover:text-white transition">Άκυρο</button>
            <button
              onClick={saveReview}
              disabled={saving}
              className="text-xs bg-teal text-white px-4 py-2 rounded-lg hover:bg-teal/80 transition disabled:opacity-50 ml-auto"
            >
              {saving ? 'Αποθήκευση...' : '✓ Αποθήκευση'}
            </button>
          </div>
        </div>
      )}

      {saved && (
        <p className="text-xs text-teal flex items-center gap-1">
          <span>✓</span> Αποθηκεύτηκε
        </p>
      )}
    </div>
  )
}

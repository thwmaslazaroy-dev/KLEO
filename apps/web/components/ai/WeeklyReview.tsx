'use client'

import { useState } from 'react'

interface WeeklyReviewProps {
  initialReview?: string
}

export default function WeeklyReview({ initialReview }: WeeklyReviewProps) {
  const [review, setReview] = useState(initialReview ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/ai/weekly-review')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReview(data.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Κάτι πήγε στραβά')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-bg-elevated rounded-2xl border border-teal/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-teal text-sm font-medium">✦ Kleo</span>
          <span className="text-xs text-muted">Weekly Review</span>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="text-xs bg-teal/10 hover:bg-teal/20 text-teal px-3 py-1.5 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Φορτώνει...' : review ? '↺ Ανανέωση' : '✦ Δημιουργία'}
        </button>
      </div>

      {error && <p className="text-coral text-sm mb-3">{error}</p>}

      {review ? (
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{review}</p>
      ) : (
        <p className="text-sm text-muted">
          Πάτα «Δημιουργία» για να δεις την εβδομαδιαία ανασκόπησή σου από τον Kleo.
        </p>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'

interface PriorityItem {
  title: string
  reason: string
  index: number
}

function parsePriorities(text: string): PriorityItem[] {
  const lines = text.split('\n').filter(l => /^\d\./.test(l.trim()))
  return lines.slice(0, 3).map((line, i) => {
    const clean = line.replace(/^\d\.\s*/, '').trim()
    const [title, ...rest] = clean.split(' — ')
    return { index: i + 1, title: title?.trim() ?? clean, reason: rest.join(' — ').trim() }
  })
}

export default function AIPrioritize() {
  const [items, setItems] = useState<PriorityItem[]>([])
  const [raw, setRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  async function fetch_() {
    if (!navigator.onLine) { setError('Χρειάζεται σύνδεση'); return }
    setLoading(true); setError(''); setOpen(true)
    try {
      const res  = await fetch('/api/ai/prioritize')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const text = data.data ?? ''
      setRaw(text)
      const parsed = parsePriorities(text)
      setItems(parsed.length ? parsed : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Κάτι πήγε στραβά')
    } finally {
      setLoading(false)
    }
  }

  const RANK_COLORS = ['#E8523A', '#f59e0b', '#2BB8B8']
  const RANK_LABELS = ['1ο', '2ο', '3ο']

  return (
    <div>
      <button
        onClick={fetch_}
        disabled={loading}
        className="flex items-center gap-2 text-sm bg-teal/10 hover:bg-teal/20 text-teal border border-teal/20 px-4 py-2.5 rounded-xl transition disabled:opacity-50 font-medium"
      >
        <span>{loading ? '⏳' : '✦'}</span>
        {loading ? 'Σκέφτεται...' : 'Τι κάνω πρώτα;'}
      </button>

      {open && (
        <div className="mt-3 space-y-2 animate-fade-in">
          {error ? (
            <p className="text-sm text-coral bg-coral/10 rounded-xl px-4 py-3">{error}</p>
          ) : loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="bg-bg-elevated rounded-xl p-3 border border-white/5 animate-pulse">
                  <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : items.length ? (
            <>
              {items.map((item, i) => (
                <div key={i} className="flex gap-3 bg-bg-elevated rounded-xl p-3 border border-white/5 hover:border-white/10 transition">
                  <span
                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ backgroundColor: `${RANK_COLORS[i]}25`, color: RANK_COLORS[i] }}
                  >
                    {RANK_LABELS[i]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white leading-snug">{item.title}</p>
                    {item.reason && <p className="text-xs text-muted mt-1 leading-relaxed">{item.reason}</p>}
                  </div>
                </div>
              ))}
              <button onClick={() => setOpen(false)} className="text-xs text-muted hover:text-white transition w-full text-center py-1">
                Κλείσιμο
              </button>
            </>
          ) : (
            <div className="bg-bg-elevated rounded-xl p-4 border border-white/5">
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{raw}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

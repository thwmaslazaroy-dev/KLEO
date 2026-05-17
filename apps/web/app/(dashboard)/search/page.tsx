'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { CATEGORIES, PRIORITY_COLORS, MOOD_LABELS } from '@kleo/shared'

interface SearchResults {
  tasks:    Array<{ id: string; title: string; category: string; status: string; priority: string; due_date: string | null }>
  notes:    Array<{ id: string; title: string | null; content: string; category: string; updated_at: string }>
  thoughts: Array<{ id: string; content: string; category: string; created_at: string }>
  journal:  Array<{ id: string; date: string; content: string | null; mood: number | null }>
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q || !text) return text
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase()
      ? <mark key={i} className="bg-teal/30 text-teal rounded px-0.5">{p}</mark>
      : p
  )
}

export default function SearchPage() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.data)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(val: string) {
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const total = results ? results.tasks.length + results.notes.length + results.thoughts.length + results.journal.length : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-heading font-bold">Αναζήτηση</h1>

      {/* Search input */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
        <input
          autoFocus
          value={query}
          onChange={e => handleChange(e.target.value)}
          placeholder="Αναζήτηση σε tasks, σημειώσεις, σκέψεις..."
          className="w-full bg-bg-elevated border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-white placeholder:text-muted focus:outline-none focus:border-teal transition text-sm"
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-xs animate-pulse">...</span>
        )}
      </div>

      {/* Results count */}
      {results && query.length >= 2 && (
        <p className="text-xs text-muted">
          {total === 0 ? 'Δεν βρέθηκαν αποτελέσματα.' : `${total} αποτέλεσμα${total !== 1 ? 'τα' : ''}`}
        </p>
      )}

      {results && total > 0 && (
        <div className="space-y-6">
          {/* Tasks */}
          {results.tasks.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                ✅ Tasks <span className="bg-white/10 px-1.5 py-0.5 rounded-full">{results.tasks.length}</span>
              </h2>
              <div className="space-y-2">
                {results.tasks.map(t => {
                  const cat = CATEGORIES[t.category as keyof typeof CATEGORIES]
                  return (
                    <Link href="/tasks" key={t.id} className="flex items-center gap-3 bg-bg-elevated rounded-xl px-4 py-3 border border-white/5 hover:border-white/10 transition group">
                      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${t.status === 'done' ? 'bg-teal border-teal' : 'border-white/30'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-muted' : 'text-white'}`}>
                          {highlight(t.title, query)}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {cat && <span className="text-xs" style={{ color: cat.color }}>{cat.emoji} {cat.label}</span>}
                          <span className="text-xs" style={{ color: PRIORITY_COLORS[t.priority as keyof typeof PRIORITY_COLORS] }}>
                            {t.priority}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Notes */}
          {results.notes.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                📝 Σημειώσεις <span className="bg-white/10 px-1.5 py-0.5 rounded-full">{results.notes.length}</span>
              </h2>
              <div className="space-y-2">
                {results.notes.map(n => {
                  const cat = CATEGORIES[n.category as keyof typeof CATEGORIES]
                  return (
                    <Link href="/notes" key={n.id} className="block bg-bg-elevated rounded-xl px-4 py-3 border border-white/5 hover:border-white/10 transition">
                      <p className="text-sm font-medium text-white mb-1">{n.title ? highlight(n.title, query) : 'Χωρίς τίτλο'}</p>
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">{highlight(n.content.slice(0, 120), query)}</p>
                      <div className="flex gap-2 mt-2">
                        {cat && <span className="text-xs" style={{ color: cat.color }}>{cat.emoji} {cat.label}</span>}
                        <span className="text-xs text-muted ml-auto">{new Date(n.updated_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Thoughts */}
          {results.thoughts.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                💭 Σκέψεις <span className="bg-white/10 px-1.5 py-0.5 rounded-full">{results.thoughts.length}</span>
              </h2>
              <div className="space-y-2">
                {results.thoughts.map(t => {
                  const cat = CATEGORIES[t.category as keyof typeof CATEGORIES]
                  return (
                    <Link href="/thoughts" key={t.id} className="flex gap-3 bg-bg-elevated rounded-xl px-4 py-3 border border-white/5 hover:border-white/10 transition">
                      <div className="w-1 rounded-full bg-teal/50 flex-shrink-0 self-stretch" />
                      <div>
                        <p className="text-sm text-white/85">{highlight(t.content, query)}</p>
                        <div className="flex gap-2 mt-1.5">
                          {cat && <span className="text-xs" style={{ color: cat.color }}>{cat.emoji} {cat.label}</span>}
                          <span className="text-xs text-muted">{new Date(t.created_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Journal */}
          {results.journal.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                📔 Ημερολόγιο <span className="bg-white/10 px-1.5 py-0.5 rounded-full">{results.journal.length}</span>
              </h2>
              <div className="space-y-2">
                {results.journal.map(j => {
                  const mood = j.mood ? MOOD_LABELS[j.mood as keyof typeof MOOD_LABELS] : null
                  return (
                    <Link href="/journal" key={j.id} className="block bg-bg-elevated rounded-xl px-4 py-3 border border-white/5 hover:border-white/10 transition">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{mood?.emoji ?? '📔'}</span>
                        <span className="text-xs font-medium text-white">{new Date(j.date).toLocaleDateString('el-GR', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
                      </div>
                      {j.content && <p className="text-xs text-muted line-clamp-2">{highlight(j.content.slice(0, 120), query)}</p>}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-muted text-sm">Αναζήτηση σε tasks, σημειώσεις, σκέψεις και ημερολόγιο.</p>
        </div>
      )}
    </div>
  )
}

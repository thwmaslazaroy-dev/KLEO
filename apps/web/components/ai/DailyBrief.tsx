'use client'

import { useEffect, useState, useCallback } from 'react'

const CACHE_KEY = 'kleo_daily_brief'
const CACHE_DATE_KEY = 'kleo_daily_brief_date'

export default function DailyBrief() {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setOffline(!navigator.onLine)
    const on  = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const fetchBrief = useCallback(async (force = false) => {
    if (!navigator.onLine) { setOffline(true); return }

    // Use cached brief if same day and not forced
    const cachedDate  = localStorage.getItem(CACHE_DATE_KEY)
    const cachedBrief = localStorage.getItem(CACHE_KEY)
    const today = new Date().toDateString()
    if (!force && cachedBrief && cachedDate === today) {
      setBrief(cachedBrief); return
    }

    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/ai/daily-brief')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const text = data.data ?? ''
      setBrief(text)
      localStorage.setItem(CACHE_KEY, text)
      localStorage.setItem(CACHE_DATE_KEY, today)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Κάτι πήγε στραβά')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBrief() }, [fetchBrief])

  if (offline) {
    return (
      <div className="flex items-center gap-3 bg-bg-elevated rounded-2xl px-4 py-3 border border-white/5">
        <span className="text-lg">📵</span>
        <p className="text-sm text-muted">Χρειάζεται σύνδεση για το daily brief.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-bg-elevated rounded-2xl p-4 border border-teal/10 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-16 h-3 bg-teal/20 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded w-11/12" />
          <div className="h-3 bg-white/10 rounded w-full" />
          <div className="h-3 bg-white/10 rounded w-4/5" />
          <div className="h-3 bg-white/10 rounded w-9/12" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-between bg-bg-elevated rounded-2xl px-4 py-3 border border-coral/20">
        <p className="text-sm text-muted">{error}</p>
        <button onClick={() => fetchBrief(true)} className="text-xs text-coral hover:text-coral-light ml-3 flex-shrink-0">↺ Retry</button>
      </div>
    )
  }

  if (!brief) return null

  return (
    <div className="bg-bg-elevated rounded-2xl p-4 border border-teal/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
          <span className="text-teal text-xs font-medium">✦ Kleo</span>
        </div>
        <button
          onClick={() => fetchBrief(true)}
          disabled={loading}
          className="text-xs text-muted hover:text-white transition flex items-center gap-1"
          title="Ανανέωση"
        >
          ↺ <span className="hidden sm:inline">Ανανέωση</span>
        </button>
      </div>
      <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{brief}</p>
    </div>
  )
}

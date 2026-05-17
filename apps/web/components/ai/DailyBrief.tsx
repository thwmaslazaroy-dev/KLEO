'use client'

import { useEffect, useState } from 'react'

interface DailyBriefProps {
  userId: string
}

export default function DailyBrief({ userId: _userId }: DailyBriefProps) {
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/ai/daily-brief')
      .then((r) => r.json())
      .then((d) => setBrief(d.data ?? ''))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-bg-elevated rounded-2xl p-4 border border-white/5 animate-pulse">
        <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
        <div className="h-3 bg-white/10 rounded w-full mb-2" />
        <div className="h-3 bg-white/10 rounded w-2/3" />
      </div>
    )
  }

  if (error || !brief) return null

  return (
    <div className="bg-bg-elevated rounded-2xl p-4 border border-teal/20">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-teal text-xs font-medium">✦ Kleo</span>
      </div>
      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{brief}</p>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, formatTimeGr } from '@kleo/shared'
import Badge from '@/components/ui/Badge'
import type { Event } from '@kleo/shared'

interface EventCardProps {
  event: Event
  onDelete?: (id: string) => void
}

export default function EventCard({ event, onDelete }: EventCardProps) {
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const cat = CATEGORIES[event.category as keyof typeof CATEGORIES]

  async function archive() {
    setDeleting(true)
    await supabase.from('events').update({ archived: true }).eq('id', event.id)
    onDelete?.(event.id)
  }

  const start = new Date(event.start_at)
  const end = event.end_at ? new Date(event.end_at) : null

  return (
    <div className="flex gap-3 bg-bg-elevated rounded-xl px-4 py-3 border border-white/5 group hover:border-white/10 transition">
      <div className="flex-shrink-0 w-1 rounded-full bg-teal self-stretch" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-white leading-snug">{event.title}</p>
          <button
            onClick={archive}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 text-muted hover:text-white text-xs transition flex-shrink-0"
          >
            ×
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-xs text-muted">
            {formatTimeGr(event.start_at)}
            {end && ` – ${formatTimeGr(event.end_at!)}`}
          </span>
          <Badge color={cat?.color}>{cat?.emoji} {cat?.label}</Badge>
          {event.location && (
            <span className="text-xs text-muted">📍 {event.location}</span>
          )}
        </div>
        {event.description && (
          <p className="text-xs text-muted mt-1 line-clamp-1">{event.description}</p>
        )}
      </div>
    </div>
  )
}

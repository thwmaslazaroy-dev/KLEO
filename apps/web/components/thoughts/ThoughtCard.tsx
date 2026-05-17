'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, formatRelativeGr } from '@kleo/shared'
import Badge from '@/components/ui/Badge'
import type { Thought } from '@kleo/shared'

interface ThoughtCardProps {
  thought: Thought
  onDelete?: (id: string) => void
}

export default function ThoughtCard({ thought, onDelete }: ThoughtCardProps) {
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()
  const cat = CATEGORIES[thought.category as keyof typeof CATEGORIES]

  async function archive() {
    setDeleting(true)
    await supabase.from('thoughts').update({ archived: true }).eq('id', thought.id)
    onDelete?.(thought.id)
  }

  return (
    <div className="flex gap-3 group animate-fade-in">
      <div className="flex flex-col items-center pt-1">
        <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0" />
        <div className="w-px flex-1 bg-white/5 mt-1" />
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-white/85 leading-relaxed">{thought.content}</p>
          <button
            onClick={archive}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 text-muted hover:text-coral transition text-xs flex-shrink-0 mt-0.5"
          >
            ×
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge color={cat?.color}>{cat?.emoji} {cat?.label}</Badge>
          <span className="text-xs text-muted">{formatRelativeGr(thought.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

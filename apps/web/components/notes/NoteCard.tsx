'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import Badge from '@/components/ui/Badge'
import type { Note } from '@kleo/shared'

interface NoteCardProps {
  note: Note
  onClick?: () => void
  onDelete?: (id: string) => void
  onPin?: (id: string, pinned: boolean) => void
}

export default function NoteCard({ note, onClick, onDelete, onPin }: NoteCardProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const cat = CATEGORIES[note.category as keyof typeof CATEGORIES]

  async function togglePin(e: React.MouseEvent) {
    e.stopPropagation()
    setLoading(true)
    await supabase.from('notes').update({ pinned: !note.pinned }).eq('id', note.id)
    onPin?.(note.id, !note.pinned)
    setLoading(false)
  }

  async function archive(e: React.MouseEvent) {
    e.stopPropagation()
    await supabase.from('notes').update({ archived: true }).eq('id', note.id)
    onDelete?.(note.id)
  }

  return (
    <div
      onClick={onClick}
      className={`bg-bg-elevated rounded-xl p-4 border transition group cursor-pointer ${note.pinned ? 'border-teal/30' : 'border-white/5 hover:border-white/10'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.pinned && <span className="text-teal text-xs">📌</span>}
          <h3 className="text-sm font-medium text-white truncate">{note.title || 'Χωρίς τίτλο'}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
          <button onClick={togglePin} disabled={loading} className="text-muted hover:text-teal transition text-xs p-1" title={note.pinned ? 'Ξεκαρφίτσωσε' : 'Καρφίτσωσε'}>
            {note.pinned ? '📌' : '📍'}
          </button>
          <button onClick={archive} className="text-muted hover:text-coral transition text-xs p-1">×</button>
        </div>
      </div>
      <p className="text-xs text-muted leading-relaxed line-clamp-3">{note.content}</p>
      <div className="flex items-center gap-2 mt-3">
        <Badge color={cat?.color}>{cat?.emoji} {cat?.label}</Badge>
        {note.tags?.map(t => <Badge key={t} variant="muted">#{t}</Badge>)}
        <span className="text-xs text-muted ml-auto">
          {new Date(note.updated_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}
        </span>
      </div>
    </div>
  )
}

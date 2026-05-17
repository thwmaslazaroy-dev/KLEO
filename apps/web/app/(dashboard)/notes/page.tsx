'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import NoteCard from '@/components/notes/NoteCard'
import NoteEditor from '@/components/notes/NoteEditor'
import Button from '@/components/ui/Button'
import type { Note } from '@kleo/shared'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [userId, setUserId] = useState('')
  const [search, setSearch] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase.from('notes').select('*').eq('user_id', user.id).eq('archived', false).order('pinned', { ascending: false }).order('updated_at', { ascending: false })
    setNotes((data ?? []) as Note[])
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() { setEditingNote(null); setEditorOpen(true) }
  function openEdit(note: Note) { setEditingNote(note); setEditorOpen(true) }

  function handleSaved(note: Note) {
    setNotes(prev => {
      const exists = prev.find(n => n.id === note.id)
      if (exists) return prev.map(n => n.id === note.id ? note : n)
      return [note, ...prev]
    })
  }

  const filtered = notes.filter(n =>
    !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
  )
  const pinned = filtered.filter(n => n.pinned)
  const rest = filtered.filter(n => !n.pinned)

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Σημειώσεις</h1>
        <Button onClick={openNew} size="sm">+ Νέα σημείωση</Button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Αναζήτηση..."
        className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal text-sm transition"
      />

      {pinned.length > 0 && (
        <section>
          <h2 className="text-xs font-medium text-muted mb-3 uppercase tracking-wider">Καρφιτσωμένες</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pinned.map(n => (
              <NoteCard key={n.id} note={n} onClick={() => openEdit(n)}
                onDelete={id => setNotes(p => p.filter(x => x.id !== id))}
                onPin={(id, pinned) => setNotes(p => p.map(x => x.id === id ? { ...x, pinned } : x))} />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          {pinned.length > 0 && <h2 className="text-xs font-medium text-muted mb-3 uppercase tracking-wider">Όλες</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rest.map(n => (
              <NoteCard key={n.id} note={n} onClick={() => openEdit(n)}
                onDelete={id => setNotes(p => p.filter(x => x.id !== id))}
                onPin={(id, pinned) => setNotes(p => p.map(x => x.id === id ? { ...x, pinned } : x))} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-muted text-sm">{search ? 'Δεν βρέθηκαν σημειώσεις.' : 'Δεν έχεις σημειώσεις ακόμα.'}</p>
        </div>
      )}

      <NoteEditor userId={userId} note={editingNote} open={editorOpen} onClose={() => setEditorOpen(false)} onSaved={handleSaved} />
    </div>
  )
}

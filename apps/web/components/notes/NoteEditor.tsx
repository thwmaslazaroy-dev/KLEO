'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Note, Category } from '@kleo/shared'

interface NoteEditorProps {
  userId: string
  note?: Note | null
  open: boolean
  onClose: () => void
  onSaved: (note: Note) => void
}

export default function NoteEditor({ userId, note, open, onClose, onSaved }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (note) {
      setTitle(note.title ?? '')
      setContent(note.content)
      setCategory(note.category as Category)
      setTags(note.tags?.join(', ') ?? '')
    } else {
      setTitle(''); setContent(''); setCategory('misc'); setTags('')
    }
  }, [note, open])

  const [error, setError] = useState('')

  async function handleSave() {
    if (!content.trim()) return
    setLoading(true)
    setError('')
    const payload = {
      title: title.trim() || null,
      content: content.trim(),
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    }
    try {
      if (note) {
        const { data, error } = await supabase.from('notes').update(payload).eq('id', note.id).select().single()
        if (error) throw error
        if (!data) throw new Error('Δεν επιστράφηκαν δεδομένα')
        onSaved(data as Note)
      } else {
        const { data, error } = await supabase.from('notes').insert({ user_id: userId, ...payload }).select().single()
        if (error) throw error
        if (!data) throw new Error('Δεν επιστράφηκαν δεδομένα')
        onSaved(data as Note)
      }
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Κάτι πήγε στραβά'
      console.error('[note save]:', msg)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={note ? 'Επεξεργασία σημείωσης' : 'Νέα σημείωση'} size="lg">
      <div className="space-y-4">
        <Input label="Τίτλος (προαιρετικό)" value={title} onChange={e => setTitle(e.target.value)} placeholder="Τίτλος..." />
        <div>
          <label className="block text-sm text-muted mb-1">Περιεχόμενο</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={8}
            autoFocus={!note}
            placeholder="Γράψε κάτι..."
            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal resize-none text-sm leading-relaxed"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-muted mb-1">Κατηγορία</label>
            <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal">
              {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          <Input label="Tags (κόμμα)" value={tags} onChange={e => setTags(e.target.value)} placeholder="ιδέα, δουλειά..." />
        </div>
        {error && (
          <p className="text-sm text-coral bg-coral/10 rounded-xl px-4 py-2.5">✕ {error}</p>
        )}
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>Άκυρο</Button>
          <Button className="flex-1" onClick={handleSave} disabled={loading || !content.trim()}>{loading ? 'Αποθήκευση...' : 'Αποθήκευση'}</Button>
        </div>
      </div>
    </Modal>
  )
}

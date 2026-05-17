'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Category } from '@kleo/shared'

interface EventFormProps {
  userId: string
  onCreated?: () => void
}

export default function EventForm({ userId, onCreated }: EventFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startAt) return
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.from('events').insert({
        user_id: userId,
        title: title.trim(),
        category,
        start_at: startAt,
        end_at: endAt || null,
        location: location.trim() || null,
        description: description.trim() || null,
      })
      if (error) throw error
      setTitle(''); setStartAt(''); setEndAt(''); setLocation(''); setDescription('')
      setOpen(false)
      onCreated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">+ Νέο Event</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Νέο Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Τίτλος" value={title} onChange={e => setTitle(e.target.value)} placeholder="Τι έχεις;" required autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Έναρξη" type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} required />
            <Input label="Λήξη (προαιρετικό)" type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1">Κατηγορία</label>
            <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal">
              {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.emoji} {c.label}</option>)}
            </select>
          </div>
          <Input label="Τοποθεσία (προαιρετικό)" value={location} onChange={e => setLocation(e.target.value)} placeholder="Πού;" />
          <div>
            <label className="block text-sm text-muted mb-1">Περιγραφή (προαιρετικό)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal resize-none text-sm" />
          </div>
          {error && <p className="text-coral text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Άκυρο</Button>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Αποθήκευση...' : 'Αποθήκευση'}</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

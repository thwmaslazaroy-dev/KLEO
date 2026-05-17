'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { Category, Priority } from '@kleo/shared'

interface TaskFormProps {
  userId: string
  onCreated?: () => void
}

export default function TaskForm({ userId, onCreated }: TaskFormProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.from('tasks').insert({
        user_id: userId,
        title: title.trim(),
        category,
        priority,
        due_date: dueDate || null,
        original_due_date: dueDate || null,
      })
      if (error) throw error

      setTitle('')
      setDueDate('')
      setCategory('misc')
      setPriority('medium')
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
      <Button onClick={() => setOpen(true)} size="sm">
        + Νέο Task
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Νέο Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Τίτλος"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Τι πρέπει να κάνεις;"
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1">Κατηγορία</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal"
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted mb-1">Προτεραιότητα</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal"
              >
                <option value="urgent">Επείγον</option>
                <option value="high">Υψηλή</option>
                <option value="medium">Μέτρια</option>
                <option value="low">Χαμηλή</option>
              </select>
            </div>
          </div>

          <Input
            label="Προθεσμία (προαιρετικό)"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {error && (
            <p className="text-coral text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Άκυρο
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

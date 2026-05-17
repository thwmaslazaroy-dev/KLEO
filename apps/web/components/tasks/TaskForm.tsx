'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'   // still used for title field
import DateTimePicker from '@/components/ui/DateTimePicker'
import type { Category, Priority } from '@kleo/shared'

interface TaskFormProps {
  userId: string
  onCreated?: () => void
}

export default function TaskForm({ userId, onCreated }: TaskFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [reminderAt, setReminderAt] = useState('')
  const [reminderManual, setReminderManual] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  function handleDueDateChange(value: string) {
    setDueDate(value)
    // Auto-set reminder to due_date + 1h unless user has manually changed it
    if (!reminderManual && value) {
      const d = new Date(value)
      d.setHours(d.getHours() + 1)
      const pad = (n: number) => String(n).padStart(2, '0')
      const auto = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      setReminderAt(auto)
    }
    if (!value) {
      setReminderAt('')
      setReminderManual(false)
    }
  }

  function handleReminderChange(value: string) {
    setReminderAt(value)
    setReminderManual(true)
  }

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
        reminder_at: reminderAt || null,
      })
      if (error) throw error

      setTitle('')
      setDueDate('')
      setReminderAt('')
      setReminderManual(false)
      setCategory('misc')
      setPriority('medium')
      setOpen(false)
      onCreated?.()
      router.refresh()   // refresh Server Component data
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

          <DateTimePicker
            label="Προθεσμία (προαιρετικό)"
            value={dueDate}
            onChange={handleDueDateChange}
            placeholder="Επέλεξε ημερομηνία"
          />

          {dueDate && (
            <DateTimePicker
              label={
                reminderManual
                  ? 'Υπενθύμιση'
                  : 'Υπενθύμιση (αυτόματα +1ώρα — άλλαξέ τη αν θέλεις)'
              }
              value={reminderAt}
              onChange={handleReminderChange}
            />
          )}

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

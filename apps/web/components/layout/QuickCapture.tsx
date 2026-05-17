'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { CATEGORIES } from '@kleo/shared'
import type { Category } from '@kleo/shared'

type CaptureType = 'task' | 'thought' | 'note'

interface QuickCaptureProps {
  userId: string
}

export default function QuickCapture({ userId }: QuickCaptureProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<CaptureType>('task')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSave() {
    if (!content.trim()) return
    setLoading(true)

    try {
      if (type === 'task') {
        await supabase.from('tasks').insert({
          user_id: userId,
          title: content.trim(),
          category,
          priority: 'medium',
        })
      } else if (type === 'thought') {
        await supabase.from('thoughts').insert({
          user_id: userId,
          content: content.trim(),
          category,
        })
      } else {
        await supabase.from('notes').insert({
          user_id: userId,
          content: content.trim(),
          category,
        })
      }

      setContent('')
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const tabs: { key: CaptureType; label: string; icon: string }[] = [
    { key: 'task',    label: 'Task',    icon: '✅' },
    { key: 'thought', label: 'Σκέψη',  icon: '💭' },
    { key: 'note',    label: 'Σημείωση', icon: '📝' },
  ]

  const placeholders: Record<CaptureType, string> = {
    task: 'Τι πρέπει να κάνεις;',
    thought: 'Τι σκέφτεσαι;',
    note: 'Γράψε κάτι...',
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-coral hover:bg-coral-light rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition z-40"
        title="Quick Capture"
      >
        +
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Quick Capture">
        <div className="space-y-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setType(t.key)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
                  type === t.key
                    ? 'bg-coral text-white'
                    : 'bg-bg text-muted hover:text-white'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholders[type]}
            autoFocus
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
            }}
            className="w-full bg-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal resize-none text-sm"
          />

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

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
              Άκυρο
            </Button>
            <Button className="flex-1" onClick={handleSave} disabled={loading || !content.trim()}>
              {loading ? 'Αποθήκευση...' : 'Αποθήκευση ⌘↵'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

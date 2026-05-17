'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MoodPicker from './MoodPicker'
import Button from '@/components/ui/Button'
import { MOOD_LABELS } from '@kleo/shared'
import type { JournalEntry } from '@kleo/shared'

interface JournalEntryFormProps {
  userId: string
  date: string
  existing?: JournalEntry | null
  onSaved: (entry: JournalEntry) => void
}

export default function JournalEntryForm({ userId, date, existing, onSaved }: JournalEntryFormProps) {
  const [content, setContent] = useState(existing?.content ?? '')
  const [mood, setMood] = useState<number | undefined>(existing?.mood)
  const [highlights, setHighlights] = useState(existing?.highlights?.join('\n') ?? '')
  const [tomorrowFocus, setTomorrowFocus] = useState(existing?.tomorrow_focus ?? '')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSave() {
    setLoading(true)
    const payload = {
      user_id: userId,
      date,
      content: content.trim() || null,
      mood: mood ?? null,
      highlights: highlights.split('\n').map(h => h.trim()).filter(Boolean),
      tomorrow_focus: tomorrowFocus.trim() || null,
    }
    try {
      if (existing) {
        const { data } = await supabase.from('journal_entries').update(payload).eq('id', existing.id).select().single()
        onSaved(data as JournalEntry)
      } else {
        const { data } = await supabase.from('journal_entries').insert(payload).select().single()
        onSaved(data as JournalEntry)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <MoodPicker value={mood} onChange={setMood} />

      <div>
        <label className="block text-sm text-muted mb-2">Πώς πήγε η μέρα;</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={5}
          placeholder="Γράψε ό,τι θέλεις — χωρίς φίλτρο."
          className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal resize-none text-sm leading-relaxed"
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-2">Highlights (1 ανά γραμμή)</label>
        <textarea
          value={highlights}
          onChange={e => setHighlights(e.target.value)}
          rows={3}
          placeholder="Τι πήγε καλά σήμερα..."
          className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal resize-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-2">Focus για αύριο</label>
        <input
          type="text"
          value={tomorrowFocus}
          onChange={e => setTomorrowFocus(e.target.value)}
          placeholder="Το πιο σημαντικό πράγμα για αύριο..."
          className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal text-sm"
        />
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Αποθήκευση...' : 'Αποθήκευση ημερολογίου'}
      </Button>
    </div>
  )
}

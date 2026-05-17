'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import ThoughtCard from './ThoughtCard'
import type { Thought, Category } from '@kleo/shared'

interface ThoughtStreamProps {
  userId: string
  initialThoughts: Thought[]
}

export default function ThoughtStream({ userId, initialThoughts }: ThoughtStreamProps) {
  const [thoughts, setThoughts] = useState(initialThoughts)
  const [input, setInput] = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || saving) return
    setSaving(true)
    const { data } = await supabase
      .from('thoughts')
      .insert({ user_id: userId, content: input.trim(), category })
      .select()
      .single()
    if (data) setThoughts(prev => [data as Thought, ...prev])
    setInput('')
    setSaving(false)
    textareaRef.current?.focus()
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-bg-elevated rounded-2xl p-4 border border-white/5">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent) }}
          placeholder="Τι σκέφτεσαι;"
          rows={2}
          className="w-full bg-transparent text-white placeholder:text-muted focus:outline-none resize-none text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(CATEGORIES) as Category[]).map(k => (
              <button
                key={k}
                type="button"
                onClick={() => setCategory(k)}
                className={`text-xs px-2 py-1 rounded-lg transition ${category === k ? 'bg-coral/20 text-coral' : 'text-muted hover:text-white'}`}
              >
                {CATEGORIES[k].emoji} {CATEGORIES[k].label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={saving || !input.trim()}
            className="text-xs bg-teal/20 hover:bg-teal/30 text-teal px-3 py-1.5 rounded-lg transition disabled:opacity-40"
          >
            {saving ? '...' : 'Αποθήκευση ⌘↵'}
          </button>
        </div>
      </form>

      <div>
        {thoughts.length === 0 ? (
          <p className="text-muted text-sm text-center py-12">Δεν έχεις σκέψεις ακόμα. Γράψε κάτι!</p>
        ) : (
          thoughts.map(t => (
            <ThoughtCard key={t.id} thought={t} onDelete={id => setThoughts(p => p.filter(x => x.id !== id))} />
          ))
        )}
      </div>
    </div>
  )
}

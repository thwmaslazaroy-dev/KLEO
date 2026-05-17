'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORIES, formatDateGr } from '@kleo/shared'
import type { Task, Note, Thought, Goal } from '@kleo/shared'

type Tab = 'tasks' | 'notes' | 'thoughts' | 'goals'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'tasks',    label: 'Tasks',       icon: '✅' },
  { key: 'notes',    label: 'Σημειώσεις', icon: '📝' },
  { key: 'thoughts', label: 'Σκέψεις',    icon: '💭' },
  { key: 'goals',    label: 'Στόχοι',     icon: '🎯' },
]

export default function ArchivePage() {
  const [tab, setTab] = useState<Tab>('tasks')
  const [items, setItems] = useState<(Task | Note | Thought | Goal)[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from(tab)
      .select('*')
      .eq('user_id', user.id)
      .eq('archived', true)
      .order('updated_at' in {} ? 'updated_at' : 'created_at', { ascending: false })

    setItems(data ?? [])
    setLoading(false)
  }, [tab])

  useEffect(() => { load() }, [load])

  async function restore(id: string) {
    await supabase.from(tab).update({ archived: false }).eq('id', id)
    setItems(p => p.filter(x => x.id !== id))
  }

  async function deletePermanently(id: string) {
    await supabase.from(tab).delete().eq('id', id)
    setItems(p => p.filter(x => x.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Αρχείο</h1>
        <p className="text-muted text-sm mt-1">Αρχειοθετημένα στοιχεία — μπορείς να τα επαναφέρεις.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-bg-elevated rounded-xl p-1 border border-white/5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${
              tab === t.key ? 'bg-bg text-white shadow-sm' : 'text-muted hover:text-white'
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-bg-elevated rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🗂️</p>
          <p className="text-muted text-sm">Δεν υπάρχουν αρχειοθετημένα στοιχεία.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <ArchiveRow key={item.id} item={item} tab={tab} onRestore={restore} onDelete={deletePermanently} />
          ))}
        </div>
      )}
    </div>
  )
}

function ArchiveRow({
  item, tab, onRestore, onDelete,
}: {
  item: Task | Note | Thought | Goal
  tab: Tab
  onRestore: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [confirming, setConfirming] = useState(false)

  const label = (() => {
    if (tab === 'tasks') return (item as Task).title
    if (tab === 'notes') return (item as Note).title || (item as Note).content.slice(0, 60)
    if (tab === 'thoughts') return (item as Thought).content.slice(0, 80)
    return (item as Goal).title
  })()

  const cat = CATEGORIES[(item as Task).category as keyof typeof CATEGORIES]
  const date = ('updated_at' in item ? item.updated_at : item.created_at) as string

  return (
    <div className="flex items-center gap-3 bg-bg-elevated rounded-xl px-4 py-3 border border-white/5 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/70 truncate">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          {cat && <span className="text-xs" style={{ color: cat.color }}>{cat.emoji} {cat.label}</span>}
          <span className="text-xs text-muted">{formatDateGr(date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onRestore(item.id)}
          className="text-xs text-teal hover:bg-teal/10 px-2 py-1 rounded-lg transition"
        >
          ↩ Επαναφορά
        </button>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-muted hover:text-coral transition px-2 py-1 rounded-lg"
          >
            🗑
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={() => onDelete(item.id)} className="text-xs text-coral bg-coral/10 hover:bg-coral/20 px-2 py-1 rounded-lg transition">Διαγραφή</button>
            <button onClick={() => setConfirming(false)} className="text-xs text-muted px-2 py-1">Άκυρο</button>
          </div>
        )}
      </div>
    </div>
  )
}

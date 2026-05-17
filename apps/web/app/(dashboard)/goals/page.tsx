'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import GoalCard from '@/components/goals/GoalCard'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { CATEGORIES } from '@kleo/shared'
import type { Goal, Category } from '@kleo/shared'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [userId, setUserId] = useState('')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [targetDate, setTargetDate] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase
      .from('goals')
      .select('*, goal_steps(*)')
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('created_at', { ascending: false })
    setGoals((data ?? []) as Goal[])
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!title.trim()) return
    setSaving(true)
    const { data } = await supabase.from('goals').insert({
      user_id: userId, title: title.trim(),
      description: description.trim() || null,
      category, target_date: targetDate || null,
    }).select('*, goal_steps(*)').single()
    if (data) setGoals(p => [data as Goal, ...p])
    setTitle(''); setDescription(''); setTargetDate('')
    setOpen(false); setSaving(false)
  }

  const active = goals.filter(g => g.status === 'active')
  const other = goals.filter(g => g.status !== 'active')

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Στόχοι</h1>
        <Button size="sm" onClick={() => setOpen(true)}>+ Νέος στόχος</Button>
      </div>

      {active.length === 0 && other.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-muted text-sm">Δεν έχεις στόχους ακόμα. Ξεκίνα με έναν!</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-muted mb-3 uppercase tracking-wider">Ενεργοί</h2>
              <div className="space-y-3">
                {active.map(g => (
                  <GoalCard key={g.id} goal={g} userId={userId}
                    onDelete={id => setGoals(p => p.filter(x => x.id !== id))}
                    onUpdate={updated => setGoals(p => p.map(x => x.id === updated.id ? updated : x))} />
                ))}
              </div>
            </section>
          )}
          {other.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-muted mb-3 uppercase tracking-wider">Άλλοι</h2>
              <div className="space-y-3">
                {other.map(g => (
                  <GoalCard key={g.id} goal={g} userId={userId}
                    onDelete={id => setGoals(p => p.filter(x => x.id !== id))}
                    onUpdate={updated => setGoals(p => p.map(x => x.id === updated.id ? updated : x))} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Νέος στόχος">
        <div className="space-y-4">
          <Input label="Τίτλος" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ποιος είναι ο στόχος σου;" required autoFocus />
          <div>
            <label className="block text-sm text-muted mb-1">Περιγραφή (προαιρετικό)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal resize-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1">Κατηγορία</label>
              <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal">
                {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
            <Input label="Deadline (προαιρετικό)" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Άκυρο</Button>
            <Button className="flex-1" onClick={handleCreate} disabled={saving || !title.trim()}>{saving ? 'Δημιουργία...' : 'Δημιουργία'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

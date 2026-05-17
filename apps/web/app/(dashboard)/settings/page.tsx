'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import ScheduleForm from '@/components/schedule/ScheduleForm'
import { getCurrentShift } from '@kleo/shared'
import type { WorkSchedule } from '@kleo/shared'

export default function SettingsPage() {
  const [userId, setUserId] = useState('')
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase
      .from('work_schedules')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
    setSchedules((data ?? []) as WorkSchedule[])
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('work_schedules').update({ is_active: !current }).eq('id', id)
    setSchedules(p => p.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  async function deleteSchedule(id: string) {
    await supabase.from('work_schedules').delete().eq('id', id)
    setSchedules(p => p.filter(s => s.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <h1 className="text-2xl font-heading font-bold">Ρυθμίσεις</h1>

      {/* Work schedules */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-medium text-white">Ωράριο εργασίας</h2>
            <p className="text-xs text-muted mt-0.5">Διαχείριση βαρδιών και ωραρίων</p>
          </div>
          {userId && <ScheduleForm userId={userId} onCreated={load} />}
        </div>

        {schedules.length === 0 ? (
          <p className="text-muted text-sm bg-bg-elevated rounded-xl px-4 py-3 border border-white/5">
            Δεν έχεις ωράριο ακόμα. Πρόσθεσε ένα για smart alarms και shift-aware notifications.
          </p>
        ) : (
          <div className="space-y-3">
            {schedules.map(s => {
              const currentShift = getCurrentShift(s)
              return (
                <div key={s.id} className={`bg-bg-elevated rounded-xl p-4 border transition ${s.is_active ? 'border-teal/20' : 'border-white/5 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{s.label ?? 'Ωράριο'}</span>
                        {s.is_active && (
                          <span className="text-xs bg-teal/20 text-teal px-2 py-0.5 rounded-full">Ενεργό</span>
                        )}
                      </div>
                      <p className="text-xs text-muted">
                        {new Date(s.start_date).toLocaleDateString('el-GR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {s.end_date && ` – ${new Date(s.end_date).toLocaleDateString('el-GR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        {' · '}{s.shift_type === 'fixed' ? 'Σταθερό' : `Κυλιόμενο (${s.shifts.length} βάρδιες)`}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {s.shifts.map((sh, i) => (
                          <span key={i} className={`text-xs px-2 py-0.5 rounded-full border ${
                            currentShift?.label === sh.label && s.is_active
                              ? 'border-teal/40 bg-teal/10 text-teal'
                              : 'border-white/10 text-muted'
                          }`}>
                            {sh.label}: {sh.start}–{sh.end}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleActive(s.id, s.is_active)}
                        className={`text-xs px-2 py-1 rounded-lg transition ${s.is_active ? 'text-muted hover:text-white hover:bg-white/5' : 'text-teal hover:bg-teal/10'}`}
                      >
                        {s.is_active ? 'Απενεργ.' : 'Ενεργ.'}
                      </button>
                      <button onClick={() => deleteSchedule(s.id)} className="text-xs text-muted hover:text-coral transition px-2 py-1 rounded-lg">×</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

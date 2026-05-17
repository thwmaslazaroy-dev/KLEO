'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import AlarmCard from '@/components/alarms/AlarmCard'
import AlarmForm from '@/components/alarms/AlarmForm'
import type { Alarm } from '@kleo/shared'

export default function AlarmsPage() {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [userId, setUserId] = useState('')
  const supabase = createClient()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase
      .from('alarms').select('*').eq('user_id', user.id).order('time')
    setAlarms((data ?? []) as Alarm[])
  }, [])

  useEffect(() => { load() }, [load])

  const enabled  = alarms.filter(a => a.enabled)
  const disabled = alarms.filter(a => !a.enabled)

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Ξυπνητήρια</h1>
          <p className="text-muted text-sm mt-1">{enabled.length} ενεργά</p>
        </div>
        {userId && <AlarmForm userId={userId} onCreated={load} />}
      </div>

      {alarms.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⏰</p>
          <p className="text-muted text-sm">Δεν έχεις ξυπνητήρια. Πρόσθεσε ένα!</p>
        </div>
      ) : (
        <>
          {enabled.length > 0 && (
            <section className="space-y-3">
              {enabled.map(a => (
                <AlarmCard key={a.id} alarm={a}
                  onToggle={(id, en) => setAlarms(p => p.map(x => x.id === id ? { ...x, enabled: en } : x))}
                  onDelete={id => setAlarms(p => p.filter(x => x.id !== id))} />
              ))}
            </section>
          )}
          {disabled.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-muted mb-3 uppercase tracking-wider">Ανενεργά</h2>
              <div className="space-y-3">
                {disabled.map(a => (
                  <AlarmCard key={a.id} alarm={a}
                    onToggle={(id, en) => setAlarms(p => p.map(x => x.id === id ? { ...x, enabled: en } : x))}
                    onDelete={id => setAlarms(p => p.filter(x => x.id !== id))} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

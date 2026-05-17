'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface AlarmFormProps {
  userId: string
  onCreated: () => void
}

const DAY_LABELS = ['Δευ', 'Τρι', 'Τετ', 'Πέμ', 'Παρ', 'Σαβ', 'Κυρ']

export default function AlarmForm({ userId, onCreated }: AlarmFormProps) {
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState('07:00')
  const [label, setLabel] = useState('')
  const [days, setDays] = useState<number[]>([])        // empty = every day
  const [smartAlarm, setSmartAlarm] = useState(false)
  const [shiftOffset, setShiftOffset] = useState(30)
  const [snoozeMinutes, setSnoozeMinutes] = useState(9)
  const [vibrate, setVibrate] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  function toggleDay(d: number) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort())
  }

  async function handleSave() {
    setSaving(true)
    await supabase.from('alarms').insert({
      user_id: userId,
      time,
      label: label.trim() || null,
      days_of_week: days.length ? days : null,
      smart_alarm: smartAlarm,
      shift_offset_minutes: smartAlarm ? shiftOffset : 0,
      snooze_minutes: snoozeMinutes,
      vibrate,
      enabled: true,
    })
    setSaving(false)
    setLabel(''); setTime('07:00'); setDays([]); setSmartAlarm(false)
    setOpen(false); onCreated()
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>+ Νέο ξυπνητήρι</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Νέο ξυπνητήρι">
        <div className="space-y-5">
          {/* Time picker */}
          <div className="text-center">
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="text-5xl font-heading font-bold bg-transparent text-white border-none focus:outline-none text-center tabular-nums cursor-pointer"
            />
          </div>

          <Input label="Ετικέτα (προαιρετικό)" value={label} onChange={e => setLabel(e.target.value)} placeholder="π.χ. Ξύπνημα, Φάρμακο..." />

          {/* Days of week */}
          <div>
            <label className="block text-sm text-muted mb-2">Επανάληψη (άδειο = κάθε μέρα)</label>
            <div className="flex gap-2">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i + 1)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${days.includes(i + 1) ? 'bg-teal/20 text-teal border border-teal/30' : 'bg-bg border border-white/10 text-muted hover:text-white'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Smart alarm */}
          <div className="flex items-start gap-3 bg-bg rounded-xl p-3 border border-white/10">
            <button
              onClick={() => setSmartAlarm(!smartAlarm)}
              className={`relative mt-0.5 w-10 h-5 rounded-full transition-colors flex-shrink-0 ${smartAlarm ? 'bg-teal' : 'bg-white/20'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${smartAlarm ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-white">Smart Alarm ⚡</p>
              <p className="text-xs text-muted mt-0.5">Αυτόματη προσαρμογή βάσει βάρδιας</p>
              {smartAlarm && (
                <div className="mt-3 w-full overflow-hidden">
                  <label className="block text-xs text-muted mb-1">Λεπτά πριν τη βάρδια</label>
                  <div className="w-full overflow-hidden">
                    <input
                      type="range" min={0} max={120} step={5} value={shiftOffset}
                      onChange={e => setShiftOffset(Number(e.target.value))}
                      style={{ width: '100%', maxWidth: '100%', display: 'block' }}
                      className="accent-teal"
                    />
                  </div>
                  <p className="text-xs text-teal mt-1">{shiftOffset} λεπτά πριν</p>
                </div>
              )}
            </div>
          </div>

          {/* Snooze + vibrate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-muted mb-1">Snooze (λεπτά)</label>
              <select value={snoozeMinutes} onChange={e => setSnoozeMinutes(Number(e.target.value))}
                className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-teal">
                {[5, 9, 10, 15, 20].map(m => <option key={m} value={m}>{m} λεπτά</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Δόνηση</label>
              <button onClick={() => setVibrate(!vibrate)}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition border ${vibrate ? 'border-teal/30 bg-teal/10 text-teal' : 'border-white/10 text-muted'}`}>
                {vibrate ? '📳 Ενεργή' : '🔇 Ανενεργή'}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Άκυρο</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>{saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

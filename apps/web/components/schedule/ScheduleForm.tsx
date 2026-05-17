'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { ShiftType, Shift } from '@kleo/shared'

interface ScheduleFormProps {
  userId: string
  onCreated: () => void
}

const EMPTY_SHIFT: Shift = { label: '', start: '08:00', end: '16:00' }

export default function ScheduleForm({ userId, onCreated }: ScheduleFormProps) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [shiftType, setShiftType] = useState<ShiftType>('fixed')
  const [shifts, setShifts] = useState<Shift[]>([{ ...EMPTY_SHIFT }])
  const [rotationWeeks, setRotationWeeks] = useState(1)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  function updateShift(i: number, field: keyof Shift, value: string) {
    setShifts(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }
  function addShift() { setShifts(prev => [...prev, { ...EMPTY_SHIFT }]) }
  function removeShift(i: number) { setShifts(prev => prev.filter((_, idx) => idx !== i)) }

  async function handleSave() {
    if (!startDate || shifts.some(s => !s.label || !s.start || !s.end)) return
    setSaving(true)
    await supabase.from('work_schedules').insert({
      user_id: userId,
      label: label.trim() || null,
      start_date: startDate,
      end_date: endDate || null,
      shift_type: shiftType,
      shifts,
      rotation_weeks: shiftType === 'rotating' ? rotationWeeks : 1,
      is_active: true,
    })
    setSaving(false)
    setLabel(''); setStartDate(''); setEndDate('')
    setShifts([{ ...EMPTY_SHIFT }]); setShiftType('fixed')
    setOpen(false)
    onCreated()
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>+ Νέο ωράριο</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Νέο ωράριο" size="lg">
        <div className="space-y-4">
          <Input label="Ετικέτα (π.χ. Καλοκαίρι 2025)" value={label} onChange={e => setLabel(e.target.value)} placeholder="Καλοκαίρι 2025" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Από" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            <Input label="Έως (προαιρετικό)" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Τύπος</label>
            <div className="flex gap-2">
              {(['fixed', 'rotating'] as ShiftType[]).map(t => (
                <button key={t} onClick={() => setShiftType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition border ${shiftType === t ? 'border-coral bg-coral/10 text-coral' : 'border-white/10 text-muted hover:text-white'}`}>
                  {t === 'fixed' ? '📅 Σταθερό' : '🔄 Κυλιόμενο'}
                </button>
              ))}
            </div>
          </div>

          {shiftType === 'rotating' && (
            <Input label="Εναλλαγή κάθε (εβδομάδες)" type="number" min={1} max={8}
              value={rotationWeeks} onChange={e => setRotationWeeks(Number(e.target.value))} />
          )}

          <div>
            <label className="block text-sm text-muted mb-2">
              Βάρδιες{shiftType === 'rotating' ? ` (${shifts.length} βάρδιες = ${shifts.length * rotationWeeks}-εβδομαδιαίος κύκλος)` : ''}
            </label>
            <div className="space-y-2">
              {shifts.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={s.label} onChange={e => updateShift(i, 'label', e.target.value)}
                    placeholder="Πρωί" className="flex-1 bg-bg border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal" />
                  <input type="time" value={s.start} onChange={e => updateShift(i, 'start', e.target.value)}
                    className="w-28 bg-bg border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal" />
                  <span className="text-muted text-sm">–</span>
                  <input type="time" value={s.end} onChange={e => updateShift(i, 'end', e.target.value)}
                    className="w-28 bg-bg border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-teal" />
                  {shifts.length > 1 && (
                    <button onClick={() => removeShift(i)} className="text-muted hover:text-coral transition text-sm px-1">×</button>
                  )}
                </div>
              ))}
            </div>
            {shiftType === 'rotating' && (
              <button onClick={addShift} className="mt-2 text-xs text-teal hover:text-teal-light transition">+ Προσθήκη βάρδιας</button>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Άκυρο</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || !startDate}>{saving ? 'Αποθήκευση...' : 'Αποθήκευση'}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Switch, RefreshControl } from 'react-native'
import { supabase } from '@/lib/supabase/client'
import { scheduleAlarm, cancelAlarm } from '@/lib/alarms/scheduler'
import type { Alarm } from '@kleo/shared'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.06)' }
const DAYS = ['Δ','Τ','Τ','Π','Π','Σ','Κ']
const DAYS_FULL = ['Δευ','Τρι','Τετ','Πέμ','Παρ','Σαβ','Κυρ']

export default function AlarmsScreen() {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [userId, setUserId] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [time, setTime] = useState('07:00')
  const [label, setLabel] = useState('')
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [smartAlarm, setSmartAlarm] = useState(false)
  const [shiftOffset, setShiftOffset] = useState(30)
  const [snoozeMinutes, setSnoozeMinutes] = useState(9)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase.from('alarms').select('*').eq('user_id', user.id).order('time')
    setAlarms((data ?? []) as Alarm[])
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleAlarm(alarm: Alarm) {
    const enabled = !alarm.enabled
    await supabase.from('alarms').update({ enabled }).eq('id', alarm.id)
    if (enabled) await scheduleAlarm({ ...alarm, enabled })
    else await cancelAlarm(alarm.id)
    setAlarms(p => p.map(a => a.id === alarm.id ? { ...a, enabled } : a))
  }

  async function deleteAlarm(id: string) {
    await supabase.from('alarms').delete().eq('id', id)
    await cancelAlarm(id)
    setAlarms(p => p.filter(a => a.id !== id))
  }

  async function saveAlarm() {
    if (!time) return
    setSaving(true)
    const payload = {
      user_id: userId, time, label: label.trim() || null,
      days_of_week: selectedDays.length ? selectedDays : null,
      smart_alarm: smartAlarm, shift_offset_minutes: smartAlarm ? shiftOffset : 0,
      snooze_minutes: snoozeMinutes, vibrate: true, enabled: true,
    }
    const { data } = await supabase.from('alarms').insert(payload).select().single()
    if (data) {
      const alarm = data as Alarm
      await scheduleAlarm(alarm)
      setAlarms(p => [...p, alarm])
    }
    setLabel(''); setTime('07:00'); setSelectedDays([]); setSmartAlarm(false)
    setSaving(false); setShowForm(false)
  }

  function toggleDay(d: number) {
    setSelectedDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d].sort())
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} tintColor={C.coral} />}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: C.white }}>Ξυπνητήρια</Text>
            <Text style={{ color: C.muted, fontSize: 13 }}>{alarms.filter(a => a.enabled).length} ενεργά</Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: C.coral, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }} onPress={() => setShowForm(true)}>
            <Text style={{ color: C.white, fontWeight: '600', fontSize: 13 }}>+ Νέο</Text>
          </TouchableOpacity>
        </View>

        {alarms.length === 0 ? (
          <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', marginTop: 40 }}>Δεν έχεις ξυπνητήρια ακόμα.</Text>
        ) : alarms.map(a => {
          const days = a.days_of_week
          const daysLabel = !days?.length ? 'Κάθε μέρα'
            : days.length === 5 && !days.includes(6) && !days.includes(7) ? 'Καθημερινές'
            : days.map(d => DAYS_FULL[d - 1]).join(', ')
          return (
            <View key={a.id} style={[styles.card, !a.enabled && { opacity: 0.5 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={{ fontSize: 32, fontWeight: '700', color: a.enabled ? C.white : C.muted }}>{a.time}</Text>
                    {a.smart_alarm && <Text style={{ fontSize: 11, color: C.teal, backgroundColor: `${C.teal}20`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>Smart ⚡</Text>}
                  </View>
                  {a.label && <Text style={{ color: C.white, fontSize: 14, marginTop: 2 }}>{a.label}</Text>}
                  <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{daysLabel}</Text>
                  {days && days.length > 0 && (
                    <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
                      {DAYS.map((d, i) => (
                        <View key={i} style={[styles.dayDot, days.includes(i + 1) && { backgroundColor: `${C.teal}30`, borderColor: `${C.teal}60` }]}>
                          <Text style={{ fontSize: 9, color: days.includes(i + 1) ? C.teal : C.muted }}>{d}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  <Switch value={a.enabled} onValueChange={() => toggleAlarm(a)} trackColor={{ false: 'rgba(255,255,255,0.2)', true: C.teal }} thumbColor={C.white} />
                  <TouchableOpacity onPress={() => deleteAlarm(a.id)}>
                    <Text style={{ color: C.muted, fontSize: 18 }}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )
        })}
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <ScrollView style={{ backgroundColor: C.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
            contentContainerStyle={{ padding: 24, gap: 16 }}>

            <Text style={{ fontSize: 18, fontWeight: '700', color: C.white }}>Νέο ξυπνητήρι</Text>

            {/* Time input */}
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <TextInput style={{ fontSize: 48, fontWeight: '700', color: C.white, textAlign: 'center' }}
                value={time} onChangeText={setTime} placeholder="07:00" placeholderTextColor={C.muted} keyboardType="numbers-and-punctuation" />
            </View>

            <TextInput style={styles.input} placeholder="Ετικέτα (π.χ. Ξύπνημα)" placeholderTextColor={C.muted} value={label} onChangeText={setLabel} />

            {/* Days */}
            <View>
              <Text style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>Επανάληψη (άδειο = κάθε μέρα)</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {DAYS_FULL.map((d, i) => (
                  <TouchableOpacity key={i} onPress={() => toggleDay(i + 1)}
                    style={[styles.dayBtn, selectedDays.includes(i + 1) && { backgroundColor: `${C.teal}25`, borderColor: `${C.teal}60` }]}>
                    <Text style={[styles.dayBtnText, selectedDays.includes(i + 1) && { color: C.teal }]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Smart alarm */}
            <View style={styles.smartRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.white, fontSize: 14, fontWeight: '600' }}>Smart Alarm ⚡</Text>
                <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Αυτόματη προσαρμογή βάσει βάρδιας</Text>
              </View>
              <Switch value={smartAlarm} onValueChange={setSmartAlarm} trackColor={{ false: 'rgba(255,255,255,0.2)', true: C.teal }} thumbColor={C.white} />
            </View>
            {smartAlarm && (
              <View>
                <Text style={{ color: C.muted, fontSize: 12, marginBottom: 4 }}>{shiftOffset} λεπτά πριν τη βάρδια</Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {[0, 15, 30, 45, 60, 90].map(m => (
                    <TouchableOpacity key={m} onPress={() => setShiftOffset(m)}
                      style={[styles.offsetBtn, shiftOffset === m && { backgroundColor: `${C.teal}25`, borderColor: C.teal }]}>
                      <Text style={[styles.offsetBtnText, shiftOffset === m && { color: C.teal }]}>{m}λ</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Snooze */}
            <View>
              <Text style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>Snooze</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[5, 9, 10, 15, 20].map(m => (
                  <TouchableOpacity key={m} onPress={() => setSnoozeMinutes(m)}
                    style={[styles.offsetBtn, snoozeMinutes === m && { backgroundColor: `${C.teal}25`, borderColor: C.teal }]}>
                    <Text style={[styles.offsetBtnText, snoozeMinutes === m && { color: C.teal }]}>{m}λ</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4, paddingBottom: 24 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={{ color: C.muted }}>Άκυρο</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={saveAlarm} disabled={saving}>
                <Text style={{ color: C.white, fontWeight: '600' }}>Αποθήκευση</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.elevated, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  dayDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: C.white, fontSize: 14 },
  smartRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border, gap: 12 },
  dayBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  dayBtnText: { color: C.muted, fontSize: 10, fontWeight: '600' },
  offsetBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  offsetBtnText: { color: C.muted, fontSize: 12 },
  cancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: C.coral, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
})

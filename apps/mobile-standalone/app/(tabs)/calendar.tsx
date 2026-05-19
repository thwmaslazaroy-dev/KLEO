import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, RefreshControl, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import type { Event, Category } from '@kleo/shared'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.06)' }
const MONTH_GR = ['Ιανουάριος','Φεβρουάριος','Μάρτιος','Απρίλιος','Μάιος','Ιούνιος','Ιούλιος','Αύγουστος','Σεπτέμβριος','Οκτώβριος','Νοέμβριος','Δεκέμβριος']
const DAY_SHORT = ['Κυρ','Δευ','Τρι','Τετ','Πεμ','Παρ','Σαβ']

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}
function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}
function pad(n: number) { return String(n).padStart(2, '0') }
function parseDateInput(s: string): string | null {
  // expects "YYYY-MM-DD HH:MM" or "YYYY-MM-DDTHH:MM"
  const clean = s.trim().replace('T', ' ')
  const m = clean.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})$/)
  if (!m) return null
  return m[1] + 'T' + m[2] + ':00'
}

const EMPTY_FORM = { title: '', date: '', time: '', location: '', category: 'misc' as Category }

export default function CalendarScreen() {
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const [userId, setUserId]       = useState('')
  const [viewDate, setViewDate]   = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<string>(toISO(today))
  const [events, setEvents]       = useState<Event[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<Event | null>(null)
  const [form, setForm]           = useState({ ...EMPTY_FORM })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')

  const monthStart = startOfMonth(viewDate)
  const numDays    = daysInMonth(viewDate)
  const firstDow   = monthStart.getDay() // 0=Sun

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const from = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const to   = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
    const { data, error } = await supabase
      .from('events').select('*')
      .eq('user_id', user.id).eq('archived', false)
      .gte('start_at', from.toISOString()).lt('start_at', to.toISOString())
      .order('start_at')
    if (error) console.error('[calendar] load:', error.message)
    setEvents((data ?? []) as Event[])
  }, [viewDate])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, date: selectedDay, time: '10:00' })
    setFormError('')
    setShowForm(true)
  }

  function openEdit(e: Event) {
    const dt = new Date(e.start_at)
    setEditing(e)
    setForm({
      title: e.title,
      date: toISO(dt),
      time: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
      location: e.location ?? '',
      category: e.category as Category,
    })
    setFormError('')
    setShowForm(true)
  }

  async function save() {
    setFormError('')
    if (!form.title.trim()) { setFormError('Ο τίτλος είναι υποχρεωτικός.'); return }
    if (!form.date || !form.time) { setFormError('Η ημερομηνία και ώρα είναι υποχρεωτικές.'); return }
    const iso = parseDateInput(`${form.date} ${form.time}`)
    if (!iso) { setFormError('Μορφή: ΕΕΕΕ-ΜΜ-ΗΗ ΩΩ:ΛΛ'); return }

    setSaving(true)
    const payload = {
      title: form.title.trim(),
      start_at: new Date(iso).toISOString(),
      category: form.category,
      location: form.location.trim() || null,
    }
    console.log('[calendar]', editing ? 'update' : 'create', payload)

    const { error } = editing
      ? await supabase.from('events').update(payload).eq('id', editing.id)
      : await supabase.from('events').insert({ user_id: userId, ...payload })

    if (error) {
      console.error('[calendar] save error:', error.message)
      setFormError(error.message)
    } else {
      setShowForm(false)
      await load()
    }
    setSaving(false)
  }

  async function deleteEvent() {
    if (!editing) return
    console.log('[calendar] delete', editing.id)
    Alert.alert('Διαγραφή', 'Να διαγραφεί αυτό το event;', [
      { text: 'Άκυρο', style: 'cancel' },
      {
        text: 'Διαγραφή', style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('events').update({ archived: true }).eq('id', editing.id)
          if (error) {
            console.error('[calendar] delete error:', error.message)
            Alert.alert('Σφάλμα', error.message)
          } else {
            setShowForm(false)
            await load()
          }
        },
      },
    ])
  }

  // Build calendar grid
  const gridCells: (number | null)[] = []
  const startOffset = firstDow === 0 ? 6 : firstDow - 1 // Mon-first
  for (let i = 0; i < startOffset; i++) gridCells.push(null)
  for (let d = 1; d <= numDays; d++) gridCells.push(d)
  while (gridCells.length % 7 !== 0) gridCells.push(null)

  const dayEvents = events.filter(e => toISO(new Date(e.start_at)) === selectedDay)
  const selectedDt = new Date(selectedDay + 'T00:00:00')

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} tintColor={C.coral} />}
      >
        {/* Month header */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
            <Text style={styles.nav}>‹</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.monthTitle}>{MONTH_GR[viewDate.getMonth()]} {viewDate.getFullYear()}</Text>
            <TouchableOpacity onPress={() => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelectedDay(toISO(today)) }}>
              <Text style={styles.todayBtn}>Σήμερα</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
            <Text style={styles.nav}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day-of-week headers */}
        <View style={styles.dowRow}>
          {['Δε','Τρ','Τε','Πε','Πα','Σα','Κυ'].map(d => (
            <Text key={d} style={styles.dowLabel}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {gridCells.map((day, i) => {
            if (!day) return <View key={`e-${i}`} style={styles.cell} />
            const iso = `${viewDate.getFullYear()}-${pad(viewDate.getMonth()+1)}-${pad(day)}`
            const isToday  = iso === toISO(today)
            const isSelect = iso === selectedDay
            const hasEvent = events.some(e => toISO(new Date(e.start_at)) === iso)
            return (
              <TouchableOpacity key={iso} style={[styles.cell, isSelect && styles.cellSelected, isToday && !isSelect && styles.cellToday]} onPress={() => setSelectedDay(iso)}>
                <Text style={[styles.cellNum, isSelect && { color: C.white, fontWeight: '700' }, isToday && !isSelect && { color: C.teal }]}>{day}</Text>
                {hasEvent && <View style={[styles.eventDot, isSelect && { backgroundColor: C.white }]} />}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Selected day events */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.dayLabel}>
              {selectedDt.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
              <Text style={{ color: C.white, fontWeight: '600', fontSize: 13 }}>+ Νέο</Text>
            </TouchableOpacity>
          </View>

          {dayEvents.length === 0
            ? <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>Δεν έχεις events αυτή τη μέρα.</Text>
            : dayEvents.map(e => {
              const cat = CATEGORIES[e.category as keyof typeof CATEGORIES]
              return (
                <TouchableOpacity key={e.id} style={styles.eventCard} onPress={() => openEdit(e)}>
                  <View style={[styles.eventBar, { backgroundColor: cat?.color ?? C.teal }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.white, fontSize: 14, fontWeight: '600' }}>{e.title}</Text>
                    <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                      {new Date(e.start_at).toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })} · {cat?.emoji} {cat?.label}
                    </Text>
                    {e.location ? <Text style={{ color: C.muted, fontSize: 12 }}>📍 {e.location}</Text> : null}
                  </View>
                  <Text style={{ color: C.muted, fontSize: 16, paddingLeft: 8 }}>›</Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
      </ScrollView>

      {/* Create / Edit modal */}
      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{editing ? 'Επεξεργασία Event' : 'Νέο Event'}</Text>

            <TextInput style={styles.input} placeholder="Τίτλος" placeholderTextColor={C.muted} value={form.title} onChangeText={v => setForm(f => ({ ...f, title: v }))} autoFocus={!editing} />
            <TextInput style={styles.input} placeholder="Ημερομηνία (ΕΕΕΕ-ΜΜ-ΗΗ)" placeholderTextColor={C.muted} value={form.date} onChangeText={v => setForm(f => ({ ...f, date: v }))} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Ώρα (ΩΩ:ΛΛ)" placeholderTextColor={C.muted} value={form.time} onChangeText={v => setForm(f => ({ ...f, time: v }))} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Τοποθεσία (προαιρετικό)" placeholderTextColor={C.muted} value={form.location} onChangeText={v => setForm(f => ({ ...f, location: v }))} />

            {/* Category picker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(Object.entries(CATEGORIES) as [Category, { label: string; emoji: string; color: string }][]).map(([k, v]) => (
                  <TouchableOpacity key={k} onPress={() => setForm(f => ({ ...f, category: k }))}
                    style={[styles.chip, form.category === k && { borderColor: v.color, backgroundColor: v.color + '20' }]}>
                    <Text style={{ color: form.category === k ? v.color : C.muted, fontSize: 12 }}>{v.emoji} {v.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {formError ? <Text style={{ color: C.coral, fontSize: 12, marginBottom: 4 }}>{formError}</Text> : null}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {editing && (
                <TouchableOpacity style={styles.deleteBtn} onPress={deleteEvent}>
                  <Text style={{ color: C.coral, fontWeight: '600', fontSize: 13 }}>🗑 Διαγραφή</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={{ color: C.muted }}>Άκυρο</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                <Text style={{ color: C.white, fontWeight: '600' }}>{saving ? '...' : 'Αποθήκευση'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  nav: { color: C.white, fontSize: 28, paddingHorizontal: 12, paddingVertical: 4 },
  monthTitle: { fontSize: 20, fontWeight: '700', color: C.white },
  todayBtn: { fontSize: 12, color: C.teal, marginTop: 2 },
  dowRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4 },
  dowLabel: { flex: 1, textAlign: 'center', fontSize: 11, color: C.muted, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  cellSelected: { backgroundColor: C.coral },
  cellToday: { borderWidth: 1, borderColor: C.teal },
  cellNum: { fontSize: 14, color: C.white },
  eventDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.teal, marginTop: 2 },
  dayLabel: { fontSize: 14, fontWeight: '600', color: C.white, flex: 1 },
  addBtn: { backgroundColor: C.coral, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  eventCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.elevated, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  eventBar: { width: 3, borderRadius: 2, alignSelf: 'stretch', minHeight: 36 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: C.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: C.white },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: C.white, fontSize: 14 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  cancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: C.coral, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  deleteBtn: { backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 14, alignItems: 'center', borderWidth: 1, borderColor: `${C.coral}40` },
})

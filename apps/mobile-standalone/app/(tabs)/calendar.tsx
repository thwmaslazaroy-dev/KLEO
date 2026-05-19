import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, StyleSheet, RefreshControl } from 'react-native'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES, formatTimeGr } from '@kleo/shared'
import type { Event, Category } from '@kleo/shared'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.06)' }
const DAYS = ['Δευ','Τρι','Τετ','Πεμ','Παρ','Σαβ','Κυρ']

function getWeekStart(d: Date) {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const s = new Date(d)
  s.setDate(d.getDate() + diff)
  s.setHours(0,0,0,0)
  return s
}

export default function CalendarScreen() {
  const [events, setEvents] = useState<Event[]>([])
  const [userId, setUserId] = useState('')
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [startAt, setStartAt] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const from = new Date(weekStart)
    const to = new Date(weekStart); to.setDate(to.getDate() + 7)
    const { data } = await supabase.from('events').select('*').eq('user_id', user.id).eq('archived', false).gte('start_at', from.toISOString()).lt('start_at', to.toISOString()).order('start_at')
    setEvents((data ?? []) as Event[])
  }, [weekStart])

  useEffect(() => { load() }, [load])

  async function addEvent() {
    if (!title.trim() || !startAt) return
    setSaving(true)
    await supabase.from('events').insert({ user_id: userId, title: title.trim(), category: 'misc', start_at: new Date(startAt).toISOString() })
    setTitle(''); setStartAt(''); setShowForm(false); setSaving(false)
    load()
  }

  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d })
  const today = new Date(); today.setHours(0,0,0,0)

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} tintColor={C.coral} />}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.white }}>Ημερολόγιο</Text>
          <TouchableOpacity style={{ backgroundColor: C.coral, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }} onPress={() => setShowForm(true)}>
            <Text style={{ color: C.white, fontWeight: '600', fontSize: 13 }}>+ Νέο</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate()-7); return n })}>
            <Text style={{ color: C.muted, fontSize: 20, paddingHorizontal: 8 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: C.muted, fontSize: 13 }}>
            {weekStart.toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })} – {days[6].toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}
          </Text>
          <TouchableOpacity onPress={() => setWeekStart(d => { const n = new Date(d); n.setDate(n.getDate()+7); return n })}>
            <Text style={{ color: C.muted, fontSize: 20, paddingHorizontal: 8 }}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
          {days.map((day, i) => {
            const isToday = day.toDateString() === today.toDateString()
            const count = events.filter(e => new Date(e.start_at).toDateString() === day.toDateString()).length
            return (
              <View key={i} style={[styles.dayCell, isToday && styles.dayCellActive]}>
                <Text style={[styles.dayName, isToday && { color: C.teal }]}>{DAYS[i]}</Text>
                <Text style={[styles.dayNum, isToday && { color: C.teal }]}>{day.getDate()}</Text>
                {count > 0 && <View style={styles.dot} />}
              </View>
            )
          })}
        </View>

        <Text style={{ fontSize: 13, fontWeight: '600', color: C.muted, marginBottom: 10 }}>Events εβδομάδας</Text>
        {events.length === 0
          ? <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', marginTop: 20 }}>Δεν έχεις events αυτή την εβδομάδα.</Text>
          : events.map(e => {
            const cat = CATEGORIES[e.category as keyof typeof CATEGORIES]
            return (
              <View key={e.id} style={styles.eventCard}>
                <View style={styles.eventBar} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.white, fontSize: 14, fontWeight: '500' }}>{e.title}</Text>
                  <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{formatTimeGr(e.start_at)} · {cat?.emoji} {cat?.label}</Text>
                  {e.location && <Text style={{ color: C.muted, fontSize: 12 }}>📍 {e.location}</Text>}
                </View>
              </View>
            )
          })
        }
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide">
        <View style={{ flex:1, justifyContent:'flex-end', backgroundColor:'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: C.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.white }}>Νέο Event</Text>
            <TextInput style={styles.input} placeholder="Τίτλος" placeholderTextColor={C.muted} value={title} onChangeText={setTitle} autoFocus />
            <TextInput style={styles.input} placeholder="Ημ/νία & ώρα (π.χ. 2025-06-15T10:00)" placeholderTextColor={C.muted} value={startAt} onChangeText={setStartAt} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}><Text style={{ color: C.muted }}>Άκυρο</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={addEvent} disabled={saving}><Text style={{ color: C.white, fontWeight: '600' }}>Αποθήκευση</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  dayCell: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 10, backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border },
  dayCellActive: { borderColor: C.teal },
  dayName: { fontSize: 10, color: C.muted, marginBottom: 4 },
  dayNum: { fontSize: 16, fontWeight: '700', color: C.white },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.teal, marginTop: 4 },
  eventCard: { flexDirection: 'row', gap: 12, backgroundColor: C.elevated, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  eventBar: { width: 3, borderRadius: 2, backgroundColor: C.teal, alignSelf: 'stretch' },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: C.white, fontSize: 14 },
  cancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: C.coral, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
})

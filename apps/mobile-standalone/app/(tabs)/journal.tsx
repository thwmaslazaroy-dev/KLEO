import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { supabase } from '@/lib/supabase/client'
import { MOOD_LABELS } from '@kleo/shared'
import type { JournalEntry } from '@kleo/shared'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.06)' }

export default function JournalScreen() {
  const [userId, setUserId] = useState('')
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<number | null>(null)
  const [highlights, setHighlights] = useState('')
  const [tomorrowFocus, setTomorrowFocus] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('journal_entries').select('*').eq('user_id', user.id).eq('date', today).maybeSingle()
      if (data) {
        const e = data as JournalEntry
        setEntry(e); setContent(e.content ?? ''); setMood(e.mood ?? null)
        setHighlights(e.highlights?.join('\n') ?? ''); setTomorrowFocus(e.tomorrow_focus ?? '')
      }
    })
  }, [])

  async function save() {
    setSaving(true)
    const payload = {
      user_id: userId, date: today,
      content: content.trim() || null, mood,
      highlights: highlights.split('\n').map(h => h.trim()).filter(Boolean),
      tomorrow_focus: tomorrowFocus.trim() || null,
    }
    if (entry) {
      await supabase.from('journal_entries').update(payload).eq('id', entry.id)
    } else {
      const { data } = await supabase.from('journal_entries').insert(payload).select().single()
      setEntry(data as JournalEntry)
    }
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: C.white, marginBottom: 4 }}>Ημερολόγιο</Text>
      <Text style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>{new Date().toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>

      <Text style={styles.label}>Πώς ήταν η μέρα σου;</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {([1,2,3,4,5] as const).map(m => {
          const ml = MOOD_LABELS[m]
          return (
            <TouchableOpacity key={m} onPress={() => setMood(m)} style={[styles.moodBtn, mood === m && { borderColor: C.teal, backgroundColor: `${C.teal}15` }]}>
              <Text style={{ fontSize: 22 }}>{ml.emoji}</Text>
              <Text style={[styles.moodLabel, mood === m && { color: C.teal }]}>{ml.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <Text style={styles.label}>Πώς πήγε η μέρα;</Text>
      <TextInput style={[styles.input, { minHeight: 120, textAlignVertical: 'top' }]} placeholder="Γράψε ό,τι θέλεις..." placeholderTextColor={C.muted} value={content} onChangeText={setContent} multiline />

      <Text style={styles.label}>Highlights (1 ανά γραμμή)</Text>
      <TextInput style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} placeholder="Τι πήγε καλά..." placeholderTextColor={C.muted} value={highlights} onChangeText={setHighlights} multiline />

      <Text style={styles.label}>Focus για αύριο</Text>
      <TextInput style={styles.input} placeholder="Το πιο σημαντικό πράγμα..." placeholderTextColor={C.muted} value={tomorrowFocus} onChangeText={setTomorrowFocus} />

      <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
        <Text style={{ color: C.white, fontWeight: '600', fontSize: 15 }}>
          {saved ? '✓ Αποθηκεύτηκε' : saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: C.muted, marginBottom: 8 },
  moodBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.elevated },
  moodLabel: { fontSize: 9, color: C.muted, marginTop: 4, textAlign: 'center' },
  input: { backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: C.white, fontSize: 14, marginBottom: 16 },
  saveBtn: { backgroundColor: C.coral, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
})

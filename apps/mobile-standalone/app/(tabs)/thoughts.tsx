import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl, Modal, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES, formatRelativeGr } from '@kleo/shared'
import type { Thought, Category } from '@kleo/shared'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.06)' }

export default function ThoughtsScreen() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [userId, setUserId]     = useState('')
  const [input, setInput]       = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [saving, setSaving]     = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [editing, setEditing]   = useState<Thought | null>(null)
  const [editText, setEditText] = useState('')
  const [editCat, setEditCat]   = useState<Category>('misc')
  const [editError, setEditError] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data, error } = await supabase
      .from('thoughts').select('*')
      .eq('user_id', user.id).eq('archived', false)
      .order('created_at', { ascending: false }).limit(100)
    if (error) console.error('[thoughts] load:', error.message)
    setThoughts((data ?? []) as Thought[])
  }, [])

  useEffect(() => { load() }, [load])

  async function addThought() {
    if (!input.trim() || saving) return
    setSaving(true)
    console.log('[thoughts] create', { category })
    const { data, error } = await supabase
      .from('thoughts').insert({ user_id: userId, content: input.trim(), category }).select().single()
    if (error) console.error('[thoughts] create error:', error.message)
    else if (data) setThoughts(p => [data as Thought, ...p])
    setInput('')
    setSaving(false)
  }

  function openEdit(t: Thought) {
    setEditing(t); setEditText(t.content); setEditCat(t.category as Category); setEditError('')
  }

  async function saveEdit() {
    if (!editing) return
    if (!editText.trim()) { setEditError('Το περιεχόμενο είναι υποχρεωτικό.'); return }
    setEditSaving(true)
    console.log('[thoughts] update', editing.id)
    const { error } = await supabase.from('thoughts').update({ content: editText.trim(), category: editCat }).eq('id', editing.id)
    if (error) { console.error('[thoughts] update error:', error.message); setEditError(error.message) }
    else { setThoughts(p => p.map(t => t.id === editing.id ? { ...t, content: editText.trim(), category: editCat } : t)); setEditing(null) }
    setEditSaving(false)
  }

  function confirmDelete(t: Thought) {
    Alert.alert('Διαγραφή', 'Να διαγραφεί αυτή η σκέψη;', [
      { text: 'Άκυρο', style: 'cancel' },
      { text: 'Διαγραφή', style: 'destructive', onPress: async () => {
        console.log('[thoughts] delete', t.id)
        const { error } = await supabase.from('thoughts').update({ archived: true }).eq('id', t.id)
        if (error) { console.error('[thoughts] delete error:', error.message); Alert.alert('Σφάλμα', error.message) }
        else { setThoughts(p => p.filter(x => x.id !== t.id)); setEditing(null) }
      }},
    ])
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.inputBox}>
        <TextInput style={styles.textarea} placeholder="Τι σκέφτεσαι;" placeholderTextColor={C.muted} value={input} onChangeText={setInput} multiline />
        <View style={styles.inputFooter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(Object.keys(CATEGORIES) as Category[]).map(k => (
                <TouchableOpacity key={k} onPress={() => setCategory(k)} style={[styles.catBtn, category === k && { backgroundColor: `${C.coral}25`, borderColor: C.coral }]}>
                  <Text style={[styles.catBtnText, category === k && { color: C.coral }]}>{CATEGORIES[k].emoji} {CATEGORIES[k].label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <TouchableOpacity style={[styles.sendBtn, (!input.trim() || saving) && { opacity: 0.4 }]} onPress={addThought} disabled={!input.trim() || saving}>
            <Text style={{ color: C.teal, fontSize: 13, fontWeight: '600' }}>{saving ? '...' : '→'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} tintColor={C.coral} />}>
        {thoughts.length === 0
          ? <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', marginTop: 40 }}>Δεν έχεις σκέψεις ακόμα.</Text>
          : thoughts.map(t => {
            const cat = CATEGORIES[t.category as keyof typeof CATEGORIES]
            return (
              <TouchableOpacity key={t.id} style={styles.thoughtRow} onPress={() => openEdit(t)} activeOpacity={0.75}>
                <View style={styles.timeline}>
                  <View style={[styles.dot, { backgroundColor: cat?.color ?? C.teal }]} />
                  <View style={styles.line} />
                </View>
                <View style={{ flex: 1, paddingBottom: 16 }}>
                  <Text style={{ color: C.white, fontSize: 14, lineHeight: 20 }}>{t.content}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <Text style={[styles.catBadge, { backgroundColor: `${cat?.color}30`, color: cat?.color }]}>{cat?.emoji} {cat?.label}</Text>
                    <Text style={{ color: C.muted, fontSize: 11 }}>{formatRelativeGr(t.created_at)}</Text>
                  </View>
                </View>
                <Text style={{ color: C.muted, fontSize: 16, paddingLeft: 8, paddingBottom: 16 }}>›</Text>
              </TouchableOpacity>
            )
          })}
      </ScrollView>

      <Modal visible={!!editing} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Επεξεργασία Σκέψης</Text>
            <TextInput style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]} placeholder="Περιεχόμενο" placeholderTextColor={C.muted} value={editText} onChangeText={setEditText} multiline autoFocus />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(Object.keys(CATEGORIES) as Category[]).map(k => (
                  <TouchableOpacity key={k} onPress={() => setEditCat(k)} style={[styles.catBtn, editCat === k && { backgroundColor: `${C.coral}25`, borderColor: C.coral }]}>
                    <Text style={[styles.catBtnText, editCat === k && { color: C.coral }]}>{CATEGORIES[k].emoji} {CATEGORIES[k].label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {editError ? <Text style={{ color: C.coral, fontSize: 12 }}>{editError}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => editing && confirmDelete(editing)}>
                <Text style={{ color: C.coral, fontWeight: '600' }}>🗑</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(null)}>
                <Text style={{ color: C.muted }}>Άκυρο</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, editSaving && { opacity: 0.6 }]} onPress={saveEdit} disabled={editSaving}>
                <Text style={{ color: C.white, fontWeight: '600' }}>{editSaving ? '...' : 'Αποθήκευση'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  inputBox: { backgroundColor: C.elevated, margin: 16, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  textarea: { color: C.white, fontSize: 14, lineHeight: 20, minHeight: 60 },
  inputFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  catBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  catBtnText: { color: C.muted, fontSize: 11 },
  sendBtn: { backgroundColor: `${C.teal}20`, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  thoughtRow: { flexDirection: 'row', gap: 12 },
  timeline: { alignItems: 'center', paddingTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  line: { width: 1, flex: 1, backgroundColor: C.border, marginTop: 4 },
  catBadge: { fontSize: 11, fontWeight: '500', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: C.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: C.white },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: C.white, fontSize: 14 },
  cancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  confirmBtn: { flex: 1, backgroundColor: C.coral, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  deleteBtn: { backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center', borderWidth: 1, borderColor: `${C.coral}40` },
})

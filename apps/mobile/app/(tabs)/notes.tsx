import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, RefreshControl } from 'react-native'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import type { Note } from '@kleo/shared'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.06)' }

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([])
  const [userId, setUserId] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase.from('notes').select('*').eq('user_id', user.id).eq('archived', false).order('pinned', { ascending: false }).order('updated_at', { ascending: false })
    setNotes((data ?? []) as Note[])
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() { setEditing(null); setTitle(''); setContent(''); setShowForm(true) }
  function openEdit(n: Note) { setEditing(n); setTitle(n.title ?? ''); setContent(n.content); setShowForm(true) }

  async function save() {
    if (!content.trim()) return
    setSaving(true)
    const payload = { title: title.trim() || null, content: content.trim(), category: 'misc' }
    if (editing) {
      await supabase.from('notes').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('notes').insert({ user_id: userId, ...payload })
    }
    setSaving(false); setShowForm(false); load()
  }

  async function togglePin(note: Note) {
    await supabase.from('notes').update({ pinned: !note.pinned }).eq('id', note.id)
    setNotes(p => p.map(n => n.id === note.id ? { ...n, pinned: !note.pinned } : n))
  }

  async function archive(id: string) {
    await supabase.from('notes').update({ archived: true }).eq('id', id)
    setNotes(p => p.filter(n => n.id !== id))
  }

  const filtered = notes.filter(n => !search || n.content.toLowerCase().includes(search.toLowerCase()) || (n.title ?? '').toLowerCase().includes(search.toLowerCase()))

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} tintColor={C.coral} />}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.white }}>Σημειώσεις</Text>
          <TouchableOpacity style={{ backgroundColor: C.coral, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }} onPress={openNew}>
            <Text style={{ color: C.white, fontWeight: '600', fontSize: 13 }}>+ Νέα</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.search} placeholder="🔍 Αναζήτηση..." placeholderTextColor={C.muted} value={search} onChangeText={setSearch} />

        {filtered.length === 0
          ? <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', marginTop: 40 }}>{search ? 'Δεν βρέθηκαν σημειώσεις.' : 'Δεν έχεις σημειώσεις ακόμα.'}</Text>
          : filtered.map(n => {
            const cat = CATEGORIES[n.category as keyof typeof CATEGORIES]
            return (
              <TouchableOpacity key={n.id} style={[styles.card, n.pinned && { borderColor: `${C.teal}50` }]} onPress={() => openEdit(n)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ color: C.white, fontSize: 14, fontWeight: '600', flex: 1 }} numberOfLines={1}>{n.title || 'Χωρίς τίτλο'}</Text>
                  <TouchableOpacity onPress={() => archive(n.id)} style={{ paddingLeft: 8 }}>
                    <Text style={{ color: C.muted, fontSize: 16 }}>×</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ color: C.muted, fontSize: 13, marginTop: 4, lineHeight: 18 }} numberOfLines={2}>{n.content}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                  <Text style={[styles.catBadge, { backgroundColor: `${cat?.color}30`, color: cat?.color }]}>{cat?.emoji} {cat?.label}</Text>
                  {n.pinned && <Text style={{ fontSize: 11, color: C.teal }}>📌 Καρφιτσωμένη</Text>}
                  <TouchableOpacity onPress={() => togglePin(n)} style={{ marginLeft: 'auto' }}>
                    <Text style={{ fontSize: 11, color: C.muted }}>{n.pinned ? 'Ξεκαρφίτσωσε' : 'Καρφίτσωσε'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )
          })
        }
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: C.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.white }}>{editing ? 'Επεξεργασία' : 'Νέα σημείωση'}</Text>
            <TextInput style={styles.input} placeholder="Τίτλος (προαιρετικό)" placeholderTextColor={C.muted} value={title} onChangeText={setTitle} />
            <TextInput style={[styles.input, { minHeight: 120, textAlignVertical: 'top' }]} placeholder="Γράψε κάτι..." placeholderTextColor={C.muted} value={content} onChangeText={setContent} multiline autoFocus={!editing} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}><Text style={{ color: C.muted }}>Άκυρο</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}><Text style={{ color: C.white, fontWeight: '600' }}>Αποθήκευση</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  search: { backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, color: C.white, fontSize: 14, marginBottom: 16 },
  card: { backgroundColor: C.elevated, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  catBadge: { fontSize: 11, fontWeight: '500', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: C.white, fontSize: 14 },
  cancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: C.coral, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
})

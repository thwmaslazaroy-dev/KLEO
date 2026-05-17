import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES, formatRelativeGr } from '@kleo/shared'
import type { Thought, Category } from '@kleo/shared'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.06)' }

export default function ThoughtsScreen() {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [userId, setUserId] = useState('')
  const [input, setInput] = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase.from('thoughts').select('*').eq('user_id', user.id).eq('archived', false).order('created_at', { ascending: false }).limit(100)
    setThoughts((data ?? []) as Thought[])
  }, [])

  useEffect(() => { load() }, [load])

  async function addThought() {
    if (!input.trim() || saving) return
    setSaving(true)
    const { data } = await supabase.from('thoughts').insert({ user_id: userId, content: input.trim(), category }).select().single()
    if (data) setThoughts(p => [data as Thought, ...p])
    setInput('')
    setSaving(false)
  }

  async function archive(id: string) {
    await supabase.from('thoughts').update({ archived: true }).eq('id', id)
    setThoughts(p => p.filter(t => t.id !== id))
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.textarea}
          placeholder="Τι σκέφτεσαι;"
          placeholderTextColor={C.muted}
          value={input}
          onChangeText={setInput}
          multiline
        />
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
          <TouchableOpacity style={[styles.saveBtn, (!input.trim() || saving) && { opacity: 0.4 }]} onPress={addThought} disabled={!input.trim() || saving}>
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
              <View key={t.id} style={styles.thoughtRow}>
                <View style={styles.timeline}>
                  <View style={styles.dot} />
                  <View style={styles.line} />
                </View>
                <View style={{ flex: 1, paddingBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ color: C.white, fontSize: 14, lineHeight: 20, flex: 1 }}>{t.content}</Text>
                    <TouchableOpacity onPress={() => archive(t.id)} style={{ paddingLeft: 8 }}>
                      <Text style={{ color: C.muted, fontSize: 16 }}>×</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <Text style={[styles.catBadge, { backgroundColor: `${cat?.color}30`, color: cat?.color }]}>{cat?.emoji} {cat?.label}</Text>
                    <Text style={{ color: C.muted, fontSize: 11 }}>{formatRelativeGr(t.created_at)}</Text>
                  </View>
                </View>
              </View>
            )
          })
        }
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  inputBox: { backgroundColor: C.elevated, margin: 16, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  textarea: { color: C.white, fontSize: 14, lineHeight: 20, minHeight: 60 },
  inputFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  catBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  catBtnText: { color: C.muted, fontSize: 11 },
  saveBtn: { backgroundColor: `${C.teal}20`, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  thoughtRow: { flexDirection: 'row', gap: 12 },
  timeline: { alignItems: 'center', paddingTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.teal },
  line: { width: 1, flex: 1, backgroundColor: C.border, marginTop: 4 },
  catBadge: { fontSize: 11, fontWeight: '500', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
})

import { useState, useRef } from 'react'
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES, MOOD_LABELS } from '@kleo/shared'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.06)' }

interface Results {
  tasks:    Array<{ id: string; title: string; category: string; status: string }>
  notes:    Array<{ id: string; title: string | null; content: string; category: string }>
  thoughts: Array<{ id: string; content: string; category: string }>
  journal:  Array<{ id: string; date: string; content: string | null; mood: number | null }>
}

export default function SearchScreen() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<Results | null>(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function doSearch(q: string) {
    if (q.length < 2) { setResults(null); return }
    setLoading(true)
    try {
      const uid = (await supabase.auth.getUser()).data.user?.id
      if (!uid) return

      const like = `%${q}%`
      const [{ data: tasks }, { data: notes }, { data: thoughts }, { data: journal }] = await Promise.all([
        supabase.from('tasks').select('id,title,category,status').eq('user_id', uid).eq('archived', false).ilike('title', like).limit(8),
        supabase.from('notes').select('id,title,content,category').eq('user_id', uid).eq('archived', false).or(`title.ilike.${like},content.ilike.${like}`).limit(8),
        supabase.from('thoughts').select('id,content,category').eq('user_id', uid).eq('archived', false).ilike('content', like).limit(8),
        supabase.from('journal_entries').select('id,date,content,mood').eq('user_id', uid).ilike('content', like).limit(5),
      ])
      setResults({ tasks: tasks ?? [], notes: notes ?? [], thoughts: thoughts ?? [], journal: journal ?? [] })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(text: string) {
    setQuery(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(text), 350)
  }

  const total = results ? results.tasks.length + results.notes.length + results.thoughts.length + results.journal.length : 0

  function Section({ title, icon, items, render }: { title: string; icon: string; items: unknown[]; render: (item: unknown, i: number) => React.ReactNode }) {
    if (!items.length) return null
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>{icon} {title} ({items.length})</Text>
        {items.map((item, i) => render(item, i))}
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={{ color: C.muted, fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Αναζήτηση..."
          placeholderTextColor={C.muted}
          value={query}
          onChangeText={handleChange}
          autoFocus
          returnKeyType="search"
        />
        {loading && <ActivityIndicator size="small" color={C.teal} />}
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults(null) }}>
            <Text style={{ color: C.muted, fontSize: 18 }}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {results && query.length >= 2 && (
          <Text style={{ color: C.muted, fontSize: 12, marginBottom: 16 }}>
            {total === 0 ? 'Δεν βρέθηκαν αποτελέσματα.' : `${total} αποτελέσματα`}
          </Text>
        )}

        {results && (
          <>
            <Section title="Tasks" icon="✅" items={results.tasks} render={(item: unknown) => {
              const t = item as Results['tasks'][0]
              const cat = CATEGORIES[t.category as keyof typeof CATEGORIES]
              return (
                <View key={t.id} style={styles.card}>
                  <View style={[styles.dot, { backgroundColor: t.status === 'done' ? C.teal : 'rgba(255,255,255,0.2)' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, t.status === 'done' && { textDecorationLine: 'line-through', color: C.muted }]}>{t.title}</Text>
                    {cat && <Text style={[styles.catTag, { color: cat.color }]}>{cat.emoji} {cat.label}</Text>}
                  </View>
                </View>
              )
            }} />

            <Section title="Σημειώσεις" icon="📝" items={results.notes} render={(item: unknown) => {
              const n = item as Results['notes'][0]
              return (
                <View key={n.id} style={styles.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{n.title || 'Χωρίς τίτλο'}</Text>
                    <Text style={styles.cardSub} numberOfLines={2}>{n.content}</Text>
                  </View>
                </View>
              )
            }} />

            <Section title="Σκέψεις" icon="💭" items={results.thoughts} render={(item: unknown) => {
              const t = item as Results['thoughts'][0]
              return (
                <View key={t.id} style={[styles.card, { borderLeftWidth: 2, borderLeftColor: `${C.teal}60` }]}>
                  <Text style={[styles.cardTitle, { fontWeight: '400' }]}>{t.content}</Text>
                </View>
              )
            }} />

            <Section title="Ημερολόγιο" icon="📔" items={results.journal} render={(item: unknown) => {
              const j = item as Results['journal'][0]
              const mood = j.mood ? MOOD_LABELS[j.mood as keyof typeof MOOD_LABELS] : null
              return (
                <View key={j.id} style={styles.card}>
                  <Text style={{ fontSize: 18 }}>{mood?.emoji ?? '📔'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{new Date(j.date).toLocaleDateString('el-GR', { day: 'numeric', month: 'long' })}</Text>
                    {j.content && <Text style={styles.cardSub} numberOfLines={2}>{j.content}</Text>}
                  </View>
                </View>
              )
            }} />
          </>
        )}

        {!query && (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
            <Text style={{ color: C.muted, fontSize: 14, textAlign: 'center' }}>Αναζήτηση σε tasks,{'\n'}σημειώσεις, σκέψεις και ημερολόγιο</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: C.elevated, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: C.border, gap: 8 },
  input: { flex: 1, color: C.white, fontSize: 15 },
  sectionTitle: { color: C.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.elevated, borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: C.border },
  dot: { width: 16, height: 16, borderRadius: 8, marginTop: 2, flexShrink: 0 },
  cardTitle: { color: C.white, fontSize: 14, fontWeight: '500' },
  cardSub: { color: C.muted, fontSize: 12, marginTop: 3, lineHeight: 18 },
  catTag: { fontSize: 11, marginTop: 4 },
})

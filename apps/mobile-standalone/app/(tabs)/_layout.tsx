import { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, StyleSheet, Alert } from 'react-native'
import { Tabs } from 'expo-router'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import type { Category } from '@kleo/shared'

const C = {
  bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A',
  teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF',
  border: 'rgba(255,255,255,0.08)',
}

type CaptureType = 'task' | 'thought' | 'note'

export default function TabsLayout() {
  const [open, setOpen]         = useState(false)
  const [type, setType]         = useState<CaptureType>('thought')
  const [content, setContent]   = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  async function capture() {
    if (!content.trim()) return
    setSaving(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Δεν είσαι συνδεδεμένος.'); setSaving(false); return }

    const table = type === 'task' ? 'tasks' : type === 'thought' ? 'thoughts' : 'notes'
    const payload = type === 'task'
      ? { user_id: user.id, title: content.trim(), category, priority: 'medium', status: 'pending' }
      : { user_id: user.id, content: content.trim(), category }

    console.log('[fab] create', type, payload)
    const { error: err } = await supabase.from(table).insert(payload)
    if (err) { console.error('[fab] error:', err.message); setError(err.message) }
    else { setContent(''); setOpen(false) }
    setSaving(false)
  }

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: C.elevated, borderTopColor: C.border, paddingBottom: 4, height: 60 },
          tabBarActiveTintColor: C.coral,
          tabBarInactiveTintColor: C.muted,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        }}
      >
        <Tabs.Screen name="index"    options={{ title: 'Σήμερα',      tabBarIcon: ({ color }) => <TabIcon icon="☀️" color={color} /> }} />
        <Tabs.Screen name="tasks"    options={{ title: 'Tasks',        tabBarIcon: ({ color }) => <TabIcon icon="✅" color={color} /> }} />
        <Tabs.Screen name="calendar" options={{ title: 'Ημερολόγιο',  tabBarIcon: ({ color }) => <TabIcon icon="📅" color={color} /> }} />
        <Tabs.Screen name="notes"    options={{ title: 'Σημειώσεις',  tabBarIcon: ({ color }) => <TabIcon icon="📝" color={color} /> }} />
        <Tabs.Screen name="thoughts" options={{ title: 'Σκέψεις',     tabBarIcon: ({ color }) => <TabIcon icon="💭" color={color} /> }} />
        <Tabs.Screen name="journal"  options={{ title: 'Ημερολόγιο',  tabBarIcon: ({ color }) => <TabIcon icon="📔" color={color} /> }} />
        <Tabs.Screen name="goals"    options={{ title: 'Στόχοι',      tabBarIcon: ({ color }) => <TabIcon icon="🎯" color={color} /> }} />
        <Tabs.Screen name="alarms"   options={{ title: 'Ξυπνητήρια', tabBarIcon: ({ color }) => <TabIcon icon="⏰" color={color} /> }} />
        <Tabs.Screen name="search"   options={{ title: 'Αναζήτηση',  tabBarIcon: ({ color }) => <TabIcon icon="🔍" color={color} /> }} />
      </Tabs>

      {/* Global FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => { setOpen(true); setContent(''); setError('') }}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Quick-capture sheet */}
      <Modal visible={open} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Γρήγορη Καταγραφή</Text>

            {/* Type tabs */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
              {(['thought', 'task', 'note'] as CaptureType[]).map(t => (
                <TouchableOpacity key={t} style={[styles.typeTab, type === t && styles.typeTabActive]} onPress={() => setType(t)}>
                  <Text style={[styles.typeTabText, type === t && { color: C.white }]}>
                    {t === 'thought' ? '💭 Σκέψη' : t === 'task' ? '✅ Task' : '📝 Σημείωση'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder={type === 'task' ? 'Τι πρέπει να κάνεις;' : 'Τι έχεις στο μυαλό σου;'}
              placeholderTextColor={C.muted}
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
            />

            {/* Category */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(Object.keys(CATEGORIES) as Category[]).map(k => (
                  <TouchableOpacity key={k} onPress={() => setCategory(k)}
                    style={[styles.chip, category === k && { borderColor: C.coral, backgroundColor: `${C.coral}20` }]}>
                    <Text style={{ color: category === k ? C.coral : C.muted, fontSize: 12 }}>
                      {CATEGORIES[k].emoji} {CATEGORIES[k].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {error ? <Text style={{ color: C.coral, fontSize: 12 }}>{error}</Text> : null}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setOpen(false)}>
                <Text style={{ color: C.muted }}>Άκυρο</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, (saving || !content.trim()) && { opacity: 0.6 }]} onPress={capture} disabled={saving || !content.trim()}>
                <Text style={{ color: C.white, fontWeight: '600' }}>{saving ? '...' : 'Αποθήκευση'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

function TabIcon({ icon }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 18 }}>{icon}</Text>
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 72, right: 20,
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabIcon: { color: C.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: C.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: C.white },
  typeTab: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  typeTabActive: { backgroundColor: C.coral, borderColor: C.coral },
  typeTabText: { color: C.muted, fontSize: 12, fontWeight: '500' },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: C.white, fontSize: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  cancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: C.coral, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
})

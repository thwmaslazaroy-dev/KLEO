import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import type { Category } from '@kleo/shared'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.1)' }

interface QuickCaptureProps {
  userId: string
}

type CType = 'task' | 'thought' | 'note'

export default function QuickCapture({ userId }: QuickCaptureProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<CType>('task')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<Category>('misc')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!content.trim()) return
    setSaving(true)
    const table = type === 'task' ? 'tasks' : type === 'thought' ? 'thoughts' : 'notes'
    const payload = type === 'task'
      ? { user_id: userId, title: content.trim(), category, priority: 'medium' }
      : { user_id: userId, content: content.trim(), category }
    await supabase.from(table).insert(payload)
    setContent(''); setOpen(false); setSaving(false)
  }

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.tabs}>
              {(['task','thought','note'] as CType[]).map((t) => (
                <TouchableOpacity key={t} style={[styles.tab, type === t && styles.tabActive]} onPress={() => setType(t)}>
                  <Text style={[styles.tabText, type === t && styles.tabTextActive]}>
                    {t === 'task' ? '✅ Task' : t === 'thought' ? '💭 Σκέψη' : '📝 Σημείωση'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder={type === 'task' ? 'Τι πρέπει να κάνεις;' : 'Τι σκέφτεσαι;'}
              placeholderTextColor={C.muted}
              value={content}
              onChangeText={setContent}
              autoFocus
              multiline
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setOpen(false)}>
                <Text style={{ color: C.muted }}>Άκυρο</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
                <Text style={{ color: C.white, fontWeight: '600' }}>Αποθήκευση</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  fab: { position: 'absolute', bottom: 80, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: C.coral, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabIcon: { color: C.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: C.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 14 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: C.bg, alignItems: 'center' },
  tabActive: { backgroundColor: C.coral },
  tabText: { color: C.muted, fontSize: 12, fontWeight: '500' },
  tabTextActive: { color: C.white },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: C.white, fontSize: 14, minHeight: 80 },
  cancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: C.coral, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
})

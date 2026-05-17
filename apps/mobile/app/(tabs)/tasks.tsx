import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, RefreshControl } from 'react-native'
import { supabase } from '@/lib/supabase/client'
import { processRollovers, CATEGORIES } from '@kleo/shared'
import type { Task, Category, Priority } from '@kleo/shared'

const C = {
  bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8',
  muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.06)',
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<Category>('misc')
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('tasks').select('*').eq('user_id', user.id).eq('archived', false).order('created_at', { ascending: false })
    setTasks(processRollovers((data ?? []) as Task[]))
  }

  useEffect(() => { load() }, [])

  async function toggleTask(task: Task) {
    const status = task.status === 'done' ? 'pending' : 'done'
    await supabase.from('tasks').update({ status }).eq('id', task.id)
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status } : t))
  }

  async function addTask() {
    if (!newTitle.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('tasks').insert({
        user_id: user.id, title: newTitle.trim(), category: newCategory, priority: 'medium',
      })
      await load()
    }
    setNewTitle(''); setShowForm(false); setSaving(false)
  }

  const pending = tasks.filter((t) => t.status !== 'done')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} tintColor={C.coral} />}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.white }}>Tasks</Text>
          <TouchableOpacity style={{ backgroundColor: C.coral, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }} onPress={() => setShowForm(true)}>
            <Text style={{ color: C.white, fontWeight: '600', fontSize: 13 }}>+ Νέο</Text>
          </TouchableOpacity>
        </View>

        {pending.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)}
        {done.length > 0 && (
          <>
            <Text style={{ fontSize: 13, color: C.muted, marginTop: 16, marginBottom: 8 }}>Ολοκληρώθηκαν ({done.length})</Text>
            {done.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)}
          </>
        )}
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Νέο Task</Text>
            <TextInput
              style={styles.input}
              placeholder="Τίτλος..."
              placeholderTextColor={C.muted}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {(Object.keys(CATEGORIES) as Category[]).map((k) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.chip, newCategory === k && { borderColor: C.coral }]}
                  onPress={() => setNewCategory(k)}
                >
                  <Text style={{ color: newCategory === k ? C.coral : C.muted, fontSize: 12 }}>
                    {CATEGORIES[k].emoji} {CATEGORIES[k].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={{ color: C.muted }}>Άκυρο</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={addTask} disabled={saving}>
                <Text style={{ color: C.white, fontWeight: '600' }}>Αποθήκευση</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (t: Task) => void }) {
  const cat = CATEGORIES[task.category as keyof typeof CATEGORIES]
  return (
    <TouchableOpacity style={styles.taskRow} onPress={() => onToggle(task)}>
      <View style={[styles.circle, task.status === 'done' && styles.circleDone]}>
        {task.status === 'done' && <Text style={{ color: C.white, fontSize: 10, fontWeight: '700' }}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.taskTitle, task.status === 'done' && styles.taskDone]}>{task.title}</Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
          <Text style={[styles.tag, { backgroundColor: `${cat?.color}30`, color: cat?.color }]}>
            {cat?.emoji} {cat?.label}
          </Text>
          {task.overdue_days > 0 && (
            <Text style={styles.overdueTag}>+{task.overdue_days}μ</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: C.elevated, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.muted, marginTop: 1, alignItems: 'center', justifyContent: 'center' },
  circleDone: { backgroundColor: C.teal, borderColor: C.teal },
  taskTitle: { fontSize: 14, color: C.white },
  taskDone: { textDecorationLine: 'line-through', color: C.muted },
  tag: { fontSize: 11, fontWeight: '500', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  overdueTag: { fontSize: 11, fontWeight: '600', color: C.coral, backgroundColor: `${C.coral}25`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  modal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: C.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: C.white, marginBottom: 16 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: C.white, fontSize: 14, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  cancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: C.coral, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
})

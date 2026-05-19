import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, AppState } from 'react-native'
import { supabase } from '@/lib/supabase/client'
import { processRollovers, isToday, CATEGORIES } from '@kleo/shared'
import { refreshWidget } from '@/widget/KleoWidget'
import type { Task, Goal } from '@kleo/shared'

const C = {
  bg: '#141E2E',
  elevated: '#1E2D42',
  coral: '#E8523A',
  teal: '#2BB8B8',
  muted: '#9AA5B8',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.06)',
}

export default function TodayScreen() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [
      { data: rawTasks },
      { data: gs },
      { data: prof },
    ] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).in('status', ['pending','in_progress']).eq('archived', false),
      supabase.from('goals').select('*, goal_steps(*)').eq('user_id', user.id).eq('status', 'active').limit(3),
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    ])

    setTasks(processRollovers((rawTasks ?? []) as Task[]))
    setGoals((gs ?? []) as Goal[])
    setProfile(prof)
  }

  useEffect(() => {
    load()
    // Refresh widget when app comes to foreground
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refreshWidget()
    })
    return () => sub.remove()
  }, [])

  async function toggleTask(task: Task) {
    const status = task.status === 'done' ? 'pending' : 'done'
    await supabase.from('tasks').update({ status }).eq('id', task.id)
    setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, status } : t))
  }

  const overdue = tasks.filter((t) => t.overdue_days > 0)
  const today = tasks.filter((t) => isToday(t.due_date) && t.overdue_days === 0)
  const name = profile?.full_name ?? 'Tommy'

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} tintColor={C.coral} />}
    >
      <Text style={styles.heading}>Γεια σου, {name}! 👋</Text>
      <Text style={styles.date}>
        {new Date().toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </Text>

      {overdue.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.coral }]}>🔴 Καθυστερούν ({overdue.length})</Text>
          {overdue.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📌 Σήμερα</Text>
        {today.length === 0
          ? <Text style={styles.empty}>Δεν έχεις tasks για σήμερα.</Text>
          : today.map((t) => <TaskRow key={t.id} task={t} onToggle={toggleTask} />)
        }
      </View>

      {goals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Goals</Text>
          {goals.map((g) => (
            <View key={g.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>
                  {CATEGORIES[g.category as keyof typeof CATEGORIES]?.emoji} {g.title}
                </Text>
                <Text style={styles.goalPct}>{g.progress}%</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${g.progress}%` }]} />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (t: Task) => void }) {
  const cat = CATEGORIES[task.category as keyof typeof CATEGORIES]
  return (
    <TouchableOpacity style={styles.taskRow} onPress={() => onToggle(task)}>
      <View style={[styles.circle, task.status === 'done' && styles.circleDone]}>
        {task.status === 'done' && <Text style={styles.check}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.taskTitle, task.status === 'done' && styles.taskDone]}>
          {task.title}
        </Text>
        <View style={styles.tags}>
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
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 100 },
  heading: { fontSize: 22, fontWeight: '700', color: C.white, marginBottom: 4 },
  date: { fontSize: 13, color: C.muted, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: C.muted, marginBottom: 10 },
  empty: { fontSize: 13, color: C.muted, backgroundColor: C.elevated, borderRadius: 12, padding: 14 },
  taskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: C.elevated, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.muted, marginTop: 1, alignItems: 'center', justifyContent: 'center' },
  circleDone: { backgroundColor: C.teal, borderColor: C.teal },
  check: { color: C.white, fontSize: 10, fontWeight: '700' },
  taskTitle: { fontSize: 14, color: C.white, marginBottom: 6 },
  taskDone: { textDecorationLine: 'line-through', color: C.muted },
  tags: { flexDirection: 'row', gap: 6 },
  tag: { fontSize: 11, fontWeight: '500', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  overdueTag: { fontSize: 11, fontWeight: '600', color: C.coral, backgroundColor: `${C.coral}25`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  goalCard: { backgroundColor: C.elevated, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  goalTitle: { fontSize: 14, color: C.white, fontWeight: '500' },
  goalPct: { fontSize: 13, color: C.muted },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.teal, borderRadius: 3 },
})

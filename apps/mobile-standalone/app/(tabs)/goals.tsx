import { useEffect, useState, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, RefreshControl } from 'react-native'
import { supabase } from '@/lib/supabase/client'
import { CATEGORIES } from '@kleo/shared'
import type { Goal, GoalStep, Category } from '@kleo/shared'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF', border: 'rgba(255,255,255,0.06)' }

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [userId, setUserId] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [newStep, setNewStep] = useState('')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase.from('goals').select('*, goal_steps(*)').eq('user_id', user.id).eq('archived', false).order('created_at', { ascending: false })
    setGoals((data ?? []) as Goal[])
  }, [])

  useEffect(() => { load() }, [load])

  async function createGoal() {
    if (!newTitle.trim()) return
    setSaving(true)
    const { data } = await supabase.from('goals').insert({ user_id: userId, title: newTitle.trim(), category: 'misc' }).select('*, goal_steps(*)').single()
    if (data) setGoals(p => [data as Goal, ...p])
    setNewTitle(''); setShowForm(false); setSaving(false)
  }

  async function toggleStep(goal: Goal, step: GoalStep) {
    await supabase.from('goal_steps').update({ done: !step.done }).eq('id', step.id)
    const updatedSteps = (goal.steps ?? []).map(s => s.id === step.id ? { ...s, done: !step.done } : s)
    const progress = updatedSteps.length ? Math.round(updatedSteps.filter(s => s.done).length / updatedSteps.length * 100) : 0
    await supabase.from('goals').update({ progress }).eq('id', goal.id)
    setGoals(p => p.map(g => g.id === goal.id ? { ...g, steps: updatedSteps, progress } : g))
  }

  async function addStep(goal: Goal) {
    if (!newStep.trim()) return
    const { data } = await supabase.from('goal_steps').insert({ goal_id: goal.id, user_id: userId, title: newStep.trim(), order_index: (goal.steps?.length ?? 0) }).select().single()
    if (data) setGoals(p => p.map(g => g.id === goal.id ? { ...g, steps: [...(g.steps ?? []), data as GoalStep] } : g))
    setNewStep('')
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} tintColor={C.coral} />}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.white }}>Στόχοι</Text>
          <TouchableOpacity style={{ backgroundColor: C.coral, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }} onPress={() => setShowForm(true)}>
            <Text style={{ color: C.white, fontWeight: '600', fontSize: 13 }}>+ Νέος</Text>
          </TouchableOpacity>
        </View>

        {goals.length === 0
          ? <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', marginTop: 40 }}>Δεν έχεις στόχους ακόμα.</Text>
          : goals.map(g => {
            const cat = CATEGORIES[g.category as keyof typeof CATEGORIES]
            const steps = g.steps ?? []
            const isExpanded = expanded === g.id
            return (
              <View key={g.id} style={styles.goalCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.catBadge, { backgroundColor: `${cat?.color}30`, color: cat?.color, alignSelf: 'flex-start', marginBottom: 4 }]}>{cat?.emoji} {cat?.label}</Text>
                    <Text style={{ color: C.white, fontSize: 15, fontWeight: '600' }}>{g.title}</Text>
                  </View>
                  <Text style={{ color: C.white, fontSize: 15, fontWeight: '700' }}>{g.progress}%</Text>
                </View>

                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${g.progress}%` as `${number}%` }]} />
                </View>

                {steps.length > 0 && (
                  <Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
                    {steps.filter(s => s.done).length}/{steps.length} βήματα
                  </Text>
                )}

                <TouchableOpacity onPress={() => setExpanded(isExpanded ? null : g.id)} style={{ marginTop: 10 }}>
                  <Text style={{ color: C.muted, fontSize: 12 }}>{isExpanded ? '▲ Απόκρυψη' : '▼ Βήματα'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={{ marginTop: 10, gap: 8 }}>
                    {steps.map(step => (
                      <TouchableOpacity key={step.id} onPress={() => toggleStep(g, step)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={[styles.stepCircle, step.done && { backgroundColor: C.teal, borderColor: C.teal }]}>
                          {step.done && <Text style={{ color: C.white, fontSize: 9, fontWeight: '700' }}>✓</Text>}
                        </View>
                        <Text style={{ color: step.done ? C.muted : C.white, fontSize: 13, textDecorationLine: step.done ? 'line-through' : 'none', flex: 1 }}>{step.title}</Text>
                      </TouchableOpacity>
                    ))}
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      <TextInput style={[styles.stepInput, { flex: 1 }]} placeholder="+ Νέο βήμα..." placeholderTextColor={C.muted} value={newStep} onChangeText={setNewStep} onSubmitEditing={() => addStep(g)} />
                      {newStep.trim() && (
                        <TouchableOpacity onPress={() => addStep(g)}>
                          <Text style={{ color: C.teal, fontSize: 13, fontWeight: '600', paddingVertical: 8 }}>→</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )
          })
        }
      </ScrollView>

      <Modal visible={showForm} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: C.elevated, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: C.white }}>Νέος Στόχος</Text>
            <TextInput style={styles.input} placeholder="Ποιος είναι ο στόχος σου;" placeholderTextColor={C.muted} value={newTitle} onChangeText={setNewTitle} autoFocus />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}><Text style={{ color: C.muted }}>Άκυρο</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={createGoal} disabled={saving}><Text style={{ color: C.white, fontWeight: '600' }}>Δημιουργία</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  goalCard: { backgroundColor: C.elevated, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  catBadge: { fontSize: 11, fontWeight: '500', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: C.teal, borderRadius: 3 },
  stepCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.muted, alignItems: 'center', justifyContent: 'center' },
  stepInput: { backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 6, paddingHorizontal: 4, color: C.white, fontSize: 13 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: C.white, fontSize: 14 },
  cancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: C.coral, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
})

import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase/client'
import { setPIN } from '@/lib/security/pin'
import { requestNotificationPermission } from '@/lib/alarms/scheduler'

const C = {
  bg: '#141E2E',
  elevated: '#1E2D42',
  coral: '#E8523A',
  teal: '#2BB8B8',
  muted: '#9AA5B8',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.1)',
}

type Step = 'welcome' | 'name' | 'schedule' | 'pin' | 'notifications' | 'done'

export default function OnboardingScreen() {
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [shiftType, setShiftType] = useState<'fixed' | 'rotating'>('fixed')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinError, setPinError] = useState('')
  const router = useRouter()

  async function saveName() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user && name.trim()) {
      await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', user.id)
    }
    setStep('schedule')
  }

  async function saveSchedule() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ shift_type: shiftType }).eq('id', user.id)
    }
    setStep('pin')
  }

  async function savePin() {
    if (pin.length < 4) { setPinError('PIN πρέπει να έχει 4 ψηφία'); return }
    if (pin !== pinConfirm) { setPinError('Τα PIN δεν ταιριάζουν'); return }
    await setPIN(pin)
    setStep('notifications')
  }

  async function handleNotifications() {
    await requestNotificationPermission()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ onboarding_done: true }).eq('id', user.id)
    }
    setStep('done')
  }

  if (step === 'welcome') {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>Γεια! Είμαι ο Kleo</Text>
        <Text style={styles.subtitle}>Θυμάμαι εγώ, εσύ απλά ζεις.{'\n'}Ας σε γνωρίσω λίγο.</Text>
        <TouchableOpacity style={styles.button} onPress={() => setStep('name')}>
          <Text style={styles.buttonText}>Πάμε →</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (step === 'name') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Πώς να σε λέω;</Text>
        <TextInput
          style={styles.input}
          placeholder="Το όνομά σου"
          placeholderTextColor={C.muted}
          value={name}
          onChangeText={setName}
          autoFocus
        />
        <TouchableOpacity style={[styles.button, !name.trim() && styles.buttonDisabled]} onPress={saveName} disabled={!name.trim()}>
          <Text style={styles.buttonText}>Συνέχεια →</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (step === 'schedule') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Πώς δουλεύεις;</Text>
        <TouchableOpacity
          style={[styles.choice, shiftType === 'fixed' && styles.choiceActive]}
          onPress={() => setShiftType('fixed')}
        >
          <Text style={styles.choiceText}>📅 Σταθερό ωράριο</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.choice, shiftType === 'rotating' && styles.choiceActive]}
          onPress={() => setShiftType('rotating')}
        >
          <Text style={styles.choiceText}>🔄 Κυλιόμενες βάρδιες</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={saveSchedule}>
          <Text style={styles.buttonText}>Συνέχεια →</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (step === 'pin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Βάλε ένα PIN</Text>
        <Text style={styles.subtitle}>4 ψηφία για ασφάλεια</Text>
        <TextInput
          style={styles.input}
          placeholder="PIN (4 ψηφία)"
          placeholderTextColor={C.muted}
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
        />
        <TextInput
          style={styles.input}
          placeholder="Επιβεβαίωση PIN"
          placeholderTextColor={C.muted}
          value={pinConfirm}
          onChangeText={setPinConfirm}
          keyboardType="numeric"
          secureTextEntry
          maxLength={4}
        />
        {pinError ? <Text style={styles.error}>{pinError}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={savePin}>
          <Text style={styles.buttonText}>Συνέχεια →</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (step === 'notifications') {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>🔔</Text>
        <Text style={styles.title}>Ενεργοποίηση ειδοποιήσεων;</Text>
        <Text style={styles.subtitle}>Για υπενθυμίσεις και ξυπνητήρια</Text>
        <TouchableOpacity style={styles.button} onPress={handleNotifications}>
          <Text style={styles.buttonText}>Ναι, ενεργοποίηση</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleNotifications}>
          <Text style={styles.skipText}>Όχι τώρα</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Έτοιμος!</Text>
      <Text style={styles.subtitle}>Ο Kleo είναι έτοιμος να θυμάται για σένα.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.buttonText}>Πάμε!</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: C.white, textAlign: 'center' },
  subtitle: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20 },
  input: { width: '100%', backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: C.white, fontSize: 14 },
  error: { color: C.coral, fontSize: 13 },
  button: { width: '100%', backgroundColor: C.coral, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: C.white, fontWeight: '600', fontSize: 15 },
  choice: { width: '100%', backgroundColor: C.elevated, borderRadius: 12, paddingVertical: 16, paddingHorizontal: 20, borderWidth: 1, borderColor: C.border },
  choiceActive: { borderColor: C.coral },
  choiceText: { color: C.white, fontSize: 15 },
  skipButton: { paddingVertical: 8 },
  skipText: { color: C.muted, fontSize: 13 },
})

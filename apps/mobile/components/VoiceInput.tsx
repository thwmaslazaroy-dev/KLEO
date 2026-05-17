import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, useRef, ActivityIndicator } from 'react-native'
import { setupVoice, startListening, stopListening, destroyVoice } from '@/lib/voice/recognition'
import NetInfo from '@react-native-community/netinfo'

const C = { bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A', teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF' }

interface ParsedTask {
  title: string
  category: string
  priority: string
  due_date: string | null
  reminder_at: string | null
}

interface VoiceInputProps {
  onTaskParsed: (task: ParsedTask) => void
}

type State = 'idle' | 'listening' | 'processing' | 'confirm' | 'error'

export default function VoiceInput({ onTaskParsed }: VoiceInputProps) {
  const [state, setState] = useState<State>('idle')
  const [transcript, setTranscript] = useState('')
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [open, setOpen] = useState(false)
  const pulseAnim = useState(new Animated.Value(1))[0]

  useEffect(() => {
    if (state === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
        ])
      ).start()
    } else {
      pulseAnim.stopAnimation()
      pulseAnim.setValue(1)
    }
  }, [state])

  useEffect(() => {
    return () => { destroyVoice() }
  }, [])

  async function handlePress() {
    const net = await NetInfo.fetch()
    if (!net.isConnected) {
      setErrorMsg('Χρειάζεται σύνδεση για voice input')
      setState('error')
      setOpen(true)
      return
    }

    setOpen(true)
    setState('listening')
    setTranscript('')
    setParsedTask(null)

    setupVoice(
      async (result) => {
        setTranscript(result.transcript)
        await stopListening()
        setState('processing')
        await parseWithGemini(result.transcript)
      },
      (err) => {
        setErrorMsg(err)
        setState('error')
      },
      () => {
        if (state === 'listening') setState('idle')
      }
    )

    await startListening()
  }

  async function parseWithGemini(text: string) {
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/ai/parse-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setParsedTask(data.data)
      setState('confirm')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Σφάλμα ανάλυσης')
      setState('error')
    }
  }

  function handleConfirm() {
    if (parsedTask) {
      onTaskParsed(parsedTask)
      setOpen(false)
      setState('idle')
    }
  }

  function handleCancel() {
    stopListening()
    destroyVoice()
    setOpen(false)
    setState('idle')
  }

  const PRIORITY_LABELS: Record<string, string> = {
    urgent: 'Επείγον', high: 'Υψηλή', medium: 'Μέτρια', low: 'Χαμηλή',
  }
  const CAT_LABELS: Record<string, string> = {
    university: 'Σχολή', bills: 'Λογαριασμοί', projects: 'Projects', clients: 'Πελάτες', misc: 'Λοιπά',
  }

  return (
    <>
      <TouchableOpacity onPress={handlePress} style={styles.micBtn}>
        <Text style={{ fontSize: 20 }}>🎤</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {state === 'listening' && (
              <>
                <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                  <Text style={{ fontSize: 40 }}>🎤</Text>
                </Animated.View>
                <Text style={styles.title}>Μιλάω...</Text>
                <Text style={styles.sub}>Πες τι θέλεις να κάνεις</Text>
                <TouchableOpacity style={styles.stopBtn} onPress={() => { stopListening(); setState('idle') }}>
                  <Text style={styles.stopTxt}>Διακοπή</Text>
                </TouchableOpacity>
              </>
            )}

            {state === 'processing' && (
              <>
                <ActivityIndicator size="large" color={C.teal} />
                <Text style={styles.title}>Ανάλυση...</Text>
                {transcript ? <Text style={styles.sub}>"{transcript}"</Text> : null}
              </>
            )}

            {state === 'confirm' && parsedTask && (
              <>
                <Text style={styles.title}>Νέο Task;</Text>
                <Text style={styles.sub}>"{transcript}"</Text>
                <View style={styles.taskPreview}>
                  <Text style={styles.taskTitle}>{parsedTask.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.badge}>{CAT_LABELS[parsedTask.category] ?? parsedTask.category}</Text>
                    <Text style={styles.badge}>{PRIORITY_LABELS[parsedTask.priority] ?? parsedTask.priority}</Text>
                    {parsedTask.due_date && <Text style={styles.badge}>📅 {parsedTask.due_date}</Text>}
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                    <Text style={{ color: C.muted }}>Άκυρο</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                    <Text style={{ color: C.white, fontWeight: '600' }}>✓ Αποθήκευση</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {state === 'error' && (
              <>
                <Text style={{ fontSize: 40 }}>⚠️</Text>
                <Text style={styles.title}>{errorMsg}</Text>
                <TouchableOpacity style={styles.stopBtn} onPress={handleCancel}>
                  <Text style={styles.stopTxt}>Κλείσιμο</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  micBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${'#2BB8B8'}20`, borderWidth: 1, borderColor: `${'#2BB8B8'}40`, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 24 },
  sheet: { backgroundColor: C.elevated, borderRadius: 24, padding: 32, alignItems: 'center', gap: 16, width: '100%', maxWidth: 340 },
  pulseCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: `${C.coral}20`, borderWidth: 2, borderColor: C.coral, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: C.white, textAlign: 'center' },
  sub: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 18 },
  taskPreview: { backgroundColor: C.bg, borderRadius: 12, padding: 14, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  taskTitle: { fontSize: 15, fontWeight: '600', color: C.white },
  badge: { fontSize: 12, color: C.muted, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  stopBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  stopTxt: { color: C.white, fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: C.bg, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  confirmBtn: { flex: 1, backgroundColor: C.coral, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
})

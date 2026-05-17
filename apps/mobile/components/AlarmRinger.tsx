import { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated, Vibration } from 'react-native'
import * as Notifications from 'expo-notifications'
import { snoozeAlarm } from '@/lib/alarms/scheduler'

const C = { bg: '#141E2E', coral: '#E8523A', teal: '#2BB8B8', white: '#FFFFFF', muted: '#9AA5B8' }

interface AlarmRingerProps {
  alarmId: string
  label: string
  time: string
  snoozeMinutes: number
  onDismiss: () => void
}

export default function AlarmRinger({ alarmId, label, time, snoozeMinutes, onDismiss }: AlarmRingerProps) {
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Vibration.vibrate([500, 1000, 500, 1000], true)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 500, useNativeDriver: true }),
      ])
    ).start()
    return () => { Vibration.cancel(); pulse.stopAnimation() }
  }, [])

  async function handleSnooze() {
    Vibration.cancel()
    await snoozeAlarm(alarmId, snoozeMinutes)
    onDismiss()
  }

  function handleDismiss() {
    Vibration.cancel()
    Notifications.dismissAllNotificationsAsync()
    onDismiss()
  }

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.circle, { transform: [{ scale: pulse }] }]}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.label}>{label || 'Ξυπνητήρι'}</Text>
      </Animated.View>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.snoozeBtn} onPress={handleSnooze}>
          <Text style={styles.snoozeTxt}>⏰ Snooze +{snoozeMinutes}λ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
          <Text style={styles.dismissTxt}>✕ Σβήσε</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  circle: { width: 200, height: 200, borderRadius: 100, backgroundColor: `${C.coral}20`, borderWidth: 3, borderColor: C.coral, alignItems: 'center', justifyContent: 'center', marginBottom: 60 },
  time: { fontSize: 40, fontWeight: '700', color: C.white },
  label: { fontSize: 14, color: C.muted, marginTop: 4 },
  buttons: { position: 'absolute', bottom: 60, width: '80%', gap: 12 },
  snoozeBtn: { backgroundColor: `${C.teal}20`, borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: `${C.teal}40` },
  snoozeTxt: { color: C.teal, fontWeight: '600', fontSize: 16 },
  dismissBtn: { backgroundColor: `${C.coral}20`, borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: `${C.coral}40` },
  dismissTxt: { color: C.coral, fontWeight: '600', fontSize: 16 },
})

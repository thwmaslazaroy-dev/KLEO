import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native'
import { useRouter } from 'expo-router'
import { verifyPIN, verifyBiometric, hasPIN } from '@/lib/security/pin'

const COLORS = {
  bg: '#141E2E',
  elevated: '#1E2D42',
  coral: '#E8523A',
  teal: '#2BB8B8',
  muted: '#9AA5B8',
  white: '#FFFFFF',
}

export default function PinScreen() {
  const [pin, setPin] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked, setLocked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    hasPIN().then((has) => {
      if (!has) router.replace('/(tabs)')
    })
    tryBiometric()
  }, [])

  async function tryBiometric() {
    const ok = await verifyBiometric()
    if (ok) router.replace('/(tabs)')
  }

  async function handleDigit(d: string) {
    if (locked) return
    const newPin = pin + d

    if (newPin.length < 4) {
      setPin(newPin)
      return
    }

    const ok = await verifyPIN(newPin)
    if (ok) {
      setPin('')
      router.replace('/(tabs)')
    } else {
      Vibration.vibrate(300)
      setPin('')
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (newAttempts >= 3) {
        setLocked(true)
        setTimeout(() => { setLocked(false); setAttempts(0) }, 30000)
      }
    }
  }

  function handleDelete() {
    setPin((p) => p.slice(0, -1))
  }

  const KEYS = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['bio','0','del'],
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kleo</Text>
      <Text style={styles.subtitle}>
        {locked ? `Αναμονή 30 δευτ. (${attempts}/3 λάθη)` : 'Εισάγετε PIN'}
      </Text>

      <View style={styles.dots}>
        {[0,1,2,3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length ? styles.dotFilled : styles.dotEmpty,
            ]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((k) => (
              <TouchableOpacity
                key={k}
                style={[styles.key, locked && styles.keyDisabled]}
                onPress={() => {
                  if (k === 'bio') tryBiometric()
                  else if (k === 'del') handleDelete()
                  else handleDigit(k)
                }}
                disabled={locked}
              >
                <Text style={styles.keyText}>
                  {k === 'bio' ? '👁' : k === 'del' ? '⌫' : k}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.muted, marginBottom: 40 },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  dot: { width: 14, height: 14, borderRadius: 7 },
  dotEmpty: { backgroundColor: COLORS.elevated, borderWidth: 1, borderColor: COLORS.muted },
  dotFilled: { backgroundColor: COLORS.coral },
  keypad: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  key: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.elevated, alignItems: 'center', justifyContent: 'center' },
  keyDisabled: { opacity: 0.4 },
  keyText: { fontSize: 22, color: COLORS.white, fontWeight: '500' },
})

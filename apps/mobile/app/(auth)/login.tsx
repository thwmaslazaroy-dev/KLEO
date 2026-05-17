import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase/client'

const C = {
  bg: '#141E2E',
  elevated: '#1E2D42',
  coral: '#E8523A',
  teal: '#2BB8B8',
  muted: '#9AA5B8',
  white: '#FFFFFF',
  border: 'rgba(255,255,255,0.1)',
}

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.replace('/pin')

    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>K</Text>
        </View>
        <Text style={styles.title}>Kleo</Text>
        <Text style={styles.tagline}>Θυμάμαι εγώ, εσύ απλά ζεις.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={C.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Κωδικός"
            placeholderTextColor={C.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Σύνδεση...' : 'Σύνδεση'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.link}>Δεν έχεις λογαριασμό; Εγγραφή</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo: { width: 64, height: 64, borderRadius: 16, backgroundColor: C.elevated, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { fontSize: 24, fontWeight: '700', color: C.white },
  title: { fontSize: 24, fontWeight: '700', color: C.white, marginBottom: 4 },
  tagline: { fontSize: 13, color: C.muted, marginBottom: 40 },
  form: { width: '100%', gap: 12 },
  input: { backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: C.white, fontSize: 14 },
  error: { color: C.coral, fontSize: 13, textAlign: 'center' },
  button: { backgroundColor: C.coral, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: C.white, fontWeight: '600', fontSize: 15 },
  link: { color: C.teal, textAlign: 'center', fontSize: 13, marginTop: 8 },
})

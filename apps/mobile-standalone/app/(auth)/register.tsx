import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase/client'

const C = {
  bg: '#141E2E', elevated: '#1E2D42', coral: '#E8523A',
  teal: '#2BB8B8', muted: '#9AA5B8', white: '#FFFFFF',
  border: 'rgba(255,255,255,0.1)', green: '#10b981',
}

export default function RegisterScreen() {
  const [fullName, setFullName]           = useState('')
  const [email, setEmail]                 = useState('')
  const [password, setPassword]           = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [success, setSuccess]             = useState(false)
  const router = useRouter()

  async function handleRegister() {
    setError('')
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Συμπλήρωσε όλα τα πεδία.')
      return
    }
    if (password.length < 6) {
      setError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.')
      return
    }
    if (password !== confirmPassword) {
      setError('Οι κωδικοί δεν ταιριάζουν.')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    })

    if (error) {
      setError(error.message)
    } else if (data.session) {
      await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', data.user!.id)
      router.replace('/onboarding')
    } else {
      // email confirmation required
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successBox}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>📧</Text>
          <Text style={styles.successTitle}>Έλεγξε το email σου!</Text>
          <Text style={styles.successMsg}>
            Στείλαμε σύνδεσμο επιβεβαίωσης στο{'\n'}
            <Text style={{ color: C.teal }}>{email}</Text>
          </Text>
          <Text style={styles.successHint}>
            Μόλις επιβεβαιώσεις, επέστρεψε εδώ και συνδέσου.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.buttonText}>Πήγαινε στη Σύνδεση</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Δημιουργία λογαριασμού</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Όνομα"
            placeholderTextColor={C.muted}
            value={fullName}
            onChangeText={setFullName}
          />
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
            placeholder="Κωδικός (min 6 χαρακτήρες)"
            placeholderTextColor={C.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Επανάληψη κωδικού"
            placeholderTextColor={C.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Δημιουργία...' : 'Δημιουργία λογαριασμού'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.link}>Έχεις ήδη λογαριασμό; Σύνδεση</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 22, fontWeight: '700', color: C.white, marginBottom: 32 },
  form: { width: '100%', gap: 12 },
  input: { backgroundColor: C.elevated, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: C.white, fontSize: 14 },
  error: { color: C.coral, fontSize: 13, textAlign: 'center' },
  button: { backgroundColor: C.coral, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: C.white, fontWeight: '600', fontSize: 15 },
  link: { color: C.teal, textAlign: 'center', fontSize: 13, marginTop: 8 },
  successBox: { alignItems: 'center', padding: 32 },
  successTitle: { fontSize: 22, fontWeight: '700', color: C.white, marginBottom: 12 },
  successMsg: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  successHint: { fontSize: 13, color: C.muted, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
})

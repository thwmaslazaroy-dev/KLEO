import { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { supabase } from '@/lib/supabase/client'
import { initDB } from '@/lib/sqlite/db'
import { registerPushToken } from '@/lib/notifications/push'
import { setupNotificationHandler, setupNotificationListeners } from '@/lib/notifications/handler'
import { hasPIN } from '@/lib/security/pin'
import { useRouter, useSegments } from 'expo-router'
import type { Session } from '@supabase/supabase-js'

SplashScreen.preventAutoHideAsync()
setupNotificationHandler()

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null
    let cleanupListeners: (() => void) | null = null

    async function init() {
      console.log('[layout] init start')
      try {
        initDB()
        console.log('[layout] db init done')

        cleanupListeners = setupNotificationListeners()

        const { data: { session } } = await supabase.auth.getSession()
        console.log('[layout] session loaded', session?.user?.id ?? 'none')
        setSession(session)

        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
          (_event, session) => setSession(session)
        )
        subscription = sub
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('[layout] init failed:', msg)
        setInitError(msg)
      } finally {
        console.log('[layout] ready true')
        setReady(true)
      }
    }

    init()

    return () => {
      subscription?.unsubscribe()
      cleanupListeners?.()
    }
  }, [])

  useEffect(() => {
    if (!ready) return

    console.log('[layout] splash hidden')
    SplashScreen.hideAsync()

    if (initError) return

    const inAuth = segments[0] === '(auth)'
    const inPin  = segments[0] === 'pin'

    if (!session) {
      if (!inAuth) router.replace('/(auth)/login')
      return
    }

    if (!inPin && !inAuth) {
      hasPIN().then((has) => {
        if (has) router.replace('/pin')
      })
    }

    // Non-blocking — runs after app is visible
    registerPushToken(session.user.id).catch((e) =>
      console.warn('[layout] push token failed:', e)
    )
  }, [ready, session, segments, router, initError])

  if (!ready) return null

  if (initError) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorTitle}>Σφάλμα εκκίνησης</Text>
        <Text style={styles.errorMsg}>{initError}</Text>
      </View>
    )
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#141E2E" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#141E2E' } }} />
    </>
  )
}

const styles = StyleSheet.create({
  error: {
    flex: 1,
    backgroundColor: '#141E2E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    color: '#E8523A',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorMsg: {
    color: '#9AA5B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
})

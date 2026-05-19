import { useEffect, useState } from 'react'
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
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    initDB()
    const cleanupListeners = setupNotificationListeners()

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setReady(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => { subscription.unsubscribe(); cleanupListeners() }
  }, [])

  useEffect(() => {
    if (!ready) return

    SplashScreen.hideAsync()

    const inAuth = segments[0] === '(auth)'
    const inPin = segments[0] === 'pin'

    if (!session) {
      if (!inAuth) router.replace('/(auth)/login')
      return
    }

    if (!inPin && !inAuth) {
      hasPIN().then((has) => {
        if (has) router.replace('/pin')
      })
    }

    registerPushToken(session.user.id)
  }, [ready, session, segments, router])

  if (!ready) return null

  return (
    <>
      <StatusBar style="light" backgroundColor="#141E2E" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#141E2E' } }} />
    </>
  )
}

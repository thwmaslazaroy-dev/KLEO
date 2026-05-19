import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { supabase } from '@/lib/supabase/client'

export async function registerPushToken(userId: string) {
  if (!Device.isDevice) return

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return

  const token = (await Notifications.getExpoPushTokenAsync()).data

  await supabase
    .from('profiles')
    .update({ expo_push_token: token })
    .eq('id', userId)
}

import { Audio } from 'expo-av'
import * as Linking from 'expo-linking'
import type { Alarm } from '@kleo/shared'

let soundObject: Audio.Sound | null = null

/**
 * Play alarm sound based on the alarm's sound_type:
 *   'default' — system notification sound via Expo Notifications (handled by scheduler.ts)
 *   'file'    — local audio file via Expo AV
 *   'spotify' — deep-link open Spotify URI
 *
 * Phase 7: add UI for picking sound file from device library.
 */
export async function playAlarmSound(alarm: Alarm): Promise<void> {
  if (alarm.sound_type === 'file' && alarm.sound_uri) {
    await stopAlarmSound()
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    })
    const { sound } = await Audio.Sound.createAsync(
      { uri: alarm.sound_uri },
      { shouldPlay: true, isLooping: true, volume: 1.0 }
    )
    soundObject = sound
    return
  }

  if (alarm.sound_type === 'spotify' && alarm.sound_uri) {
    const canOpen = await Linking.canOpenURL(alarm.sound_uri)
    if (canOpen) await Linking.openURL(alarm.sound_uri)
    return
  }

  // 'default' — system sound handled by Expo Notifications
}

export async function stopAlarmSound(): Promise<void> {
  if (soundObject) {
    await soundObject.stopAsync()
    await soundObject.unloadAsync()
    soundObject = null
  }
}

export async function setAlarmSoundFile(alarmId: string, uri: string, supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>): Promise<void> {
  await supabase.from('alarms').update({ sound_type: 'file', sound_uri: uri }).eq('id', alarmId)
}

export async function setAlarmSpotify(alarmId: string, uri: string, supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>): Promise<void> {
  await supabase.from('alarms').update({ sound_type: 'spotify', sound_uri: uri }).eq('id', alarmId)
}

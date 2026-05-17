import * as Notifications from 'expo-notifications'
import type { Alarm } from '@kleo/shared'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function scheduleAlarm(alarm: Alarm) {
  const alarmTime = alarm.smart_alarm
    ? alarm.time
    : alarm.time

  const [h, m] = alarmTime.split(':').map(Number)

  await Notifications.scheduleNotificationAsync({
    identifier: `alarm_${alarm.id}`,
    content: {
      title: '⏰ ' + (alarm.label ?? 'Ξυπνητήρι'),
      body: 'Kleo — ' + alarmTime,
      sound: true,
      vibrate: alarm.vibrate ? [0, 500, 200, 500] : undefined,
      data: { alarmId: alarm.id, type: 'alarm' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: h,
      minute: m,
      repeats: true,
    },
  })
}

export async function snoozeAlarm(alarmId: string, minutes: number) {
  await Notifications.scheduleNotificationAsync({
    identifier: `snooze_${alarmId}`,
    content: {
      title: '⏰ Snooze',
      body: `+${minutes} λεπτά`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: minutes * 60,
    },
  })
}

export async function cancelAlarm(alarmId: string) {
  await Notifications.cancelScheduledNotificationAsync(`alarm_${alarmId}`)
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

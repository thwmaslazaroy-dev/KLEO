import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })
}

export function setupNotificationListeners() {
  const sub = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data as Record<string, string>

    if (data.type === 'task_reminder') {
      router.push('/(tabs)/tasks')
    } else if (data.type === 'event_reminder') {
      router.push('/(tabs)/calendar')
    } else if (data.type === 'weekly_review') {
      router.push('/(tabs)/index')
    }
  })

  return () => sub.remove()
}

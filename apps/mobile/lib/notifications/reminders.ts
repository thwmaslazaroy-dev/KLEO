import * as Notifications from 'expo-notifications'
import { getCurrentShift } from '@kleo/shared'
import type { WorkSchedule } from '@kleo/shared'

export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  reminderAt: Date,
  priority: string,
  schedule: WorkSchedule | null
) {
  if (reminderAt <= new Date()) return

  // Shift-aware: skip non-urgent reminders outside working hours
  if (priority !== 'urgent' && schedule) {
    const shift = getCurrentShift(schedule)
    if (shift && !isWithinShift(reminderAt, shift.start, shift.end)) return
  }

  await Notifications.scheduleNotificationAsync({
    identifier: `task_reminder_${taskId}`,
    content: {
      title: 'Kleo — Υπενθύμιση',
      body: title,
      data: { type: 'task_reminder', taskId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderAt,
    },
  })
}

export async function scheduleEventReminder(
  eventId: string,
  title: string,
  reminderAt: Date
) {
  if (reminderAt <= new Date()) return

  await Notifications.scheduleNotificationAsync({
    identifier: `event_reminder_${eventId}`,
    content: {
      title: 'Kleo — Event σε λίγο',
      body: title,
      data: { type: 'event_reminder', eventId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderAt,
    },
  })
}

export async function cancelTaskReminder(taskId: string) {
  await Notifications.cancelScheduledNotificationAsync(`task_reminder_${taskId}`)
}

export async function cancelEventReminder(eventId: string) {
  await Notifications.cancelScheduledNotificationAsync(`event_reminder_${eventId}`)
}

function isWithinShift(date: Date, shiftStart: string, shiftEnd: string): boolean {
  const h = date.getHours()
  const m = date.getMinutes()
  const [sh, sm] = shiftStart.split(':').map(Number)
  const [eh, em] = shiftEnd.split(':').map(Number)
  const t  = h * 60 + m
  const ts = sh * 60 + sm
  const te = eh * 60 + em

  // Handle overnight shifts (e.g. 22:00–06:00)
  if (ts > te) return t >= ts || t <= te
  return t >= ts && t <= te
}

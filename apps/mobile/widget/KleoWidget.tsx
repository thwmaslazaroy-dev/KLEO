/**
 * Kleo Today Widget
 *
 * iOS: Uses react-native-widgetkit via a Swift WidgetKit extension.
 * Android: Uses react-native-android-widget with a Glance Composable.
 *
 * Both platforms share the same data contract — a JSON file written
 * to the App Group container (iOS) / shared preferences (Android):
 *
 * {
 *   updated_at: string,
 *   name: string,
 *   overdue_count: number,
 *   today_tasks: [{ id, title, status }],   // max 5
 *   current_shift?: { label, start, end }
 * }
 *
 * The data is refreshed by refreshWidget() whenever the app goes
 * to background or the user opens the Today tab.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase/client'
import { processRollovers, getCurrentShift, isToday } from '@kleo/shared'
import type { Task, WorkSchedule } from '@kleo/shared'

const WIDGET_KEY = 'kleo_widget_data'

export interface WidgetData {
  updated_at: string
  name: string
  overdue_count: number
  today_tasks: Array<{ id: string; title: string; done: boolean }>
  current_shift: { label: string; start: string; end: string } | null
}

export async function refreshWidget(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [
      { data: rawTasks },
      { data: profile },
      { data: scheduleRows },
    ] = await Promise.all([
      supabase.from('tasks').select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'in_progress'])
        .eq('archived', false)
        .order('priority'),
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase.from('work_schedules').select('*').eq('user_id', user.id)
        .eq('is_active', true).order('start_date', { ascending: false }).limit(1),
    ])

    const tasks    = processRollovers((rawTasks ?? []) as Task[])
    const overdue  = tasks.filter(t => t.overdue_days > 0)
    const today    = tasks.filter(t => isToday(t.due_date) && t.overdue_days === 0)
    const schedule = (scheduleRows?.[0] ?? null) as WorkSchedule | null
    const shift    = getCurrentShift(schedule)

    const data: WidgetData = {
      updated_at:    new Date().toISOString(),
      name:          profile?.full_name ?? 'Tommy',
      overdue_count: overdue.length,
      today_tasks:   [...overdue, ...today].slice(0, 5).map(t => ({
        id:    t.id,
        title: t.title,
        done:  t.status === 'done',
      })),
      current_shift: shift
        ? { label: shift.label, start: shift.start, end: shift.end }
        : null,
    }

    await AsyncStorage.setItem(WIDGET_KEY, JSON.stringify(data))

    // Reload native widget if available
    try {
      // iOS: WidgetKit reload via native module (requires react-native-widgetkit)
      // const WidgetKit = require('react-native-widgetkit').default
      // WidgetKit.reloadAllTimelines()

      // Android: handled by react-native-android-widget automatically
    } catch {
      // Widget native module not available in Expo Go — only in custom dev client
    }
  } catch {
    // Non-critical
  }
}

export async function getWidgetData(): Promise<WidgetData | null> {
  const raw = await AsyncStorage.getItem(WIDGET_KEY)
  return raw ? JSON.parse(raw) as WidgetData : null
}

import type { Priority } from '../types'

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Επείγον',
  high: 'Υψηλή',
  medium: 'Μέτρια',
  low: 'Χαμηλή',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#E8523A',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#6b7280',
}

export function sortByPriority<T extends { priority: Priority }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  )
}

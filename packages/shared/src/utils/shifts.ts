import type { WorkSchedule, Shift } from '../types'

export function getCurrentShift(schedule?: WorkSchedule | null): Shift | null {
  if (!schedule) return null
  if (schedule.shift_type === 'fixed') return schedule.shifts[0]

  const weeksSinceStart = Math.floor(
    (Date.now() - new Date(schedule.start_date).getTime()) /
      (1000 * 60 * 60 * 24 * 7)
  )
  const index = weeksSinceStart % schedule.shifts.length
  return schedule.shifts[index]
}

export function getNextShift(schedule?: WorkSchedule | null): Shift | null {
  if (!schedule) return null
  if (schedule.shift_type === 'fixed') return schedule.shifts[0]

  const weeksSinceStart = Math.floor(
    (Date.now() - new Date(schedule.start_date).getTime()) /
      (1000 * 60 * 60 * 24 * 7)
  )
  const nextIndex = (weeksSinceStart + 1) % schedule.shifts.length
  return schedule.shifts[nextIndex]
}

export function getShiftStartTime(
  schedule: WorkSchedule | null,
  offsetMinutes: number
): string {
  const shift = getCurrentShift(schedule)
  if (!shift) return '07:00'

  const [h, m] = shift.start.split(':').map(Number)
  const totalMins = h * 60 + m - offsetMinutes
  const hh = Math.floor(((totalMins % 1440) + 1440) % 1440 / 60)
  const mm = ((totalMins % 60) + 60) % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

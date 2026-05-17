export function isToday(dateStr?: string): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

export function isPast(dateStr?: string): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

export function formatDateGr(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('el-GR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTimeGr(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('el-GR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeGr(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'μόλις τώρα'
  if (mins < 60) return `${mins} λεπτά πριν`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ώρες πριν`
  const days = Math.floor(hours / 24)
  return `${days} μέρες πριν`
}

export function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

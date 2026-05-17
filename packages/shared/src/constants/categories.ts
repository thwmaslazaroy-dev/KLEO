import type { Category } from '../types'

export const CATEGORIES: Record<Category, { label: string; emoji: string; color: string }> = {
  university: { label: 'Σχολή',       emoji: '📚', color: '#6366f1' },
  bills:      { label: 'Λογαριασμοί', emoji: '💰', color: '#f59e0b' },
  projects:   { label: 'Projects',    emoji: '🚀', color: '#10b981' },
  clients:    { label: 'Πελάτες',     emoji: '👥', color: '#3b82f6' },
  work:       { label: 'Εργασία',     emoji: '💼', color: '#0ea5e9' },
  misc:       { label: 'Λοιπά',       emoji: '📌', color: '#8b5cf6' },
}

export const MOOD_LABELS = {
  1: { label: 'Πολύ κακά',  emoji: '😔' },
  2: { label: 'Κακά',       emoji: '😕' },
  3: { label: 'Μέτρια',     emoji: '😐' },
  4: { label: 'Καλά',       emoji: '🙂' },
  5: { label: 'Εξαιρετικά', emoji: '😄' },
} as const

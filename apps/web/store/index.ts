import { create } from 'zustand'
import type { Task, Profile } from '@kleo/shared'

interface KleoStore {
  profile: Profile | null
  tasks: Task[]
  isOnline: boolean
  quickCaptureOpen: boolean
  chatOpen: boolean

  setProfile: (profile: Profile | null) => void
  setTasks: (tasks: Task[]) => void
  setOnline: (v: boolean) => void
  setQuickCaptureOpen: (v: boolean) => void
  setChatOpen: (v: boolean) => void

  addTask: (task: Task) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  removeTask: (id: string) => void
}

export const useKleoStore = create<KleoStore>((set) => ({
  profile: null,
  tasks: [],
  isOnline: true,
  quickCaptureOpen: false,
  chatOpen: false,

  setProfile: (profile) => set({ profile }),
  setTasks: (tasks) => set({ tasks }),
  setOnline: (isOnline) => set({ isOnline }),
  setQuickCaptureOpen: (quickCaptureOpen) => set({ quickCaptureOpen }),
  setChatOpen: (chatOpen) => set({ chatOpen }),

  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
}))

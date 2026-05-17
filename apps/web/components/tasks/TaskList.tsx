'use client'

import { useState } from 'react'
import TaskCard from './TaskCard'
import type { Task } from '@kleo/shared'

interface TaskListProps {
  tasks: Task[]
  userId: string
  showOverdueBadge?: boolean
}

export default function TaskList({ tasks: initialTasks, showOverdueBadge }: TaskListProps) {
  const [tasks, setTasks] = useState(initialTasks)

  function handleUpdate(id: string, patch: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  if (tasks.length === 0) return null

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          showOverdueBadge={showOverdueBadge}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}

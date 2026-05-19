import type { Task } from '../types'

export function processRollovers(tasks: Task[]): Task[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return tasks.map((task) => {
    if (task.status === 'pending' && task.due_date && new Date(task.due_date) < today) {
      return {
        ...task,
        rolled_over: true,
        overdue_days: Math.floor(
          (today.getTime() - new Date(task.original_due_date ?? task.due_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }
    }
    return task
  })
}

export function sortTodayTasks(tasks: Task[]): Task[] {
  const overdue = tasks
    .filter((t) => t.overdue_days > 0)
    .sort((a, b) => b.overdue_days - a.overdue_days)

  const today = tasks
    .filter((t) => t.overdue_days === 0)
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  return [...overdue, ...today]
}

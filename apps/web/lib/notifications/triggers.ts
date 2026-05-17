import { createClient } from '@/lib/supabase/server'

export async function scheduleTaskReminder(
  taskId: string,
  reminderAt: string
) {
  const supabase = await createClient()
  await supabase
    .from('tasks')
    .update({ reminder_at: reminderAt, reminder_sent: false })
    .eq('id', taskId)
}

export async function scheduleEventReminder(
  eventId: string,
  reminderAt: string
) {
  const supabase = await createClient()
  await supabase
    .from('events')
    .update({ reminder_at: reminderAt, reminder_sent: false })
    .eq('id', eventId)
}

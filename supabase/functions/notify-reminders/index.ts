import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async () => {
  const now = new Date().toISOString()

  // Tasks με reminder
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, user_id, profiles(expo_push_token, notification_push, notification_email)')
    .lte('reminder_at', now)
    .eq('reminder_sent', false)
    .eq('archived', false)

  // Events με reminder
  const { data: events } = await supabase
    .from('events')
    .select('id, title, user_id, profiles(expo_push_token, notification_push, notification_email)')
    .lte('reminder_at', now)
    .eq('reminder_sent', false)
    .eq('archived', false)

  const items = [...(tasks ?? []), ...(events ?? [])]

  for (const item of items) {
    const profile = (item as Record<string, unknown>).profiles as {
      expo_push_token?: string
      notification_push?: boolean
      notification_email?: boolean
    }

    if (profile?.notification_push && profile.expo_push_token) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: profile.expo_push_token,
          title: 'Kleo',
          body: `Υπενθύμιση: ${item.title}`,
          data: { id: item.id },
        }),
      })
    }

    // Mark sent
    const table = 'due_date' in item ? 'tasks' : 'events'
    await supabase
      .from(table)
      .update({ reminder_sent: true })
      .eq('id', item.id)
  }

  return new Response(JSON.stringify({ processed: items.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

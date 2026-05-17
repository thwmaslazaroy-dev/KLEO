import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async () => {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, expo_push_token, notification_push')
    .eq('notification_push', true)
    .not('expo_push_token', 'is', null)

  if (!profiles) return new Response('no profiles', { status: 200 })

  const pushes = profiles.map((p) =>
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: p.expo_push_token,
        title: 'Kleo — Weekly Review',
        body: 'Έλα να δούμε την εβδομάδα μαζί 📊',
        data: { type: 'weekly_review' },
      }),
    })
  )

  await Promise.all(pushes)

  return new Response(JSON.stringify({ sent: profiles.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

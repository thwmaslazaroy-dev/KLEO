import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ThoughtStream from '@/components/thoughts/ThoughtStream'
import type { Thought } from '@kleo/shared'

export default async function ThoughtsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('thoughts')
    .select('*')
    .eq('user_id', user.id)
    .eq('archived', false)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Σκέψεις</h1>
        <p className="text-muted text-sm mt-1">Ό,τι σου περνάει από το μυαλό — χωρίς κρίση.</p>
      </div>
      <ThoughtStream userId={user.id} initialThoughts={(data ?? []) as Thought[]} />
    </div>
  )
}

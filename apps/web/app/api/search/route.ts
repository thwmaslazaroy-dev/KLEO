import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const q = req.nextUrl.searchParams.get('q')?.trim()
    if (!q || q.length < 2) return NextResponse.json({ data: { tasks: [], notes: [], thoughts: [], journal: [] } })

    const uid = user.id
    const like = `%${q}%`

    const [{ data: tasks }, { data: notes }, { data: thoughts }, { data: journal }] =
      await Promise.all([
        supabase.from('tasks').select('id, title, category, status, priority, due_date')
          .eq('user_id', uid).eq('archived', false)
          .ilike('title', like).limit(10),
        supabase.from('notes').select('id, title, content, category, updated_at')
          .eq('user_id', uid).eq('archived', false)
          .or(`title.ilike.${like},content.ilike.${like}`).limit(10),
        supabase.from('thoughts').select('id, content, category, created_at')
          .eq('user_id', uid).eq('archived', false)
          .ilike('content', like).limit(10),
        supabase.from('journal_entries').select('id, date, content, mood')
          .eq('user_id', uid)
          .ilike('content', like).limit(5),
      ])

    return NextResponse.json({ data: { tasks: tasks ?? [], notes: notes ?? [], thoughts: thoughts ?? [], journal: journal ?? [] } })
  } catch (error) {
    console.error('[search]:', error)
    return NextResponse.json({ error: 'Κάτι πήγε στραβά' }, { status: 500 })
  }
}

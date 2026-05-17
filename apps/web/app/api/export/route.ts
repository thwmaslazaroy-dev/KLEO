import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const uid = user.id

    const [
      { data: profile },
      { data: tasks },
      { data: events },
      { data: notes },
      { data: thoughts },
      { data: goals },
      { data: goalSteps },
      { data: journal },
      { data: contacts },
      { data: alarms },
      { data: schedules },
    ] = await Promise.all([
      supabase.from('profiles').select('full_name, timezone, shift_type, theme, created_at').eq('id', uid).single(),
      supabase.from('tasks').select('*').eq('user_id', uid),
      supabase.from('events').select('*').eq('user_id', uid),
      supabase.from('notes').select('*').eq('user_id', uid),
      supabase.from('thoughts').select('*').eq('user_id', uid),
      supabase.from('goals').select('*').eq('user_id', uid),
      supabase.from('goal_steps').select('*').eq('user_id', uid),
      supabase.from('journal_entries').select('*').eq('user_id', uid),
      supabase.from('contacts').select('*').eq('user_id', uid),
      supabase.from('alarms').select('*').eq('user_id', uid),
      supabase.from('work_schedules').select('*').eq('user_id', uid),
    ])

    const backup = {
      kleo_export: true,
      version: '1.0',
      exported_at: new Date().toISOString(),
      user: { id: uid, ...profile },
      data: {
        tasks:          tasks          ?? [],
        events:         events         ?? [],
        notes:          notes          ?? [],
        thoughts:       thoughts       ?? [],
        goals:          goals          ?? [],
        goal_steps:     goalSteps      ?? [],
        journal:        journal        ?? [],
        contacts:       contacts       ?? [],
        alarms:         alarms         ?? [],
        work_schedules: schedules      ?? [],
      },
    }

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type':        'application/json',
        'Content-Disposition': `attachment; filename="kleo-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('[export]:', error)
    return NextResponse.json({ error: 'Κάτι πήγε στραβά' }, { status: 500 })
  }
}

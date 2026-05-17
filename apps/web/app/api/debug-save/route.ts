import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({
      auth: 'FAIL — not authenticated',
      authError: authError?.message,
    })
  }

  const results: Record<string, unknown> = { auth: `OK — user: ${user.id}` }

  // ── TASK ──────────────────────────────────────────────
  const taskPayload = {
    user_id: user.id,
    title: '__diag_test_task__',
    category: 'misc',
    priority: 'medium',
    status: 'pending',
  }
  const { data: taskData, error: taskError } = await supabase
    .from('tasks').insert(taskPayload).select('id').single()

  results.task = taskError
    ? { ok: false, code: taskError.code, msg: taskError.message, detail: taskError.details }
    : { ok: true, id: taskData?.id }

  // cleanup
  if (taskData?.id) await supabase.from('tasks').delete().eq('id', taskData.id)

  // ── JOURNAL ───────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0]
  const journalPayload = {
    user_id: user.id, date: today,
    content: '__diag_test__', mood: 3,
  }
  const { data: jData, error: jError } = await supabase
    .from('journal_entries')
    .upsert(journalPayload, { onConflict: 'user_id,date' })
    .select('id').single()

  results.journal = jError
    ? { ok: false, code: jError.code, msg: jError.message, detail: jError.details }
    : { ok: true, id: jData?.id }

  if (jData?.id) await supabase.from('journal_entries').delete().eq('id', jData.id)

  // ── EVENT ─────────────────────────────────────────────
  const eventPayload = {
    user_id: user.id,
    title: '__diag_test_event__',
    category: 'misc',
    start_at: new Date().toISOString(),
  }
  const { data: evData, error: evError } = await supabase
    .from('events').insert(eventPayload).select('id').single()

  results.event = evError
    ? { ok: false, code: evError.code, msg: evError.message, detail: evError.details }
    : { ok: true, id: evData?.id }

  if (evData?.id) await supabase.from('events').delete().eq('id', evData.id)

  // ── ALARM ─────────────────────────────────────────────
  const alarmPayload = {
    user_id: user.id, time: '08:00',
    label: '__diag_test__', enabled: false,
    smart_alarm: false, shift_offset_minutes: 0,
    snooze_minutes: 9, vibrate: true,
  }
  const { data: alData, error: alError } = await supabase
    .from('alarms').insert(alarmPayload).select('id').single()

  results.alarm = alError
    ? { ok: false, code: alError.code, msg: alError.message, detail: alError.details }
    : { ok: true, id: alData?.id }

  if (alData?.id) await supabase.from('alarms').delete().eq('id', alData.id)

  // ── NOTE ──────────────────────────────────────────────
  const notePayload = {
    user_id: user.id, content: '__diag_test__', category: 'misc',
  }
  const { data: nData, error: nError } = await supabase
    .from('notes').insert(notePayload).select('id').single()

  results.note = nError
    ? { ok: false, code: nError.code, msg: nError.message, detail: nError.details }
    : { ok: true, id: nData?.id }

  if (nData?.id) await supabase.from('notes').delete().eq('id', nData.id)

  // ── THOUGHT ───────────────────────────────────────────
  const { data: thData, error: thError } = await supabase
    .from('thoughts').insert({ user_id: user.id, content: '__diag__', category: 'misc' }).select('id').single()

  results.thought = thError
    ? { ok: false, code: thError.code, msg: thError.message }
    : { ok: true, id: thData?.id }

  if (thData?.id) await supabase.from('thoughts').delete().eq('id', thData.id)

  // ── PROFILE READ ──────────────────────────────────────
  const { data: profData, error: profError } = await supabase
    .from('profiles').select('id, full_name').eq('id', user.id).single()

  results.profile_read = profError
    ? { ok: false, code: profError.code, msg: profError.message }
    : { ok: true, name: profData?.full_name }

  const allOk = Object.entries(results)
    .filter(([k]) => k !== 'auth')
    .every(([, v]) => (v as { ok?: boolean }).ok)

  return NextResponse.json({ allOk, results }, { status: allOk ? 200 : 207 })
}

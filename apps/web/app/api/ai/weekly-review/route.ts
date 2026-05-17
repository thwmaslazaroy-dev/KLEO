import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini/client'
import { buildUserContext } from '@/lib/gemini/context'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const context = await buildUserContext(user.id)
    const response = await callGemini({
      type: 'weekly_review',
      userMessage: 'Κάνε την εβδομαδιαία ανασκόπηση.',
      context,
    })

    await supabase.from('ai_interactions').insert({
      user_id: user.id,
      type: 'weekly_review',
      response,
    })

    return NextResponse.json({ data: response })
  } catch (error) {
    console.error('[ai/weekly-review]:', error)
    return NextResponse.json({ error: 'Κάτι πήγε στραβά' }, { status: 500 })
  }
}

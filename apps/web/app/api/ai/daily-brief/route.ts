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
    const now = new Date()
    const greeting = `Είναι ${now.toLocaleString('el-GR')}. Τι έχω σήμερα;`

    const response = await callGemini({ type: 'daily_brief', userMessage: greeting, context })

    await supabase.from('ai_interactions').insert({
      user_id: user.id,
      type: 'daily_brief',
      prompt: greeting,
      response,
    })

    return NextResponse.json({ data: response })
  } catch (error) {
    console.error('[ai/daily-brief]:', error)
    return NextResponse.json({ error: 'Κάτι πήγε στραβά' }, { status: 500 })
  }
}

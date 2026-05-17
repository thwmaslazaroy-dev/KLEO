import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini/client'
import { buildUserContext } from '@/lib/gemini/context'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    console.log('[daily-brief] GEMINI_API_KEY set:', !!process.env.GEMINI_API_KEY)

    const context = await buildUserContext(user.id)
    console.log('[daily-brief] context built for user:', user.id)

    const now = new Date()
    const greeting = `Είναι ${now.toLocaleString('el-GR')}. Τι έχω σήμερα;`

    const response = await callGemini({ type: 'daily_brief', userMessage: greeting, context })
    console.log('[daily-brief] response length:', response.length)

    await supabase.from('ai_interactions').insert({
      user_id: user.id,
      type: 'daily_brief',
      prompt: greeting,
      response,
    })

    return NextResponse.json({ data: response })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[ai/daily-brief] ERROR:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

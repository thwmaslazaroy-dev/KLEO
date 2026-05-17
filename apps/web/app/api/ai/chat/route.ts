import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini/client'
import { buildUserContext } from '@/lib/gemini/context'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message } = await req.json() as { message: string }
    if (!message?.trim()) return NextResponse.json({ error: 'Χρειάζεται μήνυμα' }, { status: 400 })

    const context = await buildUserContext(user.id)
    const response = await callGemini({ type: 'chat', userMessage: message, context })

    await supabase.from('ai_interactions').insert({
      user_id: user.id,
      type: 'chat',
      prompt: message,
      response,
    })

    return NextResponse.json({ data: response })
  } catch (error) {
    console.error('[ai/chat]:', error)
    return NextResponse.json({ error: 'Κάτι πήγε στραβά' }, { status: 500 })
  }
}

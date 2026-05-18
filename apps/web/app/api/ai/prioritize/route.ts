export const dynamic = 'force-dynamic'

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
      type: 'prioritize',
      userMessage: 'Ποια 3 tasks να κάνω σήμερα;',
      context,
    })

    return NextResponse.json({ data: response })
  } catch (error) {
    console.error('[ai/prioritize]:', error)
    return NextResponse.json({ error: 'Κάτι πήγε στραβά' }, { status: 500 })
  }
}

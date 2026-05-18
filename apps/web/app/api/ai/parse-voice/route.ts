export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callGemini } from '@/lib/gemini/client'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { transcript } = await req.json() as { transcript: string }
    if (!transcript?.trim()) return NextResponse.json({ error: 'Χρειάζεται transcript' }, { status: 400 })

    const raw = await callGemini({ type: 'parse_voice', userMessage: transcript })

    // Gemini should return raw JSON — parse it
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Δεν ήταν δυνατή η ανάλυση της φωνητικής εντολής')

    const parsed = JSON.parse(jsonMatch[0]) as {
      title: string
      category: string
      priority: string
      due_date: string | null
      reminder_at: string | null
    }

    return NextResponse.json({ data: parsed })
  } catch (error) {
    console.error('[api/ai/parse-voice]:', error)
    return NextResponse.json({ error: 'Κάτι πήγε στραβά' }, { status: 500 })
  }
}

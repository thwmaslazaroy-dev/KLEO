import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    GEMINI_API_KEY_SET: !!process.env.GEMINI_API_KEY,
    GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY?.length ?? 0,
    SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  })
}

import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

/**
 * Connectivity check for the Supabase wiring: GET /api/health/supabase.
 * Confirms the env vars are present and that the project answers auth calls.
 * A signed-out visitor is expected — `user: null` with ok:true is a pass.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    // "Auth session missing" just means nobody is signed in; the round-trip worked.
    if (error && error.name !== 'AuthSessionMissingError') {
      console.error('[health] Supabase auth check failed', error)
      return NextResponse.json({ ok: false }, { status: 502 })
    }

    return NextResponse.json({
      ok: true,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      user: data.user?.id ?? null,
    })
  } catch (err) {
    // Log the detail on the server only: this route is public, and error text can expose config.
    console.error('[health] Supabase check threw', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

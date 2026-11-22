import { NextResponse } from 'next/server'
import { createSessionClient, supabaseConfigured } from '../../../lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (supabaseConfigured()) {
    try {
      const supabase = await createSessionClient()
      await supabase.auth.signOut()
    } catch { /* signing out is best-effort */ }
  }
  return NextResponse.redirect(new URL('/', request.url), { status: 303 })
}

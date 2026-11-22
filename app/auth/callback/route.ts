import { NextResponse } from 'next/server'
import { createSessionClient, supabaseConfigured } from '../../../lib/supabase/server'

export const runtime = 'nodejs'

// Completes the magic-link sign-in by exchanging the one-time code for a
// session cookie, then sends the administrator to the dashboard.
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next')
  const destination = next && next.startsWith('/admin') ? next : '/admin'

  if (code && supabaseConfigured()) {
    try {
      const supabase = await createSessionClient()
      await supabase.auth.exchangeCodeForSession(code)
    } catch {
      return NextResponse.redirect(new URL('/sign-in', url.origin))
    }
  }
  return NextResponse.redirect(new URL(destination, url.origin))
}

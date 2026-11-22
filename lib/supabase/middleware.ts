import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseConfigured } from './server'

// Refreshes the auth session cookie and blocks unauthenticated requests to
// protected routes. Admin membership is enforced separately in the /admin
// layout and admin API handlers; the database remains the final authority.
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname
  const protectedRoute = path.startsWith('/admin') || path.startsWith('/api/admin')

  if (!supabaseConfigured()) {
    return protectedRoute ? new NextResponse('Not found', { status: 404 }) : NextResponse.next()
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: list => {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (protectedRoute && !user) {
    if (path.startsWith('/api/')) return NextResponse.json({ message: 'Not found.' }, { status: 404 })
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    url.search = '?next=' + encodeURIComponent(path)
    return NextResponse.redirect(url)
  }
  if (path === '/sign-in' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }
  return response
}

import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { createServiceClient, createSessionClient, supabaseConfigured } from '../../lib/supabase/server'

export const metadata = { title: 'Administration', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

// Final application-layer gate for every /admin page: requires a signed-in
// user who is listed in admin_users. Middleware handles unauthenticated
// visitors; this enforces membership. RLS is the last line of defense.
async function requireAdmin() {
  if (!supabaseConfigured()) notFound()
  const supabase = await createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')
  try {
    const service = createServiceClient()
    const { data } = await service
      .from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle()
    if (!data) notFound()
  } catch {
    notFound()
  }
  return user
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin()
  return <>
    <section className="wrap" style={{ paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '1rem' }}>
      <p className="kicker" style={{ margin: 0 }}>Administration · {user.email}</p>
      <form action="/auth/sign-out" method="post"><button className="button secondary" type="submit">Sign Out</button></form>
    </section>
    {children}
  </>
}

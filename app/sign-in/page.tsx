'use client'
import { useState, type FormEvent } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function SignIn() {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
    if (!email) return
    setBusy(true)
    setMessage('')
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + '/auth/callback' },
      })
      setMessage(error
        ? 'We could not send the sign-in link. Please try again.'
        : 'Check your email for the sign-in link.')
    } catch {
      setMessage('We could not send the sign-in link. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="wrap page-content" style={{ paddingTop: '4rem' }}>
    <h1>Administrator sign-in</h1>
    <p>Enter your administrator email address. We will send you a one-time sign-in link.</p>
    {configured
      ? <form onSubmit={submit}>
          <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
          <button className="button" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send Sign-in Link'}</button>
          <p role="status">{message}</p>
        </form>
      : <p role="status">Administration is not configured for this deployment.</p>}
  </section>
}

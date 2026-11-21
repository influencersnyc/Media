'use client'
import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { products, publications } from '../content/network'

export type FormKind = 'inquiries' | 'contact' | 'newsletter'
export function SubmissionForm({ kind, publication, topic }: { kind: FormKind; publication?: string; topic?: string }) {
  const statusId = useId()
  const sending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending.current) return
    const form = event.currentTarget
    const data = new FormData(form)
    if (kind === 'inquiries' && !data.getAll('publications').length) {
      setMessage('Select at least one publication or Network-wide.')
      return
    }
    sending.current = true
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/' + kind, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(data), publications: data.getAll('publications') }),
      })
      const result = await response.json() as { message: string }
      if (response.ok) form.reset()
      setMessage(result.message)
    } catch {
      setMessage('The form could not connect. Please try again.')
    } finally {
      sending.current = false
      setBusy(false)
    }
  }

  return <form action={'/api/' + kind} method="post" onSubmit={submit} aria-describedby={statusId}>
    <div className="trap" aria-hidden="true"><label>Leave blank<input name="companyFax" tabIndex={-1} autoComplete="off" /></label></div>
    {kind === 'inquiries' && <label>Company name<input name="company" autoComplete="organization" maxLength={160} required /></label>}
    {kind !== 'newsletter' && <label>{kind === 'inquiries' ? 'Contact name' : 'Name'}<input name="name" autoComplete="name" maxLength={120} required /></label>}
    <label>{kind === 'inquiries' ? 'Business email' : 'Email address'}<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
    {kind === 'inquiries' && <>
      <label>Company website<input name="website" type="url" autoComplete="url" placeholder="https://" maxLength={500} required /></label>
      <label>Advertising objective<textarea name="objective" maxLength={2000} required /></label>
      <fieldset><legend>Interested publications (required)</legend>
        {publications.filter(p => p.status === 'active' && p.advertisingEligible).map(p =>
          <label className="option" key={p.slug}><input type="checkbox" name="publications" value={p.slug} defaultChecked={publication === p.slug} />{p.name}</label>)}
        <label className="option"><input type="checkbox" name="publications" value="network" />Network-wide</label>
      </fieldset>
      <label>Preferred advertising format<select name="format" required defaultValue=""><option value="" disabled>Select a format</option>{products.map(([name]) => <option key={name}>{name}</option>)}</select></label>
      <label>Proposed budget (USD)<input name="budget" type="number" min="1" max="100000000" step="0.01" required /></label>
      <label>Desired campaign start date<input name="start" type="date" required /></label>
      <label>Campaign duration<input name="duration" maxLength={100} placeholder="For example, 4 weeks" required /></label>
    </>}
    {kind === 'contact' && <label>Subject<input name="subject" defaultValue={topic} maxLength={160} required /></label>}
    {kind !== 'newsletter' && <label>{kind === 'inquiries' ? 'Additional information (optional)' : 'Message'}<textarea name="message" maxLength={4000} required={kind === 'contact'} /></label>}
    {kind === 'newsletter' && <label className="option"><input type="checkbox" name="consent" value="yes" required />I agree to receive network updates by email.</label>}
    <Link href="/privacy" className="underline justify-self-start">Privacy Policy</Link>
    <button className="button" type="submit" disabled={busy}>{busy ? 'Submitting…' : kind === 'newsletter' ? 'Subscribe' : 'Send ' + (kind === 'inquiries' ? 'Inquiry' : 'Message')}</button>
    <p id={statusId} role="status">{message}</p>
  </form>
}

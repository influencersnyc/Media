import { createHmac } from 'node:crypto'
import { z } from 'zod'
import { products, publications } from '../content/network'

const requiredText = (max: number) => z.string().trim().min(1).max(max)
const email = z.string().trim().toLowerCase().max(254).pipe(z.email())
const eligible = new Set(['network', ...publications.filter(p => p.advertisingEligible && p.status === 'active').map(p => p.slug)])
const schemas = {
  inquiries: z.object({
    company: requiredText(160), name: requiredText(120), email,
    website: z.url({ protocol: /^https?$/ }).max(500),
    objective: requiredText(2000),
    publications: z.array(z.string().refine(slug => eligible.has(slug))).min(1).max(eligible.size).transform(values => [...new Set(values)].sort()),
    format: z.string().refine(value => products.some(([name]) => name === value)),
    budget: z.string().regex(/^\d{1,9}(\.\d{1,2})?$/).transform(Number).pipe(z.number().min(1).max(100000000)),
    start: z.iso.date(),
    duration: requiredText(100), message: z.string().trim().max(4000).default(''),
  }),
  contact: z.object({ name: requiredText(120), email, subject: requiredText(160), message: requiredText(4000) }),
  newsletter: z.object({ email, consent: z.literal('yes') }),
}

type Kind = keyof typeof schemas
type Payload = z.output<(typeof schemas)[Kind]>

function json(message: string, status = 200) {
  return Response.json({ message }, { status })
}

async function readSubmission(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) return null
  const decoder = new TextDecoder()
  let length = 0
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    length += value.byteLength
    if (length > 24_000) {
      await reader.cancel()
      return null
    }
    text += decoder.decode(value, { stream: true })
  }
  text += decoder.decode()
  if (request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) {
    const values = new URLSearchParams(text)
    return { ...Object.fromEntries(values), publications: values.getAll('publications') }
  }
  return JSON.parse(text) as unknown
}

async function sendEmail(key: string, from: string, to: string, subject: string, text: string, token: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify({ from, to: [to], subject, text }),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error('Email delivery request failed')
}

export async function handleSubmission(request: Request, kind: string) {
  if (!Object.hasOwn(schemas, kind)) return json('Form not found.', 404)
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (origin && origin !== 'https://' + host && origin !== new URL(request.url).origin) {
    return json('This form only accepts submissions from this website.', 403)
  }

  let input: unknown
  try { input = await readSubmission(request) } catch { return json('Invalid submission.', 400) }
  if (typeof input === 'object' && input !== null && 'companyFax' in input && input.companyFax) {
    return json('Thanks for getting in touch.')
  }
  const parsed = schemas[kind as Kind].safeParse(input)
  if (!parsed.success) return json('Check the required fields and try again.', 400)
  const payload: Payload = parsed.data
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FORM_HASH_SECRET, RESEND_API_KEY, MAIL_FROM, MAIL_INBOX } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !FORM_HASH_SECRET ||
      (kind !== 'newsletter' && (!RESEND_API_KEY || !MAIL_FROM || !MAIL_INBOX))) {
    const required = { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FORM_HASH_SECRET,
      ...(kind !== 'newsletter' ? { RESEND_API_KEY, MAIL_FROM, MAIL_INBOX } : {}) }
    console.error('Form configuration is incomplete', {
      kind, missing: Object.keys(required).filter(name => !required[name as keyof typeof required]),
    })
    return json('This form is temporarily unavailable. Please try again later.', 503)
  }

  const hash = (value: string) => createHmac('sha256', FORM_HASH_SECRET).update(value).digest('hex')
  const fingerprint = hash(kind + ':' + (kind === 'newsletter' ? payload.email : JSON.stringify(payload)))
  const source = process.env.VERCEL ? request.headers.get('x-real-ip') : null
  const clientKey = hash(source ?? 'local:' + payload.email)
  const base = SUPABASE_URL.replace(/\/$/, '') + '/rest/v1'
  const headers = new Headers({ apikey: SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json' })
  // Legacy service-role keys are JWTs. New secret keys are handled by the API gateway.
  if (!SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_secret_')) {
    headers.set('Authorization', 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY)
  }
  try {
    const stored = await fetch(base + '/rpc/receive_submission', {
      method: 'POST', headers,
      body: JSON.stringify({ form_kind: kind, dedupe_key: fingerprint, client_key: clientKey, submitted_payload: payload }),
      signal: AbortSignal.timeout(8000),
    })
    if (!stored.ok) throw new Error('Submission storage failed')
    const record = await stored.json() as { limited?: boolean; id?: string; delivered?: boolean }
    if (record.limited) return json('Too many requests. Please try again later.', 429)
    if (!record.id) throw new Error('Submission ID missing')
    if (!record.delivered && kind !== 'newsletter' && MAIL_FROM && MAIL_INBOX && RESEND_API_KEY) {
      await sendEmail(record.id + '/internal', MAIL_FROM, MAIL_INBOX,
        kind === 'inquiries' ? 'New advertising inquiry' : 'New contact message',
        'A submission is pending review.\n\n' + JSON.stringify(payload, null, 2), RESEND_API_KEY)
      if (kind === 'inquiries') {
        await sendEmail(record.id + '/ack', MAIL_FROM, payload.email, 'We received your Influencers.NYC inquiry',
          'Thank you for your advertising inquiry. Our team will review your campaign details and follow up about availability and pricing.', RESEND_API_KEY)
      }
      const marked = await fetch(base + '/form_submissions?id=eq.' + record.id, {
        method: 'PATCH', headers, body: JSON.stringify({ notified_at: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      })
      if (!marked.ok) throw new Error('Could not record email delivery')
    }
    return json(kind === 'newsletter' ? 'You’re subscribed to network updates.' : 'Thanks. We’ve received your submission.')
  } catch {
    return json('We couldn’t confirm your submission. Please try again.', 503)
  }
}

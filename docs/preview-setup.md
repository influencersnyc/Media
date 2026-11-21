# Preview Deployment Runbook

Repeatable setup for a Vercel preview deployment of Influencers.NYC with a
dedicated Supabase preview project. Production deployment requires separate
approval — do not configure Production environment variables from this runbook.

## 1. Supabase preview project

1. Create a new Supabase project dedicated to preview (for example,
   `influencers-nyc-preview`). Keep it separate from any future production
   project.
2. Open the SQL Editor and run the full contents of
   `supabase/migrations/20261121000000_form_intake.sql`. This creates
   `form_submissions`, `form_rate_limits`, and the `receive_submission`
   function; enables row-level security; and restricts access to the service
   role.
3. From Project Settings → API, copy:
   - Project URL → `SUPABASE_URL`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
     (both legacy JWT keys and new `sb_secret_` keys are supported)

## 2. Resend sender

1. Verify the sending domain or address (for example, `hello@influencers.nyc`)
   → `MAIL_FROM`.
2. Create an API key with sending permission → `RESEND_API_KEY`.
3. Choose the internal review inbox → `MAIL_INBOX`.

## 3. Vercel project and environment variables

1. Add New → Project → import `influencersnyc/Media`. Keep the Next.js
   framework preset (already pinned in `vercel.json`) and deploy.
2. Project Settings → Environment Variables — add the following, scoped to
   **Preview** only:

   | Variable | Source | Notes |
   |---|---|---|
   | `SUPABASE_URL` | Step 1 | |
   | `SUPABASE_SERVICE_ROLE_KEY` | Step 1 | Server-side only; never `NEXT_PUBLIC_` |
   | `FORM_HASH_SECRET` | generate | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `RESEND_API_KEY` | Step 2 | |
   | `MAIL_FROM` | Step 2 | Verified Resend sender |
   | `MAIL_INBOX` | Step 2 | Team review address |
   | `NEXT_PUBLIC_ENABLE_ANALYTICS` | `false` | Set `true` only after confirming the analytics policy |

3. Redeploy so the variables take effect.

Secrets must never be committed. The repository `.gitignore` already excludes
`.env*` files except `.env.example`.

## 4. Controlled test inquiry

Run these checks on the preview URL after each configuration change:

1. **Advertising inquiry** — submit `/advertise/inquire` with a test address
   you control. Verify all three:
   - a row in Supabase `form_submissions` with `status = pending_review`
   - the internal notification delivered to `MAIL_INBOX`
   - the acknowledgment email delivered to the advertiser address
2. **Deduplication** — resubmit the identical inquiry. Expect no new row (the
   `unique (kind, fingerprint)` constraint), with notification delivery
   retried against the same record.
3. **Contact and newsletter** — test separately. Newsletter submissions store
   consent with `subscribed` status and send no email.
4. **Rate limiting** — more than 8 submissions within 15 minutes from one
   source returns "Too many requests."
5. **Retrieval** — confirm pending inquiries are visible in the Supabase
   dashboard. This is the manual review workflow until Phase 2 adds the admin
   interface.

If configuration is missing or invalid, forms respond with "temporarily
unavailable" rather than an error page; the missing variable names are logged
server-side (values are never logged).

## 5. Remaining manual checks before production approval

- **Responsive pass** — spot-check the hero, publication cards, forms, and the
  mobile menu at phone, tablet, and desktop widths.
- **Accessibility pass** — keyboard-tab the navigation, theme toggle, and
  forms (visible focus rings); run a Lighthouse accessibility scan.
- **Policy pages** — privacy, terms, advertising disclosure, and editorial
  standards are initial drafts for review before production.
- **Analytics** — enable only after confirming the site policy and Vercel
  configuration.
- **Production gate** — production deployment requires explicit approval,
  separate from development and preview testing.

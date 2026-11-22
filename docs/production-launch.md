# Production Launch Checklist

Launching https://influencers.nyc requires explicit approval. Complete every
item before attaching the domain. Preview procedure: docs/preview-setup.md.

## 1. Approval gate

- [ ] Production launch explicitly approved (required by the development
      specification; preview testing alone is not approval).
- [ ] Policy pages reviewed for production: privacy, terms, advertising
      disclosure, editorial standards.
- [ ] Vercel deployment protection plan confirmed (SSO off for the public
      site; bypass tokens revoked or rotated).

## 2. Production services

- [ ] Create a dedicated **production** Supabase project (separate from
      preview) and apply `supabase/migrations/`.
- [ ] Generate a **new** `FORM_HASH_SECRET` (never reuse the preview value):
      `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Confirm the Resend sending domain is verified for production mail and
      `MAIL_FROM` / `MAIL_INBOX` are the intended production addresses.
- [ ] Decide on analytics: set `NEXT_PUBLIC_ENABLE_ANALYTICS` deliberately,
      not by default.

## 3. Vercel production environment

- [ ] Set all environment variables for the **Production** environment:
      `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FORM_HASH_SECRET`,
      `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_INBOX`,
      `NEXT_PUBLIC_ENABLE_ANALYTICS`.
- [ ] Confirm service-role and Stripe-type secrets remain server-only (no
      `NEXT_PUBLIC_` prefix).
- [ ] Confirm the production branch and auto-deploy behavior are intentional.

## 4. Domain

- [ ] Add `influencers.nyc` (and `www` if desired) in Vercel → Domains.
- [ ] Create the DNS records Vercel provides (A record for the apex and/or
      CNAME for `www`) at the domain registrar.
- [ ] Wait for DNS propagation and Vercel SSL certificate issuance; verify
      HTTPS loads with a valid certificate.

## 5. Post-launch verification (on https://influencers.nyc)

- [ ] All routes return 200; unknown paths 404.
- [ ] `robots.txt` allows crawling of pages and disallows `/api/`;
      `sitemap.xml` serves production URLs.
- [ ] No `noindex` meta on any page (production builds omit it).
- [ ] Canonical URLs and OG tags point at `https://influencers.nyc`.
- [ ] Submit one controlled inquiry and one contact message; confirm the
      Supabase rows, internal notifications, and the advertiser
      acknowledgment; then delete the test rows.
- [ ] Confirm form failures degrade to "temporarily unavailable" (never an
      error page) if configuration is missing.
- [ ] Lighthouse accessibility scan on the homepage and one form page.
- [ ] Spot-check phone, tablet, and desktop layouts.

## 6. After launch

- [ ] Purge stale `form_rate_limits` rows on a retention schedule.
- [ ] Set a calendar reminder to review pending inquiries in Supabase until
      the Phase 2 admin interface exists.
- [ ] Rotate any tokens or secrets that were shared during setup.

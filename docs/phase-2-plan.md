# Phase 2 Plan — Advertising Operations

Scope per the development specification: administrator authentication,
inventory management, campaign management, advertiser records, creative asset
review, campaign scheduling, Stripe payments, invoice tracking, managed
placements on eligible publications, and reporting infrastructure.

Phase 2 adds no advertiser self-service (that is Phase 3) and changes nothing
on the public site except where an active placement renders an advertisement.

## 1. Architecture decisions

**Authentication** — Supabase Auth with email magic links. Administrators are
identified by an `admin_users` table (not metadata claims), so access can be
revoked by deleting a row. Next.js middleware protects every `/admin` route
and admin API endpoint; the database remains the final authority through
row-level security policies that check `admin_users`.

**Form intake stays as-is** — `form_submissions` (Phase 1) continues to handle
contact, newsletter, and inquiry intake with deduplication and rate limiting.
Phase 2 *promotes* a reviewed inquiry into an advertiser record and campaign
proposal; the intake row keeps the original submission as received.

**Pricing is operational, not published** — rates live in `ad_placements`
(base price + billing unit) and are copied into `campaign_placements` as
agreed prices, preserving historical pricing per the specification. Nothing in
Phase 2 exposes pricing publicly.

**Payments stay Stripe-hosted** — administrators create a Stripe Checkout
Session (or Payment Link) per campaign; the site never handles card data.
Stripe webhooks (signature-verified) update `payments` and campaign status.

**Metrics are real or absent** — `campaign_metrics` is populated only from an
actual delivery source. Phase 2 provides the table, the reporting queries, and
an import endpoint; it never fabricates impressions or clicks.

## 2. Database migration (new file in supabase/migrations/)

Tables per specification §11, adapted to the existing intake:

- `publications` — mirrors `content/network.ts` records so placements can be
  joined in SQL; the content file stays the editorial source of truth, with a
  sync-on-deploy step or a check constraint keeping slugs aligned.
- `advertisers` (company_name, contact_name, email, website, status)
- `ad_placements` (publication_id, name, placement_type, dimensions,
  base_price, billing_unit, active)
- `campaigns` (advertiser_id, name, start_date, end_date, budget, status)
  with the lifecycle:
  `inquiry → review → proposal → approved → awaiting_payment → scheduled →
  active → completed → archived`, plus `rejected`, `cancelled`, `paused`,
  `payment_failed`.
- `campaign_placements` (campaign_id, placement_id, agreed_price, start_date,
  end_date, status) — the many-to-many bridge that also prevents overlapping
  exclusive bookings via an exclusion constraint on publication, placement,
  and date range.
- `creative_assets` (campaign_id, asset_url, destination_url,
  approval_status) — files in Supabase Storage, bucket private, admins only.
- `payments` (campaign_id, stripe_reference, amount, currency, status)
- `campaign_metrics` (campaign_id, placement_id, date, impressions, clicks)
- `audit_logs` (actor_id, action, entity_type, entity_id, timestamp) — written
  by a helper used in every admin mutation.

RLS: service role and authenticated admins only; no public or anonymous access
to any Phase 2 table. `form_submissions` policies remain unchanged.

Data migration: promote existing reviewed inquiries from `form_submissions`
into `advertisers` + `campaigns` (status `review`) with a one-time SQL script.

## 3. Routes

Admin UI under `/admin` (all middleware-protected, `noindex`):

| Route | Purpose |
|---|---|
| `/admin` | Dashboard: pending inquiries, active campaigns, upcoming schedules |
| `/admin/inquiries` | Review intake; promote inquiry → advertiser + proposal |
| `/admin/advertisers` | Advertiser records and status |
| `/admin/inventory` | Placement catalog per publication; availability |
| `/admin/campaigns` | Campaign list and lifecycle management |
| `/admin/campaigns/[id]` | Detail: placements, creative review, schedule, payment status |
| `/admin/reports` | Delivery reports from `campaign_metrics`; CSV export |

Admin API endpoints under `/api/admin/*` with the same auth check server-side
(defense in depth behind middleware). `/api/stripe/webhook` is the sole
unauthenticated POST endpoint, gated by Stripe signature verification.

## 4. Milestones

**M1 — Auth + schema.** Migration above; `admin_users`; magic-link sign-in
page; middleware; audit helper. Acceptance: a non-admin cannot load any
`/admin` URL or call any admin API; every admin write lands in `audit_logs`.

**M2 — Inventory + advertisers + inquiry review.** Publications and placements
management; advertiser records; inquiry queue with promote/reject.
Acceptance: an inquiry flows to an advertiser + draft campaign without SQL;
overlapping exclusive placements are rejected by the database.

**M3 — Campaign lifecycle + creative review.** Status transitions with guards
(e.g., no `scheduled` without approved creative and a payment record);
scheduling; creative upload and approval. Acceptance: a campaign can walk the
full lifecycle; invalid transitions are refused; pausing an active campaign
takes effect on the placement immediately.

**M4 — Stripe.** Checkout Session creation on `approved`; webhook moves
`awaiting_payment → scheduled` and records `payments`; failures set
`payment_failed`; invoice links surfaced in the admin. Acceptance: Stripe test
mode completes the full flow end-to-end; webhook rejects invalid signatures.

**M5 — Reporting + managed placements.** Metrics import endpoint (manual CSV
or delivery-source API when one exists); `/admin/reports` with CSV export;
placement rendering component for eligible publication pages, driven only by
`active` campaign placements. Acceptance: reports match stored metrics
exactly; no metrics exist without a real source.

## 5. Security requirements carried from the specification

- Server-side validation (zod) on every admin mutation, same pattern as
  Phase 1 forms.
- Stripe webhook signature verification; raw body handling.
- Rate limiting on the sign-in endpoint; audit logging of auth events.
- RLS on every table; storage bucket policies restrict creative assets to
  admins.
- No advertiser data on any public route or in any client bundle.
- Stripe keys: secret key server-only; publishable key only where Checkout
  requires it.

## 6. What Phase 2 deliberately excludes

- Advertiser registration, login, or dashboard (Phase 3).
- Self-service booking, renewals, or automated billing cycles (Phase 3).
- Google Ad Manager integration (later expansion per specification §3).
- Any change to the Silver Circuit website.

## 7. Suggested build order

M1 → M2 → M3 → M4 → M5, each shipped to the preview environment and verified
against its acceptance criteria before the next begins. Stripe work uses test
mode until a separate production approval, mirroring the Phase 1 launch gate.

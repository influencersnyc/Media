# Influencers.NYC

Phase 1 of the Influencers.NYC media network. Silver Circuit is the first publication and has its own independent website.

## Development

Use Node.js 22 or later. Run `npm ci`, then `npm run dev`. Use `npm run build` and `npm run check` to verify the application. The public site builds without service credentials. Form endpoints validate input and report a temporary outage when the necessary configuration is missing.

## Editorial and publication management

Edit `content/network.ts` to add approved articles or publications. Store any approved article images under `public/` and reference them with root-relative paths. The Edit shows the approved coverage categories until an article is added. The publication directory, publication profiles, advertiser choices, and sitemap are generated from the records. The Silver Circuit tile uses site typography pending approved brand assets.

## Preview setup

Use the GitHub Media repository or an explicit Vercel preview deployment. Choose a dedicated Supabase preview project and apply the migration in `supabase/migrations/`. Copy the settings in `.env.example` into Vercel's Preview environment. Generate a stable, random secret for FORM_HASH_SECRET. Configure MAIL_FROM with a verified Resend sender and MAIL_INBOX with the team's review address. Enable analytics only after confirming the site policy and Vercel configuration.

Inquiries and messages are stored server-side with pending-review status. Retrieve them using the Supabase dashboard. Newsletter consent is stored for later mailing-list use. Exact duplicate inquiries share one record. Notifications use Resend idempotency keys. If a notification fails, resubmission retries delivery for the same record. Keep the service-role key server-side and regularly purge stale rate-limit rows according to your retention policy.

Verify a controlled test inquiry in Preview with an authorized recipient. Check the stored row, internal email and advertiser acknowledgment, then repeat to verify deduplication. Check contact and newsletter separately. The policy pages are initial drafts for review before production. Production deployment requires separate approval.

Live billing, ad delivery, user accounts, and campaign operations are later-phase work.

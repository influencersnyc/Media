-- Phase 2, Milestone 1: administrative schema, role-based access, audit log.
-- Apply after 20261121000000_form_intake.sql.
--
-- Supabase Auth setup required for admin sign-in:
--   1. Authentication → URL Configuration: add the site URL and the
--      /auth/callback redirect URL for each environment.
--   2. Create the first admin user in Authentication → Users, then insert
--      their id into admin_users (see the seed comment at the bottom).

create extension if not exists btree_gist;

-- Administrators. Membership grants access to /admin and admin APIs.
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  domain text not null,
  description text not null default '',
  category text not null default '',
  status text not null default 'active' check (status in ('active', 'upcoming', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.advertisers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  website text,
  status text not null default 'prospect' check (status in ('prospect', 'active', 'suspended', 'archived')),
  created_at timestamptz not null default now()
);

create table public.ad_placements (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications (id),
  name text not null,
  placement_type text not null check (placement_type in (
    'homepage_banner', 'article_display', 'sidebar', 'mobile_banner',
    'sponsored_editorial', 'newsletter', 'category_sponsorship', 'network_custom')),
  dimensions text,
  base_price numeric(12,2) not null check (base_price >= 0),
  billing_unit text not null check (billing_unit in ('month', 'feature', 'issue', 'campaign')),
  exclusive boolean not null default true,
  active boolean not null default true
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references public.advertisers (id),
  inquiry_id uuid references public.form_submissions (id),
  name text not null,
  start_date date,
  end_date date,
  budget numeric(12,2) check (budget >= 0),
  status text not null default 'review' check (status in (
    'inquiry', 'review', 'proposal', 'approved', 'awaiting_payment',
    'scheduled', 'active', 'completed', 'archived',
    'rejected', 'cancelled', 'paused', 'payment_failed')),
  created_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

-- Agreed prices are copied here so historical campaign pricing is preserved
-- even when the placement catalog changes later.
create table public.campaign_placements (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  placement_id uuid not null references public.ad_placements (id),
  agreed_price numeric(12,2) not null check (agreed_price >= 0),
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in (
    'pending', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
  check (end_date >= start_date)
);

-- A placement slot holds at most one scheduled or active campaign at a time,
-- which makes overlapping exclusive bookings impossible at the database level.
alter table public.campaign_placements
  add constraint no_overlapping_bookings
  exclude using gist (
    placement_id with =,
    daterange(start_date, end_date, '[]') with &&
  ) where (status in ('scheduled', 'active'));

create table public.creative_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  asset_url text not null,
  destination_url text not null,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id),
  stripe_reference text not null unique,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

-- Populated only from a real delivery source; never demonstration data.
create table public.campaign_metrics (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  placement_id uuid references public.campaign_placements (id) on delete set null,
  date date not null,
  impressions integer not null default 0 check (impressions >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  unique (campaign_id, placement_id, date)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  created_at timestamptz not null default now()
);

-- Row-level security: admins and the service role only. No public access.
alter table public.admin_users enable row level security;
alter table public.publications enable row level security;
alter table public.advertisers enable row level security;
alter table public.ad_placements enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_placements enable row level security;
alter table public.creative_assets enable row level security;
alter table public.payments enable row level security;
alter table public.campaign_metrics enable row level security;
alter table public.audit_logs enable row level security;

-- True when the signed-in user is an administrator. Security definer so the
-- membership check itself is not blocked by admin_users RLS.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admin_users where user_id = auth.uid()) $$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- Audit writer used by admin mutations through the service role.
create function public.log_audit(actor uuid, action text, entity_type text, entity_id text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id)
  values (actor, action, entity_type, entity_id);
end;
$$;

revoke all on function public.log_audit(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.log_audit(uuid, text, text, text) to service_role;

-- Admin full-access policies (service role bypasses RLS by default).
create policy admin_all on public.admin_users for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.publications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.advertisers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.ad_placements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.campaigns for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.campaign_placements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.creative_assets for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.payments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.campaign_metrics for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.audit_logs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Seed the first publication to match content/network.ts.
insert into public.publications (slug, name, domain, description, category, status)
values (
  'silver-circuit',
  'Silver Circuit',
  'https://www.silvercircuit.care/',
  'Independent reviews and practical guides to AI companions and care technology for older adults and their families.',
  'AI Companions & Senior Technology',
  'active'
);

-- After creating the first admin account in Authentication → Users:
--   insert into public.admin_users (user_id, email)
--   values ('<auth user id>', '<admin email>');

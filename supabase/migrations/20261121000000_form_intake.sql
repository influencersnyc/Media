create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('inquiries', 'contact', 'newsletter')),
  fingerprint text not null,
  payload jsonb not null,
  status text not null default 'pending_review',
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (kind, fingerprint)
);

create table public.form_rate_limits (
  client_key text primary key,
  window_start timestamptz not null,
  attempts integer not null
);

alter table public.form_submissions enable row level security;
alter table public.form_rate_limits enable row level security;
revoke all on public.form_submissions, public.form_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.form_submissions, public.form_rate_limits to service_role;

create function public.receive_submission(
  form_kind text, dedupe_key text, client_key text, submitted_payload jsonb
) returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  submission public.form_submissions%rowtype;
  hits integer;
begin
  insert into public.form_rate_limits as limits (client_key, window_start, attempts)
  values ($3, now(), 1)
  on conflict on constraint form_rate_limits_pkey do update
    set attempts = case when limits.window_start < now() - interval '15 minutes' then 1 else limits.attempts + 1 end,
        window_start = case when limits.window_start < now() - interval '15 minutes' then now() else limits.window_start end
  returning attempts into hits;

  if hits > 8 then
    return jsonb_build_object('limited', true);
  end if;

  insert into public.form_submissions (kind, fingerprint, payload, status)
  values (form_kind, dedupe_key, submitted_payload, case when form_kind = 'newsletter' then 'subscribed' else 'pending_review' end)
  on conflict (kind, fingerprint) do nothing
  returning * into submission;

  if submission.id is null then
    select * into strict submission from public.form_submissions
    where kind = form_kind and fingerprint = dedupe_key;
  end if;

  return jsonb_build_object('id', submission.id, 'delivered', submission.notified_at is not null);
end;
$$;

revoke all on function public.receive_submission(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.receive_submission(text, text, text, jsonb) to service_role;

-- ShipIt initial schema
--
-- Adds two tables that the public anon key can hit:
--   1. intake_submissions: shipit.build pick-a-tool form submissions
--      INSERT-only for anon. Read access via dashboard / service role.
--   2. remixes: optional lineage mirror for shipit.fun's riff/fork system.
--      SELECT for anon (so the site can render lineage strips).
--      The static `riffedFrom` field in apps/web/data/experiments.ts is the
--      source of truth; this table is a queryable mirror to support future
--      dashboards or external analytics.
--
-- To apply: paste this file into the Supabase SQL editor for the
-- `whhnkvyyncjsprlpobos` project, or run it via the Supabase CLI:
--   supabase db push  (after `supabase link --project-ref whhnkvyyncjsprlpobos`)

-- ===========================================================================
-- intake_submissions
-- ===========================================================================
create table if not exists public.intake_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text not null,
  email text not null,
  kind text not null check (kind in ('single', 'bundle', 'subscription', 'custom')),
  tools text[] not null default '{}',
  business text not null,
  contents text not null,
  branding text not null check (branding in ('ready', 'mostly', 'help')),
  timeline text not null check (timeline in ('asap', '2-3-weeks', 'flexible')),
  notes text
);

create index if not exists intake_submissions_created_at_idx
  on public.intake_submissions (created_at desc);

alter table public.intake_submissions enable row level security;

-- Anonymous visitors get INSERT-only access. They cannot read, update, or
-- delete anyone's submissions (including their own once submitted).
drop policy if exists "anon can insert submissions"
  on public.intake_submissions;
create policy "anon can insert submissions"
  on public.intake_submissions
  for insert
  to anon
  with check (true);

-- ===========================================================================
-- remixes
-- ===========================================================================
create table if not exists public.remixes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  parent_slug text not null,
  child_slug text not null,
  child_contributor text,
  note text,
  unique (parent_slug, child_slug)
);

create index if not exists remixes_parent_slug_idx
  on public.remixes (parent_slug);
create index if not exists remixes_child_slug_idx
  on public.remixes (child_slug);

alter table public.remixes enable row level security;

-- Anonymous visitors can read remix lineage. Writes happen via the
-- dashboard or a server-side script using the service role key.
drop policy if exists "anyone can read remixes"
  on public.remixes;
create policy "anyone can read remixes"
  on public.remixes
  for select
  to anon
  using (true);

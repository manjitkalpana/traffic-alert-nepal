-- Traffic Alert Nepal: community road-safety reports
-- Run in Supabase SQL Editor. Reports are private (pending) until moderator approval.

create extension if not exists pgcrypto;

create table if not exists public.road_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 5 and 120),
  category text not null check (category in ('congestion','accident','closure','hazard','other')),
  district text not null check (district in ('Kanchanpur','Kailali')),
  area text not null check (char_length(area) between 2 and 180),
  details text not null check (char_length(details) between 10 and 2000),
  lat double precision not null check (lat between 26.0 and 31.0),
  lng double precision not null check (lng between 79.0 and 83.0),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '12 hours')
);

alter table public.road_reports enable row level security;

drop policy if exists "Anyone can read approved reports" on public.road_reports;
create policy "Anyone can read approved reports" on public.road_reports
for select using (status = 'approved' and expires_at > now());

drop policy if exists "Anyone can submit pending reports" on public.road_reports;
create policy "Anyone can submit pending reports" on public.road_reports
for insert with check (
  status = 'pending'
  and district in ('Kanchanpur','Kailali')
  and expires_at > now()
);

-- Do not create public update/delete policies. Review submissions in Supabase
-- Dashboard or through a future authenticated moderator-only server route.
create index if not exists road_reports_public_created_idx
  on public.road_reports (created_at desc)
  where status = 'approved';
create index if not exists road_reports_expiry_idx on public.road_reports (expires_at);

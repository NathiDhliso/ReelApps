-- Migration: Create public_cv_links table for shareable read-only portfolio links
-- -------------------------------------------------------------
-- This table stores short slugs that point to a candidate's public CV. A
-- separate process (Edge Function) will create rows. Recruiters / external
-- viewers will consume them without authentication.

create table if not exists public.public_cv_links (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  expires_at timestamptz not null default (now() + interval '30 days'),
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS and only allow select when link is valid.
alter table public.public_cv_links enable row level security;

create policy "Allow public read via slug"
  on public.public_cv_links
  for select
  using (revoked = false and now() < expires_at);

-- Allow authenticated candidates to create their own links.
create policy "Candidates can insert their own link" on public.public_cv_links
  for insert
  with check (auth.uid() = candidate_id);

-- Remove invalid combined update, delete policy and split into two distinct policies.
create policy "Owners can update their links" on public.public_cv_links
  for update
  using (auth.uid() = candidate_id);

create policy "Owners can delete their links" on public.public_cv_links
  for delete
  using (auth.uid() = candidate_id); 
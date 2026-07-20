-- Arctounon off-chain allowlist capture.
-- Run once in the Supabase SQL editor (Dashboard → SQL) for your project.
-- The Next.js API routes write/read this table with the service-role key.

create table if not exists public.arc_allowlist (
  id         bigint generated always as identity primary key,
  wallet     text not null unique,          -- stored lowercased by the API
  created_at timestamptz not null default now()
);

create index if not exists arc_allowlist_created_at_idx
  on public.arc_allowlist (created_at);

-- Lock the table: only the service role (used server-side by app/api/allowlist)
-- may read or write. RLS on with no policy = deny all for anon/public keys.
alter table public.arc_allowlist enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration v2 — Run this if you already ran schema.sql before
-- Only adds NEW columns and tables, safe to run on existing DB
-- ─────────────────────────────────────────────────────────────────────────────

-- Add discount columns to invoices (if they don't exist)
alter table invoices
  add column if not exists discount_type   text default 'flat' check (discount_type in ('flat','percent')),
  add column if not exists discount_value  numeric default 0,
  add column if not exists discount_amount numeric default 0;

-- Create pricing table
create table if not exists pricing (
  id            uuid primary key default uuid_generate_v4(),
  feature_name  text unique not null,
  price         numeric not null default 0,
  updated_at    timestamptz default now()
);

-- Enable RLS on pricing
alter table pricing enable row level security;

-- Create policy only if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'pricing' and policyname = 'Auth only — pricing'
  ) then
    execute 'create policy "Auth only — pricing" on pricing for all using (auth.role() = ''authenticated'')';
  end if;
end $$;

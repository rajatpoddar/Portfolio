-- ─────────────────────────────────────────────────────────────────────────────
-- Rajat Poddar — Business OS Schema
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── CLIENTS ─────────────────────────────────────────────────────────────────
create table if not exists clients (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  business    text,
  email       text,
  phone       text,
  notes       text,
  created_at  timestamptz default now()
);

-- ─── QUOTATIONS ───────────────────────────────────────────────────────────────
create table if not exists quotations (
  id            uuid primary key default uuid_generate_v4(),
  quote_number  text unique not null,
  client_id     uuid references clients(id) on delete set null,
  client_name   text,                        -- fallback if no client linked
  project_type  text not null default 'Standard App',
  features      text[] default '{}',
  maintenance   text,
  notes         text,
  total_amount  numeric default 0,
  status        text default 'draft'
                check (status in ('draft','sent','accepted','rejected')),
  created_at    timestamptz default now()
);

-- ─── INVOICES ─────────────────────────────────────────────────────────────────
create table if not exists invoices (
  id              uuid primary key default uuid_generate_v4(),
  invoice_number  text unique not null,
  client_id       uuid references clients(id) on delete set null,
  project_name    text,
  total_amount    numeric default 0,
  paid_amount     numeric default 0,
  due_amount      numeric default 0,
  discount_type   text default 'flat' check (discount_type in ('flat','percent')),
  discount_value  numeric default 0,
  discount_amount numeric default 0,
  due_date        date,
  status          text default 'draft'
                  check (status in ('draft','sent','paid','pending','overdue')),
  notes           text,
  created_at      timestamptz default now()
);

-- ─── PRICING ──────────────────────────────────────────────────────────────────
create table if not exists pricing (
  id            uuid primary key default uuid_generate_v4(),
  feature_name  text unique not null,
  price         numeric not null default 0,
  updated_at    timestamptz default now()
);

-- ─── LEADS ────────────────────────────────────────────────────────────────────
create table if not exists leads (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  email       text,
  phone       text,
  company     text,
  message     text,
  status      text default 'new'
              check (status in ('new','contacted','converted','closed')),
  created_at  timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
-- Leads: public insert (from contact form), authenticated read
alter table leads enable row level security;
create policy "Public can insert leads"  on leads for insert with check (true);
create policy "Auth can read leads"      on leads for select using (auth.role() = 'authenticated');
create policy "Auth can update leads"    on leads for update using (auth.role() = 'authenticated');

-- Clients, Quotations, Invoices: authenticated only
alter table clients    enable row level security;
alter table quotations enable row level security;
alter table invoices   enable row level security;

create policy "Auth only — clients"    on clients    for all using (auth.role() = 'authenticated');
create policy "Auth only — quotations" on quotations for all using (auth.role() = 'authenticated');
create policy "Auth only — invoices"   on invoices   for all using (auth.role() = 'authenticated');

-- Pricing: authenticated only
alter table pricing enable row level security;
create policy "Auth only — pricing" on pricing for all using (auth.role() = 'authenticated');

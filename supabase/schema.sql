-- Supabase schema for Vite React app (Vena) using generic id+data JSONB tables
-- NOTE: The app seeds all tables from in-app mock data on first run.
-- If you prefer seeding via SQL, see mock_data.sql (optional).

create table if not exists public.users (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.clients (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.team_members (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.packages (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.add_ons (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.projects (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.transactions (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.cards (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.financial_pockets (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.leads (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.sops (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.promo_codes (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.social_media_posts (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.assets (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.client_feedback (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.contracts (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.team_project_payments (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.team_payment_records (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.reward_ledger_entries (
  id text primary key,
  data jsonb not null,
  created_at timestamptz default now()
);

-- Helpful indexes when filtering inside jsonb (optional examples)
create index if not exists idx_clients_name on public.clients ((data->>'name'));
create index if not exists idx_projects_client_id on public.projects ((data->>'clientId'));
create index if not exists idx_transactions_project_id on public.transactions ((data->>'projectId'));
create index if not exists idx_leads_status on public.leads ((data->>'status'));


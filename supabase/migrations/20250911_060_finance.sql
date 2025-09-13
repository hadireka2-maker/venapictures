-- 060_finance: accounts, categories, transactions with RLS and realtime

-- Accounts
create table if not exists public.accounts (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  name        text not null,
  type        text not null default 'cash' check (type in ('cash','bank','other')),
  balance     numeric(14,2) not null default 0,
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_accounts_org_id on public.accounts (org_id);

alter table public.accounts enable row level security;

drop policy if exists "accounts_select_owner" on public.accounts;
create policy "accounts_select_owner" on public.accounts for select using (owner_id = auth.uid());

drop policy if exists "accounts_insert_owner" on public.accounts;
create policy "accounts_insert_owner" on public.accounts for insert with check (owner_id = auth.uid());

drop policy if exists "accounts_update_owner" on public.accounts;
create policy "accounts_update_owner" on public.accounts for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "accounts_delete_owner" on public.accounts;
create policy "accounts_delete_owner" on public.accounts for delete using (owner_id = auth.uid());

drop trigger if exists set_account_updated_at on public.accounts;
create trigger set_account_updated_at before update on public.accounts for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','accounts');

-- Categories
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  name        text not null,
  type        text not null check (type in ('income','expense')),
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_categories_org_id on public.categories (org_id);

alter table public.categories enable row level security;

drop policy if exists "categories_select_owner" on public.categories;
create policy "categories_select_owner" on public.categories for select using (owner_id = auth.uid());

drop policy if exists "categories_insert_owner" on public.categories;
create policy "categories_insert_owner" on public.categories for insert with check (owner_id = auth.uid());

drop policy if exists "categories_update_owner" on public.categories;
create policy "categories_update_owner" on public.categories for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "categories_delete_owner" on public.categories;
create policy "categories_delete_owner" on public.categories for delete using (owner_id = auth.uid());

drop trigger if exists set_category_updated_at on public.categories;
create trigger set_category_updated_at before update on public.categories for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','categories');

-- Transactions
create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  account_id    uuid not null,
  category_id   uuid,
  amount        numeric(14,2) not null,
  direction     text not null check (direction in ('in','out')),
  note          text,
  date          date not null default current_date,
  owner_id      uuid not null default auth.uid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_transactions_org_id on public.transactions (org_id);
create index if not exists idx_transactions_account on public.transactions (account_id);
create index if not exists idx_transactions_date on public.transactions (date);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_owner" on public.transactions;
create policy "transactions_select_owner" on public.transactions for select using (owner_id = auth.uid());

drop policy if exists "transactions_insert_owner" on public.transactions;
create policy "transactions_insert_owner" on public.transactions for insert with check (owner_id = auth.uid());

drop policy if exists "transactions_update_owner" on public.transactions;
create policy "transactions_update_owner" on public.transactions for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "transactions_delete_owner" on public.transactions;
create policy "transactions_delete_owner" on public.transactions for delete using (owner_id = auth.uid());

drop trigger if exists set_transaction_updated_at on public.transactions;
create trigger set_transaction_updated_at before update on public.transactions for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','transactions');


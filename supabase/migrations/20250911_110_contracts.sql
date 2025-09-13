-- 110_contracts: schema, RLS, indexes, realtime

create table if not exists public.contracts (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  client_id   uuid,
  title       text not null,
  content     text,
  status      text not null default 'draft' check (status in ('draft','sent','signed','cancelled')),
  signed_at   timestamptz,
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_contracts_org_id on public.contracts (org_id);
create index if not exists idx_contracts_client_id on public.contracts (client_id);

alter table public.contracts enable row level security;

drop policy if exists "contracts_select_owner" on public.contracts;
create policy "contracts_select_owner" on public.contracts for select using (owner_id = auth.uid());

drop policy if exists "contracts_insert_owner" on public.contracts;
create policy "contracts_insert_owner" on public.contracts for insert with check (owner_id = auth.uid());

drop policy if exists "contracts_update_owner" on public.contracts;
create policy "contracts_update_owner" on public.contracts for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "contracts_delete_owner" on public.contracts;
create policy "contracts_delete_owner" on public.contracts for delete using (owner_id = auth.uid());

drop trigger if exists set_contract_updated_at on public.contracts;
create trigger set_contract_updated_at before update on public.contracts for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','contracts');


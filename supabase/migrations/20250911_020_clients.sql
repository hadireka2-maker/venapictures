-- 020_clients: schema, RLS, indexes, realtime

create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  name        text not null,
  email       text,
  phone       text,
  company     text,
  status      text not null default 'active' check (status in ('active','inactive')),
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_clients_org_id on public.clients (org_id);
create index if not exists idx_clients_status on public.clients (status);

alter table public.clients enable row level security;

drop policy if exists "clients_select_owner" on public.clients;
create policy "clients_select_owner" on public.clients for select using (owner_id = auth.uid());

drop policy if exists "clients_insert_owner" on public.clients;
create policy "clients_insert_owner" on public.clients for insert with check (owner_id = auth.uid());

drop policy if exists "clients_update_owner" on public.clients;
create policy "clients_update_owner" on public.clients for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "clients_delete_owner" on public.clients;
create policy "clients_delete_owner" on public.clients for delete using (owner_id = auth.uid());

drop trigger if exists set_client_updated_at on public.clients;
create trigger set_client_updated_at before update on public.clients for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','clients');


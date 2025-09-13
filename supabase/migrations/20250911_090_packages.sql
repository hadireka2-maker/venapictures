-- 090_packages: schema, RLS, indexes, realtime

create table if not exists public.packages (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  name        text not null,
  description text,
  price       numeric(12,2) not null default 0,
  status      text not null default 'active' check (status in ('active','inactive')),
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_packages_org_id on public.packages (org_id);
create index if not exists idx_packages_status on public.packages (status);

alter table public.packages enable row level security;

drop policy if exists "packages_select_owner" on public.packages;
create policy "packages_select_owner" on public.packages for select using (owner_id = auth.uid());

drop policy if exists "packages_insert_owner" on public.packages;
create policy "packages_insert_owner" on public.packages for insert with check (owner_id = auth.uid());

drop policy if exists "packages_update_owner" on public.packages;
create policy "packages_update_owner" on public.packages for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "packages_delete_owner" on public.packages;
create policy "packages_delete_owner" on public.packages for delete using (owner_id = auth.uid());

drop trigger if exists set_package_updated_at on public.packages;
create trigger set_package_updated_at before update on public.packages for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','packages');


-- 100_assets: schema, RLS, indexes, realtime

create table if not exists public.assets (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  name        text not null,
  type        text,
  url         text,
  project_id  uuid,
  status      text not null default 'active' check (status in ('active','archived')),
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_assets_org_id on public.assets (org_id);
create index if not exists idx_assets_project_id on public.assets (project_id);

alter table public.assets enable row level security;

drop policy if exists "assets_select_owner" on public.assets;
create policy "assets_select_owner" on public.assets for select using (owner_id = auth.uid());

drop policy if exists "assets_insert_owner" on public.assets;
create policy "assets_insert_owner" on public.assets for insert with check (owner_id = auth.uid());

drop policy if exists "assets_update_owner" on public.assets;
create policy "assets_update_owner" on public.assets for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "assets_delete_owner" on public.assets;
create policy "assets_delete_owner" on public.assets for delete using (owner_id = auth.uid());

drop trigger if exists set_asset_updated_at on public.assets;
create trigger set_asset_updated_at before update on public.assets for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','assets');


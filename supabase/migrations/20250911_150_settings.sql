-- 150_settings: schema, RLS, indexes, realtime

create table if not exists public.settings (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  key         text not null,
  value       jsonb,
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, key)
);

create index if not exists idx_settings_org_id on public.settings (org_id);

alter table public.settings enable row level security;

drop policy if exists "settings_select_owner" on public.settings;
create policy "settings_select_owner" on public.settings for select using (owner_id = auth.uid());

drop policy if exists "settings_insert_owner" on public.settings;
create policy "settings_insert_owner" on public.settings for insert with check (owner_id = auth.uid());

drop policy if exists "settings_update_owner" on public.settings;
create policy "settings_update_owner" on public.settings for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "settings_delete_owner" on public.settings;
create policy "settings_delete_owner" on public.settings for delete using (owner_id = auth.uid());

drop trigger if exists set_setting_updated_at on public.settings;
create trigger set_setting_updated_at before update on public.settings for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','settings');


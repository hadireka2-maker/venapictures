-- 010_prospects: schema, RLS, indexes, realtime

create table if not exists public.prospects (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  name        text not null,
  email       text,
  phone       text,
  source      text,
  status      text not null default 'new' check (status in ('new','contacted','qualified','lost','won')),
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_prospects_org_id on public.prospects (org_id);
create index if not exists idx_prospects_status on public.prospects (status);

alter table public.prospects enable row level security;

drop policy if exists "prospects_select_owner" on public.prospects;
create policy "prospects_select_owner" on public.prospects for select using (owner_id = auth.uid());

drop policy if exists "prospects_insert_owner" on public.prospects;
create policy "prospects_insert_owner" on public.prospects for insert with check (owner_id = auth.uid());

drop policy if exists "prospects_update_owner" on public.prospects;
create policy "prospects_update_owner" on public.prospects for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "prospects_delete_owner" on public.prospects;
create policy "prospects_delete_owner" on public.prospects for delete using (owner_id = auth.uid());

drop trigger if exists set_prospect_updated_at on public.prospects;
create trigger set_prospect_updated_at before update on public.prospects for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','prospects');


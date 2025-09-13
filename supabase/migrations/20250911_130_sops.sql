-- 130_sops: schema, RLS, indexes, realtime

create table if not exists public.sops (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  title       text not null,
  content     text,
  status      text not null default 'active' check (status in ('active','archived')),
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_sops_org_id on public.sops (org_id);
create index if not exists idx_sops_status on public.sops (status);

alter table public.sops enable row level security;

drop policy if exists "sops_select_owner" on public.sops;
create policy "sops_select_owner" on public.sops for select using (owner_id = auth.uid());

drop policy if exists "sops_insert_owner" on public.sops;
create policy "sops_insert_owner" on public.sops for insert with check (owner_id = auth.uid());

drop policy if exists "sops_update_owner" on public.sops;
create policy "sops_update_owner" on public.sops for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "sops_delete_owner" on public.sops;
create policy "sops_delete_owner" on public.sops for delete using (owner_id = auth.uid());

drop trigger if exists set_sop_updated_at on public.sops;
create trigger set_sop_updated_at before update on public.sops for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','sops');


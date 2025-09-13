-- 040_projects (vena): already defined elsewhere, include here to align naming
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  name        text not null,
  description text,
  status      text not null default 'active' check (status in ('active','archived')),
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (org_id, name)
);

create index if not exists idx_projects_org_id on public.projects (org_id);
create index if not exists idx_projects_status on public.projects (status);

alter table public.projects enable row level security;

drop policy if exists "projects_select_owner" on public.projects;
create policy "projects_select_owner" on public.projects for select using (owner_id = auth.uid());

drop policy if exists "projects_insert_owner" on public.projects;
create policy "projects_insert_owner" on public.projects for insert with check (owner_id = auth.uid());

drop policy if exists "projects_update_owner" on public.projects;
create policy "projects_update_owner" on public.projects for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "projects_delete_owner" on public.projects;
create policy "projects_delete_owner" on public.projects for delete using (owner_id = auth.uid());

drop trigger if exists set_project_updated_at on public.projects;
create trigger set_project_updated_at before update on public.projects for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','projects');


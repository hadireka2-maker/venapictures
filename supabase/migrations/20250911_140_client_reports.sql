-- 140_client_reports: schema, RLS, indexes, realtime

create table if not exists public.client_reports (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  client_id   uuid,
  title       text not null,
  content     text,
  period_from date,
  period_to   date,
  status      text not null default 'draft' check (status in ('draft','published','archived')),
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_client_reports_org_id on public.client_reports (org_id);
create index if not exists idx_client_reports_client_id on public.client_reports (client_id);

alter table public.client_reports enable row level security;

drop policy if exists "client_reports_select_owner" on public.client_reports;
create policy "client_reports_select_owner" on public.client_reports for select using (owner_id = auth.uid());

drop policy if exists "client_reports_insert_owner" on public.client_reports;
create policy "client_reports_insert_owner" on public.client_reports for insert with check (owner_id = auth.uid());

drop policy if exists "client_reports_update_owner" on public.client_reports;
create policy "client_reports_update_owner" on public.client_reports for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "client_reports_delete_owner" on public.client_reports;
create policy "client_reports_delete_owner" on public.client_reports for delete using (owner_id = auth.uid());

drop trigger if exists set_client_report_updated_at on public.client_reports;
create trigger set_client_report_updated_at before update on public.client_reports for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','client_reports');


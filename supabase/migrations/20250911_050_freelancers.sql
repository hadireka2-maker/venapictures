-- 050_freelancers: schema, RLS, indexes, realtime

create table if not exists public.freelancers (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  name        text not null,
  email       text,
  phone       text,
  skills      text[],
  rate        numeric(12,2),
  status      text not null default 'active' check (status in ('active','inactive')),
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_freelancers_org_id on public.freelancers (org_id);
create index if not exists idx_freelancers_status on public.freelancers (status);

alter table public.freelancers enable row level security;

drop policy if exists "freelancers_select_owner" on public.freelancers;
create policy "freelancers_select_owner" on public.freelancers for select using (owner_id = auth.uid());

drop policy if exists "freelancers_insert_owner" on public.freelancers;
create policy "freelancers_insert_owner" on public.freelancers for insert with check (owner_id = auth.uid());

drop policy if exists "freelancers_update_owner" on public.freelancers;
create policy "freelancers_update_owner" on public.freelancers for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "freelancers_delete_owner" on public.freelancers;
create policy "freelancers_delete_owner" on public.freelancers for delete using (owner_id = auth.uid());

drop trigger if exists set_freelancer_updated_at on public.freelancers;
create trigger set_freelancer_updated_at before update on public.freelancers for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','freelancers');


-- 030_bookings: schema, RLS, indexes, realtime

create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  client_id     uuid,
  project_id    uuid,
  title         text not null,
  start_time    timestamptz not null,
  end_time      timestamptz not null,
  location      text,
  status        text not null default 'scheduled' check (status in ('scheduled','confirmed','completed','cancelled')),
  owner_id      uuid not null default auth.uid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_bookings_org_id on public.bookings (org_id);
create index if not exists idx_bookings_client_id on public.bookings (client_id);
create index if not exists idx_bookings_project_id on public.bookings (project_id);
create index if not exists idx_bookings_time on public.bookings (start_time, end_time);

alter table public.bookings enable row level security;

drop policy if exists "bookings_select_owner" on public.bookings;
create policy "bookings_select_owner" on public.bookings for select using (owner_id = auth.uid());

drop policy if exists "bookings_insert_owner" on public.bookings;
create policy "bookings_insert_owner" on public.bookings for insert with check (owner_id = auth.uid());

drop policy if exists "bookings_update_owner" on public.bookings;
create policy "bookings_update_owner" on public.bookings for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "bookings_delete_owner" on public.bookings;
create policy "bookings_delete_owner" on public.bookings for delete using (owner_id = auth.uid());

drop trigger if exists set_booking_updated_at on public.bookings;
create trigger set_booking_updated_at before update on public.bookings for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','bookings');


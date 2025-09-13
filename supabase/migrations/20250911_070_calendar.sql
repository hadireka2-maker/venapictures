-- 070_calendar: events with RLS and realtime

create table if not exists public.calendar_events (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null,
  title         text not null,
  description   text,
  start_time    timestamptz not null,
  end_time      timestamptz not null,
  location      text,
  status        text not null default 'scheduled' check (status in ('scheduled','confirmed','completed','cancelled')),
  owner_id      uuid not null default auth.uid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_calendar_events_org_id on public.calendar_events (org_id);
create index if not exists idx_calendar_events_time on public.calendar_events (start_time, end_time);

alter table public.calendar_events enable row level security;

drop policy if exists "calendar_events_select_owner" on public.calendar_events;
create policy "calendar_events_select_owner" on public.calendar_events for select using (owner_id = auth.uid());

drop policy if exists "calendar_events_insert_owner" on public.calendar_events;
create policy "calendar_events_insert_owner" on public.calendar_events for insert with check (owner_id = auth.uid());

drop policy if exists "calendar_events_update_owner" on public.calendar_events;
create policy "calendar_events_update_owner" on public.calendar_events for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "calendar_events_delete_owner" on public.calendar_events;
create policy "calendar_events_delete_owner" on public.calendar_events for delete using (owner_id = auth.uid());

drop trigger if exists set_calendar_event_updated_at on public.calendar_events;
create trigger set_calendar_event_updated_at before update on public.calendar_events for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','calendar_events');


-- 120_promo_codes: schema, RLS, indexes, realtime

create table if not exists public.promo_codes (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  code        text not null unique,
  description text,
  discount_pct numeric(5,2),
  active      boolean not null default true,
  valid_from  date,
  valid_to    date,
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_promo_codes_org_id on public.promo_codes (org_id);

alter table public.promo_codes enable row level security;

drop policy if exists "promo_codes_select_owner" on public.promo_codes;
create policy "promo_codes_select_owner" on public.promo_codes for select using (owner_id = auth.uid());

drop policy if exists "promo_codes_insert_owner" on public.promo_codes;
create policy "promo_codes_insert_owner" on public.promo_codes for insert with check (owner_id = auth.uid());

drop policy if exists "promo_codes_update_owner" on public.promo_codes;
create policy "promo_codes_update_owner" on public.promo_codes for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "promo_codes_delete_owner" on public.promo_codes;
create policy "promo_codes_delete_owner" on public.promo_codes for delete using (owner_id = auth.uid());

drop trigger if exists set_promo_code_updated_at on public.promo_codes;
create trigger set_promo_code_updated_at before update on public.promo_codes for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','promo_codes');


-- 080_social_posts: schema, RLS, indexes, realtime

create table if not exists public.social_posts (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null,
  platform    text not null check (platform in ('instagram','tiktok','facebook','twitter','youtube','other')),
  content     text,
  scheduled_at timestamptz,
  status      text not null default 'draft' check (status in ('draft','scheduled','posted','cancelled')),
  owner_id    uuid not null default auth.uid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_social_posts_org_id on public.social_posts (org_id);
create index if not exists idx_social_posts_status on public.social_posts (status);

alter table public.social_posts enable row level security;

drop policy if exists "social_posts_select_owner" on public.social_posts;
create policy "social_posts_select_owner" on public.social_posts for select using (owner_id = auth.uid());

drop policy if exists "social_posts_insert_owner" on public.social_posts;
create policy "social_posts_insert_owner" on public.social_posts for insert with check (owner_id = auth.uid());

drop policy if exists "social_posts_update_owner" on public.social_posts;
create policy "social_posts_update_owner" on public.social_posts for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "social_posts_delete_owner" on public.social_posts;
create policy "social_posts_delete_owner" on public.social_posts for delete using (owner_id = auth.uid());

drop trigger if exists set_social_post_updated_at on public.social_posts;
create trigger set_social_post_updated_at before update on public.social_posts for each row execute procedure public.set_current_timestamp_updated_at();

select public.ensure_realtime('public','social_posts');


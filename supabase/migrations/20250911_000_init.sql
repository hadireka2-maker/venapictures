-- 000_init: extensions, triggers helper, realtime helper

-- Ensure UUID generation extension
create extension if not exists pgcrypto;

-- updated_at trigger function (idempotent)
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper to safely add a table to supabase_realtime publication
create or replace function public.ensure_realtime(table_schema text, table_name text)
returns void
language plpgsql
as $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = table_schema
      and tablename = table_name
  ) then
    execute format('alter publication supabase_realtime add table %I.%I', table_schema, table_name);
  end if;
end;
$$;

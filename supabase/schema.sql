-- SoulSpace database schema for Supabase (PostgreSQL).
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.

-- Daily mood check-ins: one row per user per day.
create table if not exists public.mood_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day         date not null,
  mood_label  text not null,
  mood_emoji  text not null,
  mood_color  text,
  mood_ocean  text,
  note        text default '',
  created_at  timestamptz not null default now(),
  unique (user_id, day)
);

-- Journal entries.
create table if not exists public.journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null default 'Untitled Entry',
  content     text not null,
  created_at  timestamptz not null default now()
);

-- Habit completions: one row per user per habit per day.
create table if not exists public.habit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id    integer not null,
  day         date not null,
  created_at  timestamptz not null default now(),
  unique (user_id, habit_id, day)
);

create index if not exists journal_entries_user_created_idx on public.journal_entries (user_id, created_at desc);

-- Row Level Security: each person can only ever see and change their own rows.
alter table public.mood_entries    enable row level security;
alter table public.journal_entries enable row level security;
alter table public.habit_logs      enable row level security;

do $$
declare t text;
begin
  foreach t in array array['mood_entries', 'journal_entries', 'habit_logs'] loop
    execute format('drop policy if exists "own rows: select" on public.%I', t);
    execute format('drop policy if exists "own rows: insert" on public.%I', t);
    execute format('drop policy if exists "own rows: update" on public.%I', t);
    execute format('drop policy if exists "own rows: delete" on public.%I', t);
    execute format('create policy "own rows: select" on public.%I for select to authenticated using (auth.uid() = user_id)', t);
    execute format('create policy "own rows: insert" on public.%I for insert to authenticated with check (auth.uid() = user_id)', t);
    execute format('create policy "own rows: update" on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "own rows: delete" on public.%I for delete to authenticated using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- v2: mood tags on journal entries (safe to run more than once).
alter table public.journal_entries add column if not exists mood_label text;
alter table public.journal_entries add column if not exists mood_emoji text;

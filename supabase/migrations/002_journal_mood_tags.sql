-- Adds mood tags to journal entries. Run once in Supabase -> SQL Editor.
-- Safe to run more than once.
alter table public.journal_entries add column if not exists mood_label text;
alter table public.journal_entries add column if not exists mood_emoji text;

-- KamaAgni partner alerts (v78): where to deliver phone notifications for each signed-in device.
-- Run once in Supabase → SQL editor, after schema.sql. See SETUP-PUSH.md.
create table if not exists public.push_subs (
  endpoint   text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  sub        jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists "own push subs" on public.push_subs;
create policy "own push subs" on public.push_subs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists push_subs_user on public.push_subs(user_id);

-- v79: weekly date-night reminder (only the weekday, time and time zone you chose; nothing else about you)
alter table public.push_subs add column if not exists dn_dow  smallint;   -- 0 = Sunday … 6 = Saturday, null = off
alter table public.push_subs add column if not exists dn_time text;       -- 'HH:MM' local
alter table public.push_subs add column if not exists tz      text;       -- e.g. 'Australia/Sydney'
alter table public.push_subs add column if not exists dn_sent date;       -- last day a reminder went out

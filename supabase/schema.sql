-- KamaAgni cloud schema. Paste into Supabase > SQL Editor > Run. Safe to re-run.
-- Everything personal is END-TO-END ENCRYPTED in the browser: the server only stores ciphertext.

create table if not exists public.vault (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  k text not null,
  v text not null,
  updated_at bigint not null,
  primary key (user_id, k)
);
alter table public.vault enable row level security;
drop policy if exists vault_all on public.vault;
create policy vault_all on public.vault for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  a uuid references auth.users(id) on delete set null,
  b uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.couples enable row level security;
drop policy if exists couples_sel on public.couples;
create policy couples_sel on public.couples for select using (a = auth.uid() or b = auth.uid());
drop policy if exists couples_ins on public.couples;
create policy couples_ins on public.couples for insert with check (
  a = auth.uid() and b is null
  and not exists (select 1 from public.couples c where c.a = auth.uid() or c.b = auth.uid()));
-- joining / leaving only through the functions below

create table if not exists public.couple_events (
  id bigint generated always as identity primary key,
  couple_id uuid not null references public.couples(id) on delete cascade,
  sender uuid not null default auth.uid(),
  kind text not null check (char_length(kind) < 40),
  body text not null check (char_length(body) < 20000),
  created_at timestamptz not null default now()
);
create index if not exists couple_events_idx on public.couple_events (couple_id, id);
alter table public.couple_events enable row level security;
drop policy if exists ev_sel on public.couple_events;
create policy ev_sel on public.couple_events for select using (
  exists (select 1 from public.couples c where c.id = couple_id and (c.a = auth.uid() or c.b = auth.uid())));
drop policy if exists ev_ins on public.couple_events;
create policy ev_ins on public.couple_events for insert with check (
  sender = auth.uid() and exists (select 1 from public.couples c where c.id = couple_id and (c.a = auth.uid() or c.b = auth.uid())));
drop policy if exists ev_del on public.couple_events;
create policy ev_del on public.couple_events for delete using (sender = auth.uid());

create or replace function public.join_couple(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare c public.couples;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from couples where a = auth.uid() or b = auth.uid()) then raise exception 'You are already linked. Leave first.'; end if;
  select * into c from couples where code = p_code and b is null and a is not null and a <> auth.uid() for update;
  if not found then raise exception 'Invite not found or already used'; end if;
  update couples set b = auth.uid() where id = c.id;
  return c.id;
end $$;

create or replace function public.leave_couple(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare c public.couples;
begin
  select * into c from couples where id = p_id and (a = auth.uid() or b = auth.uid());
  if not found then return; end if;
  if c.a = auth.uid() or c.b is null then delete from couples where id = p_id;  -- also deletes the shared events
  else update couples set b = null where id = p_id; end if;
end $$;

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  delete from couples where a = auth.uid() or b = auth.uid();
  delete from vault where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.join_couple(text), public.leave_couple(uuid), public.delete_my_account() from public, anon;
grant execute on function public.join_couple(text), public.leave_couple(uuid), public.delete_my_account() to authenticated;

-- realtime for live partner events
do $$ begin
  alter publication supabase_realtime add table public.couple_events;
exception when duplicate_object then null; end $$;

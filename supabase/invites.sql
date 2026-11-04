-- OPTIONAL: personal invite codes, so only people you invite can store data on your Supabase.
-- Run AFTER supabase/schema.sql. Safe to re-run. Then set REQUIRE_INVITE: true in js/ka-config.js.

create table if not exists public.members (user_id uuid primary key references auth.users(id) on delete cascade, joined_at timestamptz not null default now());
create table if not exists public.invites (
  code text primary key, label text not null default '', created_at timestamptz not null default now(),
  used_by uuid references auth.users(id) on delete set null, used_at timestamptz);
alter table public.members enable row level security;
alter table public.invites enable row level security;
revoke all on public.members, public.invites from anon, authenticated;

create or replace function public.is_member() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.members where user_id = auth.uid()) $$;

create or replace function public.claim_invite(p_code text) returns boolean language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if exists (select 1 from public.members where user_id = auth.uid()) then return true; end if;
  update public.invites set used_by = auth.uid(), used_at = now() where code = upper(trim(p_code)) and used_by is null;
  get diagnostics n = row_count;
  if n = 0 then raise exception 'Invite code not valid or already used'; end if;
  insert into public.members(user_id) values (auth.uid()) on conflict do nothing;
  return true;
end $$;

-- You create codes from the SQL editor:  select public.new_invite('Sam');
create or replace function public.new_invite(p_label text default '') returns text language plpgsql security definer set search_path = public as $$
declare c text;
begin
  c := upper(substr(md5(gen_random_uuid()::text), 1, 12)); c := substr(c,1,4) || '-' || substr(c,5,4) || '-' || substr(c,9,4);
  insert into public.invites(code, label) values (c, coalesce(p_label, ''));
  return c;
end $$;

revoke all on function public.is_member(), public.claim_invite(text), public.new_invite(text) from public, anon, authenticated;
grant execute on function public.is_member(), public.claim_invite(text) to authenticated;

-- Existing people (you, before invites) must be members too. Run once if you already have an account:
insert into public.members(user_id) select id from auth.users on conflict do nothing;

-- Only members can store data or link partners.
drop policy if exists vault_all on public.vault;
create policy vault_all on public.vault for all using (user_id = auth.uid() and public.is_member()) with check (user_id = auth.uid() and public.is_member());
drop policy if exists couples_ins on public.couples;
create policy couples_ins on public.couples for insert with check (
  a = auth.uid() and b is null and public.is_member()
  and not exists (select 1 from public.couples c where c.a = auth.uid() or c.b = auth.uid()));
drop policy if exists ev_ins on public.couple_events;
create policy ev_ins on public.couple_events for insert with check (
  sender = auth.uid() and public.is_member() and exists (select 1 from public.couples c where c.id = couple_id and (c.a = auth.uid() or c.b = auth.uid())));

create or replace function public.join_couple(p_code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare c public.couples;
begin
  if auth.uid() is null then raise exception 'Not signed in'; end if;
  if not exists (select 1 from public.members where user_id = auth.uid()) then raise exception 'Invite code needed'; end if;
  if exists (select 1 from couples where a = auth.uid() or b = auth.uid()) then raise exception 'You are already linked. Leave first.'; end if;
  select * into c from couples where code = p_code and b is null and a is not null and a <> auth.uid() for update;
  if not found then raise exception 'Invite not found or already used'; end if;
  update couples set b = auth.uid() where id = c.id;
  return c.id;
end $$;

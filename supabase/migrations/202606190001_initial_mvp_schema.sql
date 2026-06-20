-- Initial Orchard MVP schema draft.
-- Not yet applied to a live Supabase project.
-- Review RLS and policies before using outside a development project.

create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  birthdate date,
  age_confirmed boolean not null default false,
  age_verified boolean not null default false,
  city text,
  region text,
  country text,
  latitude_approx numeric,
  longitude_approx numeric,
  gender text,
  orientation text,
  relationship_structure text[] not null default '{}',
  partnered_status text,
  dating_mode text,
  looking_for text[] not null default '{}',
  boundaries text[] not null default '{}',
  bio text,
  is_visible boolean not null default true,
  is_suspended boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_active_at timestamptz
);

create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  decision text not null check (decision in ('like', 'pass', 'super_like')),
  created_at timestamptz not null default now(),
  constraint swipes_not_self check (swiper_id <> target_id),
  unique (swiper_id, target_id)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'unmatched', 'blocked')),
  created_at timestamptz not null default now(),
  unmatched_by uuid references public.profiles(id) on delete set null,
  unmatched_at timestamptz,
  constraint matches_not_self check (user_a <> user_b),
  constraint matches_sorted_users check (user_a < user_b),
  unique (user_a, user_b)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (
    length(trim(body)) > 0
    and length(body) <= 4000
  ),
  moderation_status text not null default 'visible'
    check (moderation_status in ('visible', 'hidden', 'flagged')),
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_not_self check (blocker_id <> blocked_id),
  unique (blocker_id, blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid not null references public.profiles(id) on delete cascade,
  reported_message_id uuid references public.messages(id) on delete set null,
  reason text not null check (length(trim(reason)) > 0),
  details text,
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

create table if not exists public.user_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  min_age int,
  max_age int,
  max_distance_miles int,
  show_me text[] not null default '{}',
  relationship_structures text[] not null default '{}',
  push_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  status text not null default 'requested'
    check (status in ('requested', 'in_progress', 'completed', 'cancelled')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists profile_photos_profile_id_sort_idx
  on public.profile_photos(profile_id, sort_order);

create index if not exists swipes_swiper_id_idx
  on public.swipes(swiper_id);

create index if not exists swipes_target_id_idx
  on public.swipes(target_id);

create index if not exists matches_user_a_status_idx
  on public.matches(user_a, status);

create index if not exists matches_user_b_status_idx
  on public.matches(user_b, status);

create index if not exists messages_match_id_created_at_idx
  on public.messages(match_id, created_at);

create index if not exists blocks_blocker_id_idx
  on public.blocks(blocker_id);

create index if not exists blocks_blocked_id_idx
  on public.blocks(blocked_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

create or replace function private.is_match_member(match_row public.matches)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) = match_row.user_a
    or (select auth.uid()) = match_row.user_b;
$$;

create or replace function private.has_block_between(user_one uuid, user_two uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.blocks b
    where
      (b.blocker_id = user_one and b.blocked_id = user_two)
      or (b.blocker_id = user_two and b.blocked_id = user_one)
  );
$$;

create or replace function private.is_active_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = profile_id
      and p.age_confirmed = true
      and p.is_suspended = false
      and p.onboarding_completed = true
  );
$$;

create or replace function private.is_discoverable_profile(
  viewer_profile_id uuid,
  target_profile_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select viewer_profile_id is not null
    and viewer_profile_id <> target_profile_id
    and private.is_active_profile(viewer_profile_id)
    and exists (
      select 1
      from public.profiles p
      where p.id = target_profile_id
        and p.age_confirmed = true
        and p.is_visible = true
        and p.is_suspended = false
        and p.onboarding_completed = true
        and not private.has_block_between(viewer_profile_id, target_profile_id)
    );
$$;

create or replace function private.can_access_active_match(target_match_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.matches m
    where m.id = target_match_id
      and m.status = 'active'
      and ((select auth.uid()) = m.user_a or (select auth.uid()) = m.user_b)
      and private.is_active_profile((select auth.uid()))
      and not private.has_block_between(m.user_a, m.user_b)
  );
$$;

create or replace function public.create_swipe(
  target_profile_id uuid,
  swipe_decision text
)
returns table (
  swipe_id uuid,
  match_id uuid,
  did_match boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  first_user uuid;
  second_user uuid;
  saved_swipe_id uuid;
  saved_match_id uuid;
  reciprocal_like_exists boolean;
  target_is_eligible boolean;
begin
  if current_profile_id is null then
    raise exception 'not authenticated';
  end if;

  if swipe_decision not in ('like', 'pass') then
    raise exception 'invalid swipe decision';
  end if;

  if target_profile_id is null or target_profile_id = current_profile_id then
    raise exception 'invalid target profile';
  end if;

  if not private.is_active_profile(current_profile_id) then
    raise exception 'current profile is not eligible';
  end if;

  select private.is_discoverable_profile(current_profile_id, target_profile_id)
    into target_is_eligible;

  if target_is_eligible is not true then
    raise exception 'target profile is not eligible';
  end if;

  insert into public.swipes (swiper_id, target_id, decision)
  values (current_profile_id, target_profile_id, swipe_decision)
  on conflict (swiper_id, target_id)
  do update set
    decision = excluded.decision,
    created_at = now()
  returning id into saved_swipe_id;

  if swipe_decision = 'like' then
    select exists (
      select 1
      from public.swipes s
      where s.swiper_id = target_profile_id
        and s.target_id = current_profile_id
        and s.decision = 'like'
    )
    into reciprocal_like_exists;

    if reciprocal_like_exists then
      if current_profile_id < target_profile_id then
        first_user := current_profile_id;
        second_user := target_profile_id;
      else
        first_user := target_profile_id;
        second_user := current_profile_id;
      end if;

      insert into public.matches (user_a, user_b, status)
      values (first_user, second_user, 'active')
      on conflict (user_a, user_b) do nothing
      returning id into saved_match_id;

      if saved_match_id is null then
        select m.id
        from public.matches m
        where m.user_a = first_user
          and m.user_b = second_user
          and m.status = 'active'
        into saved_match_id;
      end if;
    end if;
  end if;

  return query
  select saved_swipe_id, saved_match_id, saved_match_id is not null;
end;
$$;

create or replace function public.unmatch_match(target_match_id uuid)
returns public.matches
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  updated_match public.matches;
begin
  if current_profile_id is null then
    raise exception 'not authenticated';
  end if;

  update public.matches m
  set
    status = 'unmatched',
    unmatched_by = current_profile_id,
    unmatched_at = now()
  where m.id = target_match_id
    and m.status = 'active'
    and (m.user_a = current_profile_id or m.user_b = current_profile_id)
  returning * into updated_match;

  if updated_match.id is null then
    raise exception 'active match not found';
  end if;

  return updated_match;
end;
$$;

create or replace function public.block_profile(blocked_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  saved_block_id uuid;
begin
  if current_profile_id is null then
    raise exception 'not authenticated';
  end if;

  if blocked_profile_id is null or blocked_profile_id = current_profile_id then
    raise exception 'invalid blocked profile';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = blocked_profile_id
  ) then
    raise exception 'blocked profile not found';
  end if;

  insert into public.blocks (blocker_id, blocked_id)
  values (current_profile_id, blocked_profile_id)
  on conflict (blocker_id, blocked_id) do nothing
  returning id into saved_block_id;

  if saved_block_id is null then
    select b.id
    from public.blocks b
    where b.blocker_id = current_profile_id
      and b.blocked_id = blocked_profile_id
    into saved_block_id;
  end if;

  update public.matches m
  set
    status = 'blocked',
    unmatched_by = current_profile_id,
    unmatched_at = coalesce(m.unmatched_at, now())
  where (
      (m.user_a = current_profile_id and m.user_b = blocked_profile_id)
      or (m.user_a = blocked_profile_id and m.user_b = current_profile_id)
    )
    and m.status <> 'blocked';

  return saved_block_id;
end;
$$;

create or replace function public.submit_report(
  reported_profile_id uuid,
  report_reason text,
  report_details text default null,
  reported_message_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  saved_report_id uuid;
begin
  if current_profile_id is null then
    raise exception 'not authenticated';
  end if;

  if reported_profile_id is null or reported_profile_id = current_profile_id then
    raise exception 'invalid reported profile';
  end if;

  if report_reason is null or length(trim(report_reason)) = 0 then
    raise exception 'report reason is required';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = reported_profile_id
  ) then
    raise exception 'reported profile not found';
  end if;

  if reported_message_id is not null and not exists (
    select 1
    from public.messages msg
    join public.matches m on m.id = msg.match_id
    where msg.id = reported_message_id
      and msg.sender_id = reported_profile_id
      and (m.user_a = current_profile_id or m.user_b = current_profile_id)
  ) then
    raise exception 'reported message is not accessible';
  end if;

  insert into public.reports (
    reporter_id,
    reported_user_id,
    reported_message_id,
    reason,
    details,
    status
  )
  values (
    current_profile_id,
    reported_profile_id,
    reported_message_id,
    report_reason,
    report_details,
    'open'
  )
  returning id into saved_report_id;

  return saved_report_id;
end;
$$;

create or replace function public.request_account_deletion(
  deletion_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  saved_request_id uuid;
begin
  if current_profile_id is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = current_profile_id
  ) then
    raise exception 'profile not found';
  end if;

  insert into public.account_deletion_requests (profile_id, reason, status)
  values (current_profile_id, deletion_reason, 'requested')
  returning id into saved_request_id;

  return saved_request_id;
end;
$$;

revoke all on function public.create_swipe(uuid, text) from public;
revoke all on function public.unmatch_match(uuid) from public;
revoke all on function public.block_profile(uuid) from public;
revoke all on function public.submit_report(uuid, text, text, uuid) from public;
revoke all on function public.request_account_deletion(text) from public;

grant execute on function public.create_swipe(uuid, text) to authenticated;
grant execute on function public.unmatch_match(uuid) to authenticated;
grant execute on function public.block_profile(uuid) to authenticated;
grant execute on function public.submit_report(uuid, text, text, uuid) to authenticated;
grant execute on function public.request_account_deletion(text) to authenticated;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;
grant usage on schema private to authenticated;

revoke all on all functions in schema private from public;
revoke all on all functions in schema private from anon;
revoke all on all functions in schema private from authenticated;
grant execute on all functions in schema private to authenticated;

revoke all on all tables in schema public from public;
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select on public.profiles to authenticated;
grant insert (
  id,
  display_name,
  birthdate,
  age_confirmed,
  city,
  region,
  country,
  latitude_approx,
  longitude_approx,
  gender,
  orientation,
  relationship_structure,
  partnered_status,
  dating_mode,
  looking_for,
  boundaries,
  bio,
  is_visible,
  onboarding_completed,
  last_active_at
) on public.profiles to authenticated;
grant update (
  display_name,
  birthdate,
  age_confirmed,
  city,
  region,
  country,
  latitude_approx,
  longitude_approx,
  gender,
  orientation,
  relationship_structure,
  partnered_status,
  dating_mode,
  looking_for,
  boundaries,
  bio,
  is_visible,
  onboarding_completed,
  last_active_at
) on public.profiles to authenticated;

grant select on public.profile_photos to authenticated;
grant insert (profile_id, storage_path, sort_order)
  on public.profile_photos to authenticated;
grant update (storage_path, sort_order)
  on public.profile_photos to authenticated;

grant select on public.swipes to authenticated;
grant select on public.matches to authenticated;
grant select on public.messages to authenticated;
grant insert (match_id, sender_id, body) on public.messages to authenticated;
grant select on public.blocks to authenticated;
grant select on public.reports to authenticated;
grant select on public.account_deletion_requests to authenticated;

grant select, insert, update on public.user_settings to authenticated;

alter table public.profiles enable row level security;
alter table public.profile_photos enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.user_settings enable row level security;
alter table public.account_deletion_requests enable row level security;

create policy "profiles_select_visible_eligible"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or private.is_discoverable_profile((select auth.uid()), id)
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = (select auth.uid()));

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "profile_photos_select_visible_or_own"
on public.profile_photos
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or private.is_discoverable_profile((select auth.uid()), profile_id)
);

create policy "profile_photos_insert_own"
on public.profile_photos
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy "profile_photos_update_own"
on public.profile_photos
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "swipes_select_own"
on public.swipes
for select
to authenticated
using (swiper_id = (select auth.uid()));

create policy "matches_select_member"
on public.matches
for select
to authenticated
using (
  private.is_match_member(matches)
  and not private.has_block_between(user_a, user_b)
);

create policy "messages_select_active_match_member"
on public.messages
for select
to authenticated
using (private.can_access_active_match(match_id));

create policy "messages_insert_active_match_member"
on public.messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and private.can_access_active_match(match_id)
);

create policy "blocks_select_own"
on public.blocks
for select
to authenticated
using (blocker_id = (select auth.uid()) or blocked_id = (select auth.uid()));

create policy "reports_select_own"
on public.reports
for select
to authenticated
using (reporter_id = (select auth.uid()));

create policy "user_settings_select_own"
on public.user_settings
for select
to authenticated
using (profile_id = (select auth.uid()));

create policy "user_settings_insert_own"
on public.user_settings
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy "user_settings_update_own"
on public.user_settings
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "account_deletion_requests_select_own"
on public.account_deletion_requests
for select
to authenticated
using (profile_id = (select auth.uid()));

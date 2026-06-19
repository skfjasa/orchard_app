-- Initial Orchard MVP schema draft.
-- Not yet applied to a live Supabase project.
-- Review RLS and policies before using outside a development project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  birthdate date,
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
  moderation_status text not null default 'pending',
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
  body text not null,
  moderation_status text not null default 'visible',
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
  reason text not null,
  details text,
  status text not null default 'open',
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
  status text not null default 'requested',
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

create or replace function public.is_match_member(match_row public.matches)
returns boolean
language sql
stable
as $$
  select auth.uid() = match_row.user_a or auth.uid() = match_row.user_b;
$$;

create or replace function public.has_block_between(user_one uuid, user_two uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.blocks b
    where
      (b.blocker_id = user_one and b.blocked_id = user_two)
      or (b.blocker_id = user_two and b.blocked_id = user_one)
  );
$$;

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
using (
  id = auth.uid()
  or (
    is_visible = true
    and is_suspended = false
    and not public.has_block_between(auth.uid(), id)
  )
);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "profile_photos_select_visible_or_own"
on public.profile_photos
for select
using (
  profile_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = public.profile_photos.profile_id
      and p.is_visible = true
      and p.is_suspended = false
      and not public.has_block_between(auth.uid(), p.id)
  )
);

create policy "profile_photos_insert_own"
on public.profile_photos
for insert
with check (profile_id = auth.uid());

create policy "profile_photos_update_own"
on public.profile_photos
for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "swipes_select_own"
on public.swipes
for select
using (swiper_id = auth.uid());

create policy "swipes_insert_own_unblocked"
on public.swipes
for insert
with check (
  swiper_id = auth.uid()
  and not public.has_block_between(swiper_id, target_id)
);

create policy "matches_select_member"
on public.matches
for select
using (
  public.is_match_member(matches)
  and not public.has_block_between(user_a, user_b)
);

create policy "messages_select_active_match_member"
on public.messages
for select
using (
  exists (
    select 1
    from public.matches m
    where m.id = public.messages.match_id
      and m.status = 'active'
      and public.is_match_member(m)
      and not public.has_block_between(m.user_a, m.user_b)
  )
);

create policy "messages_insert_active_match_member"
on public.messages
for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.matches m
    where m.id = public.messages.match_id
      and m.status = 'active'
      and public.is_match_member(m)
      and not public.has_block_between(m.user_a, m.user_b)
  )
);

create policy "blocks_select_own"
on public.blocks
for select
using (blocker_id = auth.uid() or blocked_id = auth.uid());

create policy "blocks_insert_own"
on public.blocks
for insert
with check (blocker_id = auth.uid());

create policy "reports_insert_authenticated"
on public.reports
for insert
with check (reporter_id = auth.uid());

create policy "reports_select_own"
on public.reports
for select
using (reporter_id = auth.uid());

create policy "user_settings_select_own"
on public.user_settings
for select
using (profile_id = auth.uid());

create policy "user_settings_insert_own"
on public.user_settings
for insert
with check (profile_id = auth.uid());

create policy "user_settings_update_own"
on public.user_settings
for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "account_deletion_requests_insert_own"
on public.account_deletion_requests
for insert
with check (profile_id = auth.uid());

create policy "account_deletion_requests_select_own"
on public.account_deletion_requests
for select
using (profile_id = auth.uid());

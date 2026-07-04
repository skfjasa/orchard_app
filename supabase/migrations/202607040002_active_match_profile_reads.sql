-- Active matches must remain readable after discovery/swipe state changes so
-- Matches, Inbox, and Chat can hydrate the other profile from backend state.

create or replace function private.has_active_match_between(user_one uuid, user_two uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select user_one is not null
    and user_two is not null
    and user_one <> user_two
    and exists (
      select 1
      from public.matches m
      where m.status = 'active'
        and (
          (m.user_a = user_one and m.user_b = user_two)
          or (m.user_a = user_two and m.user_b = user_one)
        )
        and not private.has_block_between(user_one, user_two)
    );
$$;

drop policy if exists "profiles_select_visible_eligible" on public.profiles;
create policy "profiles_select_visible_eligible"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or private.is_discoverable_profile((select auth.uid()), id)
  or private.has_active_match_between((select auth.uid()), id)
);

drop policy if exists "profile_members_select_visible_or_own" on public.profile_members;
create policy "profile_members_select_visible_or_own"
on public.profile_members
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or private.is_discoverable_profile((select auth.uid()), profile_id)
  or private.has_active_match_between((select auth.uid()), profile_id)
);

drop policy if exists "profile_photos_select_visible_or_own" on public.profile_photos;
create policy "profile_photos_select_visible_or_own"
on public.profile_photos
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or private.is_discoverable_profile((select auth.uid()), profile_id)
  or private.has_active_match_between((select auth.uid()), profile_id)
);

drop policy if exists "profile_photos_storage_select_visible_or_own"
on storage.objects;

create policy "profile_photos_storage_select_visible_or_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-photos'
  and exists (
    select 1
    from public.profile_photos pp
    where pp.storage_path = storage.objects.name
      and (
        pp.profile_id = (select auth.uid())
        or private.is_discoverable_profile((select auth.uid()), pp.profile_id)
        or private.has_active_match_between((select auth.uid()), pp.profile_id)
      )
  )
);

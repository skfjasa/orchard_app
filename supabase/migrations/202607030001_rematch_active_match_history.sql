-- Allow a later rematch to create a fresh active match row while preserving
-- prior inactive match history for the same profile pair.

alter table public.matches
drop constraint if exists matches_user_a_user_b_key;

create unique index if not exists matches_one_active_pair_idx
on public.matches (user_a, user_b)
where status = 'active';

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
  current_is_fixture boolean;
  target_is_fixture boolean;
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

  select coalesce(p.is_test_fixture, false)
  from public.profiles p
  where p.id = current_profile_id
  into current_is_fixture;

  select coalesce(p.is_test_fixture, false)
  from public.profiles p
  where p.id = target_profile_id
  into target_is_fixture;

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

    if (
      target_is_fixture is true
      and current_is_fixture is not true
    ) or (
      reciprocal_like_exists
      and not (current_is_fixture is true and target_is_fixture is true)
    ) then
      if current_profile_id < target_profile_id then
        first_user := current_profile_id;
        second_user := target_profile_id;
      else
        first_user := target_profile_id;
        second_user := current_profile_id;
      end if;

      insert into public.matches (user_a, user_b, status)
      values (first_user, second_user, 'active')
      on conflict (user_a, user_b) where status = 'active'
      do update set status = excluded.status
      returning id into saved_match_id;
    end if;
  end if;

  return query
  select saved_swipe_id, saved_match_id, saved_match_id is not null;
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
    and m.status = 'active';

  return saved_block_id;
end;
$$;

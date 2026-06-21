-- Support dev fixture profiles and guarantee default user settings.

alter table public.profiles
add column if not exists is_test_fixture boolean not null default false;

create or replace function private.ensure_user_settings_for_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_settings (
    profile_id,
    min_age,
    max_age,
    max_distance_miles,
    show_me,
    relationship_structures
  )
  values (
    new.id,
    18,
    99,
    50,
    coalesce(new.looking_for, '{}'),
    coalesce(new.relationship_structure, '{}')
  )
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists profiles_ensure_user_settings on public.profiles;
create trigger profiles_ensure_user_settings
after insert on public.profiles
for each row
execute function private.ensure_user_settings_for_profile();

insert into public.user_settings (
  profile_id,
  min_age,
  max_age,
  max_distance_miles,
  show_me,
  relationship_structures
)
select
  p.id,
  18,
  99,
  50,
  coalesce(p.looking_for, '{}'),
  coalesce(p.relationship_structure, '{}')
from public.profiles p
on conflict (profile_id) do nothing;

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

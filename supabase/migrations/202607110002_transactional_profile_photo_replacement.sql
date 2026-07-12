-- Replace explicitly targeted profile-photo slots in one transaction and
-- return the exact object paths displaced by the committed metadata state.

create or replace function public.replace_profile_photos(
  desired_photos jsonb,
  removed_slots jsonb default '[]'::jsonb
)
returns table (
  committed_photos jsonb,
  displaced_paths text[]
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id uuid := auth.uid();
  displaced_candidates text[] := array[]::text[];
begin
  if current_profile_id is null then
    raise exception 'not authenticated';
  end if;

  if jsonb_typeof(desired_photos) <> 'array' then
    raise exception 'desired photos must be an array';
  end if;

  if jsonb_typeof(removed_slots) <> 'array' then
    raise exception 'removed slots must be an array';
  end if;

  -- Lock the owner profile even when it has no photo rows yet, so concurrent
  -- first-photo replacement attempts serialize as well.
  perform profile.id
  from public.profiles profile
  where profile.id = current_profile_id
  for update;

  if exists (
    select 1
    from jsonb_to_recordset(desired_photos) as desired(
      member_id uuid,
      storage_path text,
      sort_order integer
    )
    where desired.member_id is null
      or desired.storage_path is null
      or desired.sort_order is null
      or desired.sort_order < 0
  ) then
    raise exception 'desired photo entries are invalid';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(removed_slots) as removed(
      member_id uuid,
      sort_order integer
    )
    where removed.member_id is null
      or removed.sort_order is null
      or removed.sort_order < 0
  ) then
    raise exception 'removed photo slots are invalid';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(desired_photos) as desired(
      member_id uuid,
      storage_path text,
      sort_order integer
    )
    left join public.profile_members member
      on member.id = desired.member_id
      and member.profile_id = current_profile_id
    where member.id is null
  ) or exists (
    select 1
    from jsonb_to_recordset(removed_slots) as removed(
      member_id uuid,
      sort_order integer
    )
    left join public.profile_members member
      on member.id = removed.member_id
      and member.profile_id = current_profile_id
    where member.id is null
  ) then
    raise exception 'photo member does not belong to current profile';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(desired_photos) as desired(
      member_id uuid,
      storage_path text,
      sort_order integer
    )
    where not private.is_owned_profile_photo_path(
      current_profile_id,
      desired.storage_path
    )
  ) then
    raise exception 'photo path is not owned by current profile';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(desired_photos) as desired(
      member_id uuid,
      storage_path text,
      sort_order integer
    )
    group by desired.member_id, desired.sort_order
    having count(*) > 1
  ) then
    raise exception 'duplicate desired photo slot';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(desired_photos) as desired(
      member_id uuid,
      storage_path text,
      sort_order integer
    )
    group by desired.storage_path
    having count(*) > 1
  ) then
    raise exception 'duplicate desired photo path';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(desired_photos) as desired(
      member_id uuid,
      storage_path text,
      sort_order integer
    )
    join public.profile_photos existing
      on existing.profile_id = current_profile_id
      and existing.storage_path = desired.storage_path
      and (
        existing.member_id <> desired.member_id
        or existing.sort_order <> desired.sort_order
      )
  ) then
    raise exception 'desired photo path is already assigned to another slot';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(removed_slots) as removed(
      member_id uuid,
      sort_order integer
    )
    group by removed.member_id, removed.sort_order
    having count(*) > 1
  ) then
    raise exception 'duplicate removed photo slot';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(desired_photos) as desired(
      member_id uuid,
      storage_path text,
      sort_order integer
    )
    join jsonb_to_recordset(removed_slots) as removed(
      member_id uuid,
      sort_order integer
    )
      on removed.member_id = desired.member_id
      and removed.sort_order = desired.sort_order
  ) then
    raise exception 'photo slot cannot be desired and removed';
  end if;

  -- Lock existing metadata before deriving displaced paths. The function
  -- transaction rolls every metadata statement back on any later exception.
  perform photo.id
  from public.profile_photos photo
  where photo.profile_id = current_profile_id
  for update;

  select coalesce(
    array_agg(distinct displaced.storage_path),
    array[]::text[]
  )
  into displaced_candidates
  from (
    select existing.storage_path
    from public.profile_photos existing
    join jsonb_to_recordset(desired_photos) as desired(
      member_id uuid,
      storage_path text,
      sort_order integer
    )
      on desired.member_id = existing.member_id
      and desired.sort_order = existing.sort_order
    where existing.profile_id = current_profile_id
      and existing.storage_path <> desired.storage_path

    union all

    select existing.storage_path
    from public.profile_photos existing
    join jsonb_to_recordset(removed_slots) as removed(
      member_id uuid,
      sort_order integer
    )
      on removed.member_id = existing.member_id
      and removed.sort_order = existing.sort_order
    where existing.profile_id = current_profile_id
  ) displaced;

  delete from public.profile_photos existing
  using jsonb_to_recordset(removed_slots) as removed(
    member_id uuid,
    sort_order integer
  )
  where existing.profile_id = current_profile_id
    and existing.member_id = removed.member_id
    and existing.sort_order = removed.sort_order;

  insert into public.profile_photos as existing (
    profile_id,
    member_id,
    storage_path,
    sort_order,
    moderation_status
  )
  select
    current_profile_id,
    desired.member_id,
    desired.storage_path,
    desired.sort_order,
    'pending'
  from jsonb_to_recordset(desired_photos) as desired(
    member_id uuid,
    storage_path text,
    sort_order integer
  )
  on conflict (profile_id, member_id, sort_order)
  do update set
    storage_path = excluded.storage_path,
    moderation_status = case
      when existing.storage_path = excluded.storage_path
        then existing.moderation_status
      else 'pending'
    end;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', photo.id,
        'profile_id', photo.profile_id,
        'member_id', photo.member_id,
        'storage_path', photo.storage_path,
        'sort_order', photo.sort_order,
        'moderation_status', photo.moderation_status,
        'created_at', photo.created_at
      )
      order by photo.member_id, photo.sort_order
    ),
    '[]'::jsonb
  )
  into committed_photos
  from public.profile_photos photo
  where photo.profile_id = current_profile_id;

  select coalesce(
    array_agg(candidate order by candidate),
    array[]::text[]
  )
  into displaced_paths
  from unnest(displaced_candidates) candidate
  where not exists (
    select 1
    from public.profile_photos committed
    where committed.profile_id = current_profile_id
      and committed.storage_path = candidate
  );

  return next;
end;
$$;

revoke all on function public.replace_profile_photos(jsonb, jsonb)
from public, anon;
grant execute on function public.replace_profile_photos(jsonb, jsonb)
to authenticated;

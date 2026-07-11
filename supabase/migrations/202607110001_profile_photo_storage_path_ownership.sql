-- Bind every profile photo metadata row to an object path owned by that
-- profile. Storage visibility can then safely trust public.profile_photos.

create or replace function private.is_owned_profile_photo_path(
  owner_profile_id uuid,
  object_path text
)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select coalesce(
    owner_profile_id is not null
    and object_path is not null
    and object_path = btrim(object_path)
    and length(object_path) > 0
    and cardinality(string_to_array(object_path, '/')) = 3
    and split_part(object_path, '/', 1) = owner_profile_id::text
    and split_part(object_path, '/', 2) ~ '^[a-z][a-z0-9_]*$'
    and split_part(object_path, '/', 3) ~ '^[A-Za-z0-9][A-Za-z0-9._-]*$'
    and split_part(object_path, '/', 3) not in ('.', '..'),
    false
  );
$$;

revoke all on function private.is_owned_profile_photo_path(uuid, text)
from public, anon;
grant execute on function private.is_owned_profile_photo_path(uuid, text)
to authenticated, service_role;

-- Fail before adding the constraint if hosted metadata needs human review.
-- Do not infer ownership from the path or delete/rewrite rows automatically.
do $$
declare
  invalid_row_count bigint;
  invalid_row_examples text;
begin
  select count(*)
  into invalid_row_count
  from public.profile_photos pp
  where not private.is_owned_profile_photo_path(
    pp.profile_id,
    pp.storage_path
  );

  if invalid_row_count > 0 then
    select string_agg(
      format(
        'id=%s profile_id=%s storage_path=%L',
        invalid.id,
        invalid.profile_id,
        invalid.storage_path
      ),
      '; '
    )
    into invalid_row_examples
    from (
      select pp.id, pp.profile_id, pp.storage_path
      from public.profile_photos pp
      where not private.is_owned_profile_photo_path(
        pp.profile_id,
        pp.storage_path
      )
      order by pp.id
      limit 10
    ) invalid;

    raise exception
      'profile_photos storage path ownership preflight failed for % row(s)',
      invalid_row_count
      using
        errcode = '23514',
        detail = invalid_row_examples,
        hint = 'Review the reported metadata rows and remediate them explicitly before rerunning this migration.';
  end if;
end;
$$;

alter table public.profile_photos
add constraint profile_photos_storage_path_owned
check (
  private.is_owned_profile_photo_path(profile_id, storage_path)
);

drop policy if exists "profile_photos_insert_own"
on public.profile_photos;

create policy "profile_photos_insert_own"
on public.profile_photos
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and private.is_owned_profile_photo_path(profile_id, storage_path)
);

drop policy if exists "profile_photos_update_own"
on public.profile_photos;

create policy "profile_photos_update_own"
on public.profile_photos
for update
to authenticated
using (
  profile_id = (select auth.uid())
  and private.is_owned_profile_photo_path(profile_id, storage_path)
)
with check (
  profile_id = (select auth.uid())
  and private.is_owned_profile_photo_path(profile_id, storage_path)
);

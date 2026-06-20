insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'profile-photos',
  'profile-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profile_photos_profile_member_sort_unique'
      and conrelid = 'public.profile_photos'::regclass
  ) then
    alter table public.profile_photos
      add constraint profile_photos_profile_member_sort_unique
      unique (profile_id, member_id, sort_order);
  end if;
end;
$$;

drop policy if exists "profile_photos_storage_select_own" on storage.objects;
create policy "profile_photos_storage_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "profile_photos_storage_insert_own" on storage.objects;
create policy "profile_photos_storage_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "profile_photos_storage_update_own" on storage.objects;
create policy "profile_photos_storage_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "profile_photos_storage_delete_own" on storage.objects;
create policy "profile_photos_storage_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

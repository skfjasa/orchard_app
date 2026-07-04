-- Let eligible discovery viewers sign private profile photo objects.
-- The public.profile_photos row policy already allows visible/eligible reads;
-- storage.objects needs the same visibility rule for createSignedUrl.

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
      )
  )
);

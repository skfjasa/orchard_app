begin;

create extension if not exists pgtap with schema extensions;

select plan(75);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'a@example.test',
    'test',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'b@example.test',
    'test',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'invisible@example.test',
    'test',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'suspended@example.test',
    'test',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'incomplete@example.test',
    'test',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'underage@example.test',
    'test',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false
  )
on conflict (id) do nothing;

insert into public.profiles (
  id,
  display_name,
  birthdate,
  age_confirmed,
  city,
  is_visible,
  is_suspended,
  onboarding_completed
)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Active A',
    '1990-01-01',
    true,
    'Portland',
    true,
    false,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Active B',
    '1991-01-01',
    true,
    'Portland',
    true,
    false,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Invisible',
    '1992-01-01',
    true,
    'Portland',
    false,
    false,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Suspended',
    '1993-01-01',
    true,
    'Portland',
    true,
    true,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Incomplete',
    '1994-01-01',
    true,
    'Portland',
    true,
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'No Age Gate',
    '2010-01-01',
    false,
    'Portland',
    true,
    false,
    true
  );

select is(
  (
    select count(*)::int
    from public.user_settings
    where profile_id = '00000000-0000-0000-0000-000000000001'
      and min_age = 18
      and max_age = 99
      and max_distance_miles = 50
  ),
  1,
  'profile insert creates default user settings'
);

insert into public.profile_members (
  id,
  profile_id,
  display_name,
  birthdate,
  gender,
  orientation,
  bio,
  sort_order
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Active A',
    '1990-01-01',
    'nonbinary',
    'queer',
    'A test profile member',
    0
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    'Active B',
    '1991-01-01',
    'woman',
    'bisexual',
    'B test profile member',
    0
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Invisible',
    '1992-01-01',
    null,
    null,
    null,
    0
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    'Incomplete',
    '1994-01-01',
    null,
    null,
    null,
    0
  );

insert into public.profile_photos (profile_id, member_id, storage_path, sort_order, moderation_status)
values
  (
    '00000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002/profile_photo/photo.jpg',
    0,
    'approved'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005/profile_photo/photo.jpg',
    0,
    'approved'
  );

insert into storage.objects (bucket_id, name, owner_id)
values
  (
    'profile-photos',
    '00000000-0000-0000-0000-000000000002/profile_photo/photo.jpg',
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    'profile-photos',
    '00000000-0000-0000-0000-000000000005/profile_photo/photo.jpg',
    '00000000-0000-0000-0000-000000000005'
  )
on conflict (bucket_id, name) do nothing;

select is(
  (
    select public
    from storage.buckets
    where id = 'profile-photos'
  ),
  false,
  'profile photos storage bucket is private'
);

select is(
  (
    select count(*)::int
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname like 'profile_photos_storage_%'
  ),
  5,
  'profile photo storage has expected object policies'
);

select is(
  (
    select count(*)::int
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'profile_photos_storage_select_visible_or_own'
  ),
  1,
  'profile photo storage allows visible profile object reads'
);

select is(
  (
    select count(*)::int
    from pg_constraint
    where conname = 'profile_photos_profile_member_sort_unique'
      and conrelid = 'public.profile_photos'::regclass
  ),
  1,
  'profile photos can be upserted by profile member and sort order'
);

select is(
  (
    select count(*)::int
    from pg_constraint
    where conname = 'profile_photos_storage_path_owned'
      and conrelid = 'public.profile_photos'::regclass
  ),
  1,
  'profile photo metadata has a storage path ownership constraint'
);

select is(
  (
    select provolatile
    from pg_proc
    where oid = 'private.is_owned_profile_photo_path(uuid, text)'::regprocedure
  ),
  'i'::"char",
  'profile photo path ownership predicate is immutable'
);

select is(
  (
    select count(*)::int
    from public.profile_photos pp
    where not private.is_owned_profile_photo_path(
      pp.profile_id,
      pp.storage_path
    )
  ),
  0,
  'existing valid owner-prefixed photo metadata passes preflight'
);

select is(
  private.is_owned_profile_photo_path(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002/profile_photo/photo.jpg'
  ),
  false,
  'preflight identifies a cross-owned storage path'
);

select is(
  private.is_owned_profile_photo_path(
    '00000000-0000-0000-0000-000000000001',
    '/profile_photo/photo.jpg'
  ),
  false,
  'preflight identifies a malformed storage path'
);

select is(
  (
    select count(*)::int
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_photos'
      and policyname = 'profile_photos_insert_own'
      and position('is_owned_profile_photo_path' in with_check) > 0
  ),
  1,
  'profile photo insert policy checks path ownership'
);

select is(
  (
    select count(*)::int
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_photos'
      and policyname = 'profile_photos_update_own'
      and position('is_owned_profile_photo_path' in qual) > 0
      and position('is_owned_profile_photo_path' in with_check) > 0
  ),
  1,
  'profile photo update policy checks existing and resulting path ownership'
);

set local role anon;
select throws_ok(
  $$ select count(*) from public.profiles $$,
  '42501',
  'permission denied for table profiles',
  'anon cannot read profiles'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (
    select count(*)::int
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000001'
  ),
  1,
  'authenticated user can read own profile'
);

select is(
  (
    select count(*)::int
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000002'
  ),
  1,
  'authenticated user can read eligible visible profile'
);

select is(
  (
    select count(*)::int
    from public.profiles
    where id in (
      '00000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000004',
      '00000000-0000-0000-0000-000000000005',
      '00000000-0000-0000-0000-000000000006'
    )
  ),
  0,
  'invisible suspended incomplete and age-unconfirmed profiles are hidden'
);

select is(
  (select count(*)::int from public.profile_members
   where profile_id = '00000000-0000-0000-0000-000000000005'),
  0,
  'other users cannot read incomplete profile members through discovery'
);

select is(
  (select count(*)::int from public.profile_photos
   where profile_id = '00000000-0000-0000-0000-000000000005'),
  0,
  'other users cannot read incomplete profile photos through discovery'
);

select is(
  (select count(*)::int from storage.objects
   where bucket_id = 'profile-photos'
     and name = '00000000-0000-0000-0000-000000000005/profile_photo/photo.jpg'),
  0,
  'other users cannot read incomplete profile photo objects'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.profiles
   where id = '00000000-0000-0000-0000-000000000005'),
  1,
  'owner can read their own incomplete profile for resumption'
);

select is(
  (select count(*)::int from public.profile_members
   where profile_id = '00000000-0000-0000-0000-000000000005'),
  1,
  'owner can read their own incomplete profile members for resumption'
);

select is(
  (select count(*)::int from public.profile_photos
   where profile_id = '00000000-0000-0000-0000-000000000005'),
  1,
  'owner can read their own incomplete profile photos for resumption'
);

reset role;
update public.profiles
set onboarding_completed = true,
    is_visible = false
where id = '00000000-0000-0000-0000-000000000005';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.profiles
   where id = '00000000-0000-0000-0000-000000000005'),
  0,
  'completed but invisible profile is not discoverable'
);

reset role;
update public.profiles
set is_visible = true
where id = '00000000-0000-0000-0000-000000000005';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (select count(*)::int from public.profiles
   where id = '00000000-0000-0000-0000-000000000005'),
  1,
  'profile becomes discoverable only after completion and visibility are both true'
);

reset role;
update public.profiles
set onboarding_completed = false,
    is_visible = false
where id = '00000000-0000-0000-0000-000000000005';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (
    select count(*)::int
    from public.profile_photos
    where profile_id = '00000000-0000-0000-0000-000000000002'
  ),
  1,
  'eligible profile photos are readable'
);

select is(
  (
    select count(*)::int
    from storage.objects
    where bucket_id = 'profile-photos'
      and name = '00000000-0000-0000-0000-000000000002/profile_photo/photo.jpg'
  ),
  1,
  'eligible viewer can read a valid visible profile photo object'
);

select lives_ok(
  $$
    insert into public.profile_photos (
      profile_id,
      member_id,
      storage_path,
      sort_order
    )
    values (
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000001/profile_photo/owner.jpg',
      1
    )
  $$,
  'owner can insert metadata for an owner-prefixed storage path'
);

reset role;

insert into storage.objects (bucket_id, name, owner_id)
values (
  'profile-photos',
  '00000000-0000-0000-0000-000000000001/profile_photo/owner.jpg',
  '00000000-0000-0000-0000-000000000001'
)
on conflict (bucket_id, name) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$
    insert into public.profile_photos (
      profile_id,
      member_id,
      storage_path,
      sort_order
    )
    values (
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002/profile_photo/photo.jpg',
      3
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "profile_photos"',
  'owner cannot insert metadata referencing another profile path'
);

select throws_ok(
  $$
    insert into public.profile_photos (
      profile_id,
      member_id,
      storage_path,
      sort_order
    )
    values (
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      '',
      3
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "profile_photos"',
  'owner cannot insert blank photo metadata path'
);

select throws_ok(
  $$
    insert into public.profile_photos (
      profile_id,
      member_id,
      storage_path,
      sort_order
    )
    values (
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000001//photo.jpg',
      3
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "profile_photos"',
  'owner cannot insert malformed photo metadata path'
);

select throws_ok(
  $$
    update public.profile_photos
    set storage_path = '00000000-0000-0000-0000-000000000002/profile_photo/photo.jpg'
    where profile_id = '00000000-0000-0000-0000-000000000001'
      and sort_order = 1
  $$,
  '42501',
  'new row violates row-level security policy for table "profile_photos"',
  'owner cannot update metadata to another profile path'
);

select throws_ok(
  $$
    update public.profile_photos
    set profile_id = '00000000-0000-0000-0000-000000000002'
    where profile_id = '00000000-0000-0000-0000-000000000001'
      and sort_order = 1
  $$,
  '42501',
  'permission denied for table profile_photos',
  'owner cannot change photo metadata to another profile id'
);

select lives_ok(
  $$
    update public.profile_photos
    set sort_order = 2
    where profile_id = '00000000-0000-0000-0000-000000000001'
      and sort_order = 1
  $$,
  'owner can update nonownership metadata while retaining an owned path'
);

select is(
  (
    select count(*)::int
    from public.profile_photos
    where profile_id = '00000000-0000-0000-0000-000000000001'
      and storage_path = '00000000-0000-0000-0000-000000000001/profile_photo/owner.jpg'
      and sort_order = 2
  ),
  1,
  'valid owner-prefixed metadata remains intact after allowed update'
);

reset role;

select throws_ok(
  $$
    insert into public.profile_photos (
      profile_id,
      member_id,
      storage_path,
      sort_order
    )
    values (
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002/profile_photo/photo.jpg',
      3
    )
  $$,
  '23514',
  'new row for relation "profile_photos" violates check constraint "profile_photos_storage_path_owned"',
  'constraint rejects cross-owned metadata even when RLS is bypassed'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (
    select count(*)::int
    from public.profile_members
    where profile_id = '00000000-0000-0000-0000-000000000002'
  ),
  1,
  'eligible profile members are readable'
);

select throws_ok(
  $$
    insert into public.profile_members (
      profile_id,
      display_name,
      birthdate,
      sort_order
    )
    values (
      '00000000-0000-0000-0000-000000000002',
      'Not Mine',
      '1990-01-01',
      1
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "profile_members"',
  'client cannot insert profile members for another profile'
);

select throws_ok(
  $$
    insert into public.profile_photos (
      profile_id,
      member_id,
      storage_path,
      sort_order
    )
    values (
      '00000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000001/profile_photo/wrong-member.jpg',
      1
    )
  $$,
  '23503',
  'insert or update on table "profile_photos" violates foreign key constraint "profile_photos_member_id_profile_id_fkey"',
  'profile photos must reference a member on the same profile'
);

select throws_ok(
  $$
    update public.profiles
    set is_suspended = true
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  '42501',
  'permission denied for table profiles',
  'client cannot update trusted suspension field'
);

select throws_ok(
  $$
    insert into public.reports (
      reporter_id,
      reported_user_id,
      reason,
      status
    )
    values (
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      'spam',
      'resolved'
    )
  $$,
  '42501',
  'permission denied for table reports',
  'client cannot directly insert report workflow state'
);

select lives_ok(
  $$ select public.submit_report(
    '00000000-0000-0000-0000-000000000002',
    'spam',
    'test report',
    null
  ) $$,
  'report RPC derives reporter and writes open report'
);

select is(
  (
    select count(*)::int
    from public.reports
    where reporter_id = '00000000-0000-0000-0000-000000000001'
      and reported_user_id = '00000000-0000-0000-0000-000000000002'
      and status = 'open'
  ),
  1,
  'report RPC stores an open report for the authenticated reporter'
);

select lives_ok(
  $$ select * from public.create_swipe(
    '00000000-0000-0000-0000-000000000002',
    'like'
  ) $$,
  'eligible user can like eligible target'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$ select * from public.create_swipe(
    '00000000-0000-0000-0000-000000000001',
    'like'
  ) $$,
  'reciprocal like succeeds'
);

select is(
  (
    select count(*)::int
    from public.matches
    where status = 'active'
  ),
  1,
  'reciprocal likes create one active match'
);

reset role;

update public.profiles
set is_visible = false
where id = '00000000-0000-0000-0000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (
    select count(*)::int
    from public.profile_photos
    where profile_id = '00000000-0000-0000-0000-000000000001'
  ),
  1,
  'active match can read valid photo metadata after discovery eligibility ends'
);

select is(
  (
    select count(*)::int
    from storage.objects
    where bucket_id = 'profile-photos'
      and name = '00000000-0000-0000-0000-000000000001/profile_photo/owner.jpg'
  ),
  1,
  'active match can read valid photo object after discovery eligibility ends'
);

reset role;

update public.profiles
set is_visible = true
where id = '00000000-0000-0000-0000-000000000001';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$ select * from public.create_swipe(
    '10000000-0000-4000-8000-000000000001',
    'like'
  ) $$,
  'real user can like seeded fixture profile'
);

select is(
  (
    select count(*)::int
    from public.matches
    where status = 'active'
      and (
        user_a = '10000000-0000-4000-8000-000000000001'
        or user_b = '10000000-0000-4000-8000-000000000001'
      )
  ),
  1,
  'seeded fixture profile auto-matches real user likes'
);

reset role;

update public.matches
set id = '00000000-0000-0000-0000-000000000100'
where user_a = '00000000-0000-0000-0000-000000000001'
  and user_b = '00000000-0000-0000-0000-000000000002';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$
    insert into public.messages (match_id, sender_id, body)
    values (
      '00000000-0000-0000-0000-000000000100',
      '00000000-0000-0000-0000-000000000002',
      'hello'
    )
  $$,
  'active match member can send message'
);

select throws_ok(
  $$ select public.submit_report(
    '00000000-0000-0000-0000-000000000001',
    'harassment',
    'wrong reported sender',
    (
      select id
      from public.messages
      where match_id = '00000000-0000-0000-0000-000000000100'
        and body = 'hello'
    )
  ) $$,
  'P0001',
  'reported message is not accessible',
  'report message RPC rejects a message not sent by the reported profile'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$ select public.submit_report(
    '00000000-0000-0000-0000-000000000002',
    'harassment',
    'message report',
    (
      select id
      from public.messages
      where match_id = '00000000-0000-0000-0000-000000000100'
        and body = 'hello'
    )
  ) $$,
  'report message RPC accepts an accessible message from the reported profile'
);

select is(
  (
    select count(*)::int
    from public.reports
    where reporter_id = '00000000-0000-0000-0000-000000000001'
      and reported_user_id = '00000000-0000-0000-0000-000000000002'
      and reported_message_id = (
        select id
        from public.messages
        where match_id = '00000000-0000-0000-0000-000000000100'
          and body = 'hello'
      )
      and status = 'open'
  ),
  1,
  'report message RPC stores the reported message id'
);

select lives_ok(
  $$
    insert into public.match_read_states (
      match_id,
      profile_id,
      read_through_at
    )
    values (
      '00000000-0000-0000-0000-000000000100',
      '00000000-0000-0000-0000-000000000001',
      now()
    )
    on conflict (match_id, profile_id)
    do update set read_through_at = excluded.read_through_at
  $$,
  'active match member can upsert own read state'
);

select is(
  (
    select count(*)::int
    from public.match_read_states
    where match_id = '00000000-0000-0000-0000-000000000100'
      and profile_id = '00000000-0000-0000-0000-000000000001'
  ),
  1,
  'own read state is visible to the match member'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$
    insert into public.match_read_states (
      match_id,
      profile_id,
      read_through_at
    )
    values (
      '00000000-0000-0000-0000-000000000100',
      '00000000-0000-0000-0000-000000000003',
      now()
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "match_read_states"',
  'non-member cannot insert read state'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$ select public.unmatch_match('00000000-0000-0000-0000-000000000100') $$,
  'match member can unmatch an active match'
);

reset role;

select is(
  (
    select status
    from public.matches
    where id = '00000000-0000-0000-0000-000000000100'
  ),
  'unmatched',
  'unmatch RPC marks the match unmatched'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$
    insert into public.messages (match_id, sender_id, body)
    values (
      '00000000-0000-0000-0000-000000000100',
      '00000000-0000-0000-0000-000000000001',
      'unmatched message'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "messages"',
  'unmatched match cannot receive new messages'
);

select lives_ok(
  $$ select * from public.create_swipe(
    '00000000-0000-0000-0000-000000000002',
    'like'
  ) $$,
  'previously unmatched pair can match again after a fresh like'
);

reset role;

select is(
  (
    select count(*)::int
    from public.matches
    where user_a = '00000000-0000-0000-0000-000000000001'
      and user_b = '00000000-0000-0000-0000-000000000002'
  ),
  2,
  'rematch preserves prior inactive match history'
);

select is(
  (
    select count(*)::int
    from public.matches
    where user_a = '00000000-0000-0000-0000-000000000001'
      and user_b = '00000000-0000-0000-0000-000000000002'
      and status = 'active'
  ),
  1,
  'rematch creates one new active match row'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$ select * from public.create_swipe(
    '00000000-0000-0000-0000-000000000001',
    'like'
  ) $$,
  'P0001',
  'current profile is not eligible',
  'suspended actor cannot swipe'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$ select public.block_profile('00000000-0000-0000-0000-000000000002') $$,
  'block RPC succeeds'
);

select is(
  (
    select count(*)::int
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000002'
  ),
  0,
  'blocked profile is hidden from blocker discovery reads'
);

reset role;

select is(
  (
    select count(*)::int
    from public.matches
    where user_a = '00000000-0000-0000-0000-000000000001'
      and user_b = '00000000-0000-0000-0000-000000000002'
      and status = 'blocked'
  ),
  1,
  'blocking marks active match blocked'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select is(
  (
    select count(*)::int
    from public.profiles
    where id = '00000000-0000-0000-0000-000000000001'
  ),
  0,
  'blocked profile is hidden from blocked user discovery reads'
);

select is(
  (
    select count(*)::int
    from public.messages
    where match_id = '00000000-0000-0000-0000-000000000100'
  ),
  0,
  'blocked match messages are hidden from match members'
);

select is(
  (
    select count(*)::int
    from public.profile_photos
    where profile_id = '00000000-0000-0000-0000-000000000001'
  ),
  0,
  'blocked user cannot read the other profile valid photo metadata'
);

select is(
  (
    select count(*)::int
    from storage.objects
    where bucket_id = 'profile-photos'
      and name = '00000000-0000-0000-0000-000000000001/profile_photo/owner.jpg'
  ),
  0,
  'blocked user cannot read the other profile valid photo object'
);

select throws_ok(
  $$
    insert into public.profile_photos (
      profile_id,
      member_id,
      storage_path,
      sort_order
    )
    values (
      '00000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000001/profile_photo/owner.jpg',
      4
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "profile_photos"',
  'blocked user cannot forge metadata to regain access to another profile object'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$
    insert into public.messages (match_id, sender_id, body)
    values (
      '00000000-0000-0000-0000-000000000100',
      '00000000-0000-0000-0000-000000000001',
      'blocked message'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "messages"',
  'blocked match cannot receive new messages'
);

select lives_ok(
  $$ select public.request_account_deletion('testing deletion request') $$,
  'account deletion RPC succeeds'
);

select throws_ok(
  $$
    insert into public.account_deletion_requests (
      profile_id,
      reason,
      status
    )
    values (
      '00000000-0000-0000-0000-000000000001',
      'direct insert',
      'completed'
    )
  $$,
  '42501',
  'permission denied for table account_deletion_requests',
  'client cannot directly insert account deletion workflow state'
);

select is(
  (
    select count(*)::int
    from public.account_deletion_requests
    where profile_id = '00000000-0000-0000-0000-000000000001'
      and status = 'requested'
  ),
  1,
  'account deletion request is tied to authenticated profile'
);

select * from finish();

rollback;

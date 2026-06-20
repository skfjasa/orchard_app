begin;

create extension if not exists pgtap with schema extensions;

select plan(19);

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

insert into public.profile_photos (profile_id, storage_path, sort_order, moderation_status)
values
  (
    '00000000-0000-0000-0000-000000000002',
    'profiles/b/photo.jpg',
    0,
    'approved'
  );

set local role anon;
select throws_ok(
  $$ select count(*) from public.profiles $$,
  '42501',
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
  (
    select count(*)::int
    from public.profile_photos
    where profile_id = '00000000-0000-0000-0000-000000000002'
  ),
  1,
  'eligible profile photos are readable'
);

select throws_ok(
  $$
    update public.profiles
    set is_suspended = true
    where id = '00000000-0000-0000-0000-000000000001'
  $$,
  '42501',
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

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select throws_ok(
  $$ select * from public.create_swipe(
    '00000000-0000-0000-0000-000000000001',
    'like'
  ) $$,
  'P0001',
  'suspended actor cannot swipe'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$ select public.block_profile('00000000-0000-0000-0000-000000000002') $$,
  'block RPC succeeds'
);

reset role;

select is(
  (
    select status
    from public.matches
    where user_a = '00000000-0000-0000-0000-000000000001'
      and user_b = '00000000-0000-0000-0000-000000000002'
  ),
  'blocked',
  'blocking marks existing match blocked'
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
  'blocked match cannot receive new messages'
);

select lives_ok(
  $$ select public.request_account_deletion('testing deletion request') $$,
  'account deletion RPC succeeds'
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

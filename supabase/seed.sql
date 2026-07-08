-- Orchard dev fixture profiles.
-- These are backend counterparts to expo/mocks/profiles.ts for local/dev testing.
-- Do not run this seed against production.

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
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p1@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p2@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p3@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p4@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p5@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p6@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p7@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p8@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p9@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p10@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p11@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p12@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p13@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p14@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000015', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p15@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000016', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p16@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000017', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p17@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000018', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p18@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000019', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p19@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p20@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000021', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p21@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false),
  ('10000000-0000-4000-8000-000000000022', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'fixture+p22@orchard.dev', 'dev-fixture-disabled', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', false)
on conflict (id) do update set
  email = excluded.email,
  updated_at = now();

delete from public.profile_members
where profile_id in (
  select id from public.profiles where is_test_fixture = true
);

insert into public.profiles (
  id,
  display_name,
  birthdate,
  age_confirmed,
  city,
  latitude_approx,
  longitude_approx,
  gender,
  relationship_structure,
  partnered_status,
  dating_mode,
  looking_for,
  boundaries,
  bio,
  is_visible,
  is_test_fixture,
  onboarding_completed,
  last_active_at
)
values
  ('10000000-0000-4000-8000-000000000001', 'Noa & Sam', '1997-01-01', true, 'Brooklyn, NY', 40.6782, -73.9442, 'Woman', array['Kitchen-table poly'], 'couple', 'Together', array['Women','Non-binary','Couples'], '{}', 'Gallery openings, slow dinners, rooftop thunderstorms. We love meeting curious, kind people.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000002', 'Amara', '1999-01-01', true, 'Jersey City, NJ', 40.7178, -74.0431, 'Woman', array['Solo poly'], 'single', 'Solo', array['Everyone'], '{}', 'Sommelier by day, poet by night. ENM for 4 years. Looking for conversation that lingers.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000003', 'Julien', '1992-01-01', true, 'Manhattan, NY', 40.7831, -73.9712, 'Man', array['Hierarchical poly'], 'single', 'Solo', array['Women','Couples'], '{}', 'Architect. Polyamorous. Loves long dinners and longer conversations.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000004', 'Iris & Devon', '1993-01-01', true, 'Queens, NY', 40.7282, -73.7949, 'Woman', array['Open relationship'], 'couple', 'Together', array['Women','Men','Couples'], '{}', 'Married 6 years, open 3. We cook, we hike, we host. Honesty is our love language.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000005', 'Rin', '2000-01-01', true, 'Hoboken, NJ', 40.744, -74.0324, 'Non-binary', array['Questioning'], 'single', 'Solo', array['Everyone'], '{}', 'Ceramicist. Soft launch energy. Curious and kind.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000006', 'Mira & Theo', '1996-01-01', true, 'Newark, NJ', 40.7357, -74.1724, 'Woman', array['Triad'], 'couple', 'Together', array['Women','Couples'], '{}', 'Chef + photographer duo. We live for farmers markets and late-night film photos.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000007', 'Kai', '1998-01-01', true, 'Williamsburg, NY', 40.7081, -73.9571, 'Genderfluid', array['Relationship anarchy'], 'single', 'Solo', array['Everyone'], '{}', 'Surfer, filmmaker, relationship anarchist.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000008', 'Zadie', '1997-01-01', true, 'Brooklyn, NY', 40.6782, -73.9442, 'Woman', array['Relationship anarchy'], 'single', 'Solo', array['Everyone'], '{}', 'Editor at a lit mag. ENM forever. I believe in long walks and longer letters.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000009', 'Ines & Miles', '1995-01-01', true, 'Harlem, NY', 40.8116, -73.9465, 'Woman', array['Throuple'], 'couple', 'Together', array['Women','Non-binary','Couples'], '{}', 'Married 4 years, searching for a third who loves late dinners and Sunday records.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000010', 'Asher', '1996-01-01', true, 'Park Slope, NY', 40.6721, -73.9857, 'Trans man', array['Non-hierarchical poly'], 'single', 'Solo', array['Women','Non-binary','Couples'], '{}', 'Baker, runner, incurable romantic. 5 years ENM. Looking for a slow burn.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000011', 'Priya', '1998-01-01', true, 'Jersey City, NJ', 40.7178, -74.0431, 'Woman', array['Kitchen-table poly'], 'single', 'Solo', array['Men','Women','Couples'], '{}', 'UX designer. Cooking obsessive. I love meeting my metamours over long dinners.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000012', 'Sage & River', '1999-01-01', true, 'Bushwick, NY', 40.6958, -73.9171, 'Non-binary', array['Polycule'], 'couple', 'Together', array['Everyone'], '{}', 'Queer, kinky, kind. We host monthly dinners and host even better conversations.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000013', 'Malik', '1994-01-01', true, 'Crown Heights, NY', 40.6702, -73.9436, 'Man', array['Hierarchical poly'], 'single', 'Solo', array['Women','Non-binary'], '{}', 'Composer. Partnered for 6 years, open for 3. I love a good b-side and a better debate.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000014', 'Nadia', '1991-01-01', true, 'Long Island City, NY', 40.7447, -73.9485, 'Woman', array['Solo poly'], 'single', 'Solo', array['Everyone'], '{}', 'Theater director. Solo poly for a decade. I like directness and unhurried kisses.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000015', 'Eloise', '2000-01-01', true, 'West Village, NY', 40.7358, -74.0036, 'Woman', array['Kitchen-table poly'], 'single', 'Solo', array['Women','Couples'], '{}', 'Florist with a wine habit. New to ENM but not to love. Lets be real and a little reckless.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000016', 'Tomo & Lena', '1992-01-01', true, 'Greenpoint, NY', 40.7306, -73.9542, 'Man', array['Quad'], 'couple', 'Together', array['Women','Non-binary','Couples'], '{}', 'Together 7 years, open 2. We host sauna Sundays and ramen Mondays.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000017', 'Soren', '1993-01-01', true, 'Red Hook, NY', 40.6743, -74.0112, 'Man', array['Non-hierarchical poly'], 'single', 'Solo', array['Women','Couples'], '{}', 'Furniture maker. Quiet guy with a loud heart. Looking for a slow build.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000018', 'Yara', '1997-01-01', true, 'Bed-Stuy, NY', 40.6872, -73.9418, 'Woman', array['Relationship anarchy'], 'single', 'Solo', array['Everyone'], '{}', 'Music journalist. ENM 6 years. I fall fast but listen slowly.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000019', 'Emiliana & Jun', '1996-01-01', true, 'Lower East Side, NY', 40.715, -73.9843, 'Woman', array['Vee'], 'couple', 'Together', array['Women','Non-binary'], '{}', 'Queer creative duo. Mezcal, mixtapes, and a weakness for karaoke nights.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000020', 'Wren', '1999-01-01', true, 'Fort Greene, NY', 40.6892, -73.9741, 'Non-binary', array['Solo poly'], 'single', 'Solo', array['Everyone'], '{}', 'Librarian, birder, soft spoken. Looking for gentle chaos.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000021', 'Margot & Felix', '1990-01-01', true, 'Tribeca, NY', 40.7163, -74.0086, 'Woman', array['Swinger'], 'couple', 'Together', array['Women','Couples'], '{}', 'Married 10 years, playful 4. Weekend house in the Catskills. Come for the wine, stay for the conversation.', true, true, true, now()),
  ('10000000-0000-4000-8000-000000000022', 'Dax', '1995-01-01', true, 'Astoria, NY', 40.7643, -73.9235, 'Man', array['Monogamish'], 'single', 'Solo', array['Women','Non-binary','Couples'], '{}', 'Podcast producer. Mostly committed, occasionally curious. Always honest.', true, true, true, now())
on conflict (id) do update set
  display_name = excluded.display_name,
  birthdate = excluded.birthdate,
  age_confirmed = excluded.age_confirmed,
  city = excluded.city,
  latitude_approx = excluded.latitude_approx,
  longitude_approx = excluded.longitude_approx,
  gender = excluded.gender,
  relationship_structure = excluded.relationship_structure,
  partnered_status = excluded.partnered_status,
  dating_mode = excluded.dating_mode,
  looking_for = excluded.looking_for,
  boundaries = excluded.boundaries,
  bio = excluded.bio,
  is_visible = excluded.is_visible,
  is_test_fixture = excluded.is_test_fixture,
  onboarding_completed = excluded.onboarding_completed,
  last_active_at = excluded.last_active_at;

insert into public.profile_members (
  profile_id,
  display_name,
  birthdate,
  gender,
  sort_order
)
values
  ('10000000-0000-4000-8000-000000000001', 'Noa', '1997-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000001', 'Sam', '1995-01-01', 'Non-binary', 1),
  ('10000000-0000-4000-8000-000000000002', 'Amara', '1999-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000003', 'Julien', '1992-01-01', 'Man', 0),
  ('10000000-0000-4000-8000-000000000004', 'Iris', '1993-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000004', 'Devon', '1991-01-01', 'Man', 1),
  ('10000000-0000-4000-8000-000000000005', 'Rin', '2000-01-01', 'Non-binary', 0),
  ('10000000-0000-4000-8000-000000000006', 'Mira', '1996-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000006', 'Theo', '1994-01-01', 'Man', 1),
  ('10000000-0000-4000-8000-000000000007', 'Kai', '1998-01-01', 'Genderfluid', 0),
  ('10000000-0000-4000-8000-000000000008', 'Zadie', '1997-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000009', 'Ines', '1995-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000009', 'Miles', '1993-01-01', 'Man', 1),
  ('10000000-0000-4000-8000-000000000010', 'Asher', '1996-01-01', 'Trans man', 0),
  ('10000000-0000-4000-8000-000000000011', 'Priya', '1998-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000012', 'Sage', '1999-01-01', 'Non-binary', 0),
  ('10000000-0000-4000-8000-000000000012', 'River', '1997-01-01', 'Genderqueer', 1),
  ('10000000-0000-4000-8000-000000000013', 'Malik', '1994-01-01', 'Man', 0),
  ('10000000-0000-4000-8000-000000000014', 'Nadia', '1991-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000015', 'Eloise', '2000-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000016', 'Tomo', '1992-01-01', 'Man', 0),
  ('10000000-0000-4000-8000-000000000016', 'Lena', '1995-01-01', 'Woman', 1),
  ('10000000-0000-4000-8000-000000000017', 'Soren', '1993-01-01', 'Man', 0),
  ('10000000-0000-4000-8000-000000000018', 'Yara', '1997-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000019', 'Emiliana', '1996-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000019', 'Jun', '1994-01-01', 'Non-binary', 1),
  ('10000000-0000-4000-8000-000000000020', 'Wren', '1999-01-01', 'Non-binary', 0),
  ('10000000-0000-4000-8000-000000000021', 'Margot', '1990-01-01', 'Woman', 0),
  ('10000000-0000-4000-8000-000000000021', 'Felix', '1988-01-01', 'Man', 1),
  ('10000000-0000-4000-8000-000000000022', 'Dax', '1995-01-01', 'Man', 0);

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
  p.looking_for,
  p.relationship_structure
from public.profiles p
where p.is_test_fixture = true
on conflict (profile_id) do update set
  show_me = excluded.show_me,
  relationship_structures = excluded.relationship_structures,
  updated_at = now();

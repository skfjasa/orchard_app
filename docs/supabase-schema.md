# Supabase Schema Draft

This is the MVP schema track for Orchard. The listed migrations have been applied to the hosted `orchard-dev` Supabase project and should still be reviewed before staging or production use.

Migration files:

- `supabase/migrations/202606190001_initial_mvp_schema.sql`
- `supabase/migrations/202606200002_profile_photo_storage.sql`
- `supabase/migrations/202606210001_fixture_profiles_and_settings.sql`
- `supabase/migrations/202607030001_rematch_active_match_history.sql`
- `supabase/migrations/202607040001_profile_photo_visible_storage_reads.sql`
- `supabase/migrations/202607040002_active_match_profile_reads.sql`
- `supabase/migrations/202607040003_enable_match_message_realtime.sql`
- `supabase/migrations/202607040004_match_read_states.sql`
- `supabase/migrations/202607110001_profile_photo_storage_path_ownership.sql` (local only; hosted preflight and apply pending)

## Scope

The draft covers:

- Profiles
- Profile members
- Profile photos
- Swipes
- Matches
- Messages
- Blocks
- Reports
- User settings
- Account deletion requests

Storage migration `202606200002_profile_photo_storage.sql` adds:

- Private `profile-photos` Supabase Storage bucket.
- Owner-scoped storage object select/insert/update/delete policies keyed by the first path segment.
- `profile_photos(profile_id, member_id, sort_order)` unique constraint for metadata upserts.

Fixture/settings migration `202606210001_fixture_profiles_and_settings.sql` adds:

- `profiles.is_test_fixture`.
- Automatic default `user_settings` creation/backfill.
- Dev-only fixture auto-match behavior for real users liking seeded fixture profiles.

Rematch migration `202607030001_rematch_active_match_history.sql` adds:

- Historical inactive match rows for unmatched pairs.
- A partial unique index that allows only one active match per user pair.
- Rematch behavior that creates a fresh active match row after a prior unmatch.

Profile photo visible-read migration `202607040001_profile_photo_visible_storage_reads.sql` adds:

- Storage read/signing support for visible profile photo objects when the viewer is eligible.

Active-match profile read migration `202607040002_active_match_profile_reads.sql` adds:

- Active matched users can read each other's profile/member/photo rows.
- Active matched users can sign matched profile photo storage objects after discovery/swipe state changes.

Realtime migration `202607040003_enable_match_message_realtime.sql` adds:

- `public.matches` and `public.messages` to the Supabase Realtime publication.

Read-state migration `202607040004_match_read_states.sql` adds:

- `public.match_read_states`.
- Per-user per-match read-through persistence with active-match RLS.

Profile-photo path-ownership migration `202607110001_profile_photo_storage_path_ownership.sql` adds:

- Immutable `private.is_owned_profile_photo_path(profile_id, storage_path)` validation for the current `<profile_id>/<purpose>/<filename>` layout.
- A fail-fast existing-row preflight and `profile_photos_storage_path_owned` table constraint, including for RLS-bypassing server/service operations.
- INSERT and UPDATE policies that require both authenticated profile ownership and an owner-prefixed valid storage path.
- No storage-path uniqueness constraint. Same-owner duplicate paths are a separate photo-lifecycle consistency concern and are not required to close cross-owner authorization.

Run this read-only query against hosted data before applying the migration. Any returned row requires explicit human review; do not rewrite or delete it automatically:

```sql
select id, profile_id, storage_path
from public.profile_photos
where storage_path is null
   or storage_path <> btrim(storage_path)
   or length(storage_path) = 0
   or cardinality(string_to_array(storage_path, '/')) <> 3
   or split_part(storage_path, '/', 1) <> profile_id::text
   or split_part(storage_path, '/', 2) !~ '^[a-z][a-z0-9_]*$'
   or split_part(storage_path, '/', 3) !~ '^[A-Za-z0-9][A-Za-z0-9._-]*$'
   or split_part(storage_path, '/', 3) in ('.', '..')
order by profile_id, id;
```

Duplicate paths are informational for this slice and do not block the ownership constraint:

```sql
select storage_path, count(*) as metadata_row_count
from public.profile_photos
group by storage_path
having count(*) > 1
order by storage_path;
```

## Key Product Rules Represented

- Users own one account-level profile row keyed by `auth.users.id`.
- Each profile stores one or two user-facing people in `profile_members`, matching the app's single/couple profile model.
- Profile photos are tied to both the owning profile and a specific profile member.
- Discovery should only expose visible, non-suspended, unblocked profiles.
- Swipes are unique per swiper/target pair.
- Matches allow inactive history per user pair, enforce at most one active match per user pair, and only chat when `status = 'active'`.
- Messages require an active match membership.
- Blocks are bidirectional for discovery, match, and chat exclusion.
- Reports are create-only from authenticated users in the mobile app.
- Account deletion requests are user-created and user-readable.

## Draft RPCs

- `create_swipe(target_profile_id, swipe_decision)` persists like/pass decisions, creates an active match when a reciprocal like exists, auto-matches eligible dev fixture likes, and creates a fresh active row when a previously unmatched pair rematches.
- `unmatch_match(target_match_id)` lets a match member mark an active match as unmatched.
- `block_profile(blocked_profile_id)` creates a block and marks any active match between the two users as blocked.
- `submit_report(reported_profile_id, report_reason, report_details, reported_message_id)` derives reporter identity from `auth.uid()` and creates a moderation report.
- `request_account_deletion(deletion_reason)` derives profile identity from `auth.uid()` and creates an account deletion request.

These functions are granted to authenticated users only. Database/RLS tests exist at `supabase/tests/database/202606200001_mvp_security.sql` and pass against the local Supabase database: 1 file, 67 tests.

## Known Gaps Before Staging Or Production

- Admin/moderation read policies are not included; use the interim Supabase Studio workflow in `docs/supabase-moderation-workflow.md` initially.
- Exact relationship-structure enum values are not locked yet.
- Birthdate/age handling needs product/legal review.
- Approximate location approach needs product/privacy review.
- Message body moderation strategy is not defined.
- Hosted UAT still needs broader safety and block/unmatch/report verification with real accounts.
- Hosted profile-photo path preflight and ownership UAT remain pending; do not apply `202607110001` until the preflight returns no unexplained rows.

## RLS Review Required

Before applying to staging or production:

- Keep the local Supabase database/RLS tests passing before applying migration changes.
- Run a Supabase RLS/security review.
- Test select/insert/update policies with at least two users.
- Verify blocked users cannot discover, match, or message each other.
- Verify non-match users cannot read or send messages.
- Verify service-role keys are never used in the mobile app.

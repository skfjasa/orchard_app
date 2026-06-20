# Supabase Schema Draft

This is the first MVP schema draft for Orchard. It is not yet applied to a live Supabase project.

Migration files:

- `supabase/migrations/202606190001_initial_mvp_schema.sql`
- `supabase/migrations/202606200002_profile_photo_storage.sql`

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

## Key Product Rules Represented

- Users own one account-level profile row keyed by `auth.users.id`.
- Each profile stores one or two user-facing people in `profile_members`, matching the app's single/couple profile model.
- Profile photos are tied to both the owning profile and a specific profile member.
- Discovery should only expose visible, non-suspended, unblocked profiles.
- Swipes are unique per swiper/target pair.
- Matches are unique per user pair and only chat when `status = 'active'`.
- Messages require an active match membership.
- Blocks are bidirectional for discovery, match, and chat exclusion.
- Reports are create-only from authenticated users in the mobile app.
- Account deletion requests are user-created and user-readable.

## Draft RPCs

- `create_swipe(target_profile_id, swipe_decision)` persists like/pass decisions and creates an active match only when a reciprocal like exists.
- `unmatch_match(target_match_id)` lets a match member mark an active match as unmatched.
- `block_profile(blocked_profile_id)` creates a block and marks any existing match between the two users as blocked.
- `submit_report(reported_profile_id, report_reason, report_details, reported_message_id)` derives reporter identity from `auth.uid()` and creates a moderation report.
- `request_account_deletion(deletion_reason)` derives profile identity from `auth.uid()` and creates an account deletion request.

These functions are granted to authenticated users only. Initial database/RLS tests exist at `supabase/tests/database/202606200001_mvp_security.sql` and pass against the local Supabase database: 1 file, 25 tests.

## Known Gaps Before Applying

- Storage bucket policies for profile photos are drafted, pass local tests, and have been pushed to hosted `orchard-dev`; app smoke testing with a selected photo is still pending.
- Admin/moderation read policies are not included; use Supabase Studio/service role initially.
- Exact relationship-structure enum values are not locked yet.
- Birthdate/age handling needs product/legal review.
- Approximate location approach needs product/privacy review.
- Message body moderation strategy is not defined.

## RLS Review Required

Before applying to staging or production:

- Keep the local Supabase database/RLS tests passing before applying migration changes.
- Run a Supabase RLS/security review.
- Test select/insert/update policies with at least two users.
- Verify blocked users cannot discover, match, or message each other.
- Verify non-match users cannot read or send messages.
- Verify service-role keys are never used in the mobile app.

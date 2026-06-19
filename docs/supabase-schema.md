# Supabase Schema Draft

This is the first MVP schema draft for Orchard. It is not yet applied to a live Supabase project.

Migration file:

- `supabase/migrations/202606190001_initial_mvp_schema.sql`

## Scope

The draft covers:

- Profiles
- Profile photos
- Swipes
- Matches
- Messages
- Blocks
- Reports
- User settings
- Account deletion requests

## Key Product Rules Represented

- Users own one profile row keyed by `auth.users.id`.
- Discovery should only expose visible, non-suspended, unblocked profiles.
- Swipes are unique per swiper/target pair.
- Matches are unique per user pair and only chat when `status = 'active'`.
- Messages require an active match membership.
- Blocks are bidirectional for discovery, match, and chat exclusion.
- Reports are create-only from authenticated users in the mobile app.
- Account deletion requests are user-created and user-readable.

## Known Gaps Before Applying

- Mutual match creation should be implemented through a database function or trusted service path.
- Unmatch/block match status updates should be implemented through reviewed RPCs or trusted service logic, not direct client table updates.
- Storage bucket policies for `profile_photos` are not drafted yet.
- Admin/moderation read policies are not included; use Supabase Studio/service role initially.
- Exact relationship-structure enum values are not locked yet.
- Birthdate/age handling needs product/legal review.
- Approximate location approach needs product/privacy review.
- Message body moderation strategy is not defined.

## RLS Review Required

Before applying to staging or production:

- Run a Supabase RLS/security review.
- Test select/insert/update policies with at least two users.
- Verify blocked users cannot discover, match, or message each other.
- Verify non-match users cannot read or send messages.
- Verify service-role keys are never used in the mobile app.

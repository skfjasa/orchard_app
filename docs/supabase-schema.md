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

## Draft RPCs

- `create_swipe(target_profile_id, swipe_decision)` persists like/pass decisions and creates an active match only when a reciprocal like exists.
- `unmatch_match(target_match_id)` lets a match member mark an active match as unmatched.
- `block_profile(blocked_profile_id)` creates a block and marks any existing match between the two users as blocked.

These functions are granted to authenticated users only. They still need to be tested in a Supabase dev project before app runtime code depends on them.

## Known Gaps Before Applying

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

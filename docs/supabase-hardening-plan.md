# Supabase Hardening Plan

Last updated: 2026-07-06

Reference note: this file records Supabase security/RLS hardening principles and current hardening status. Current milestone/task tracking lives in `docs/milestone-tracker.md`.

## Goal

Keep the Supabase MVP schema, RLS policies, grants, and RPCs hardened as Orchard moves from hosted development testing toward closed beta.

The database should enforce Orchard's core safety rules server-side:

- No unauthenticated profile or photo reads.
- No client-write access to moderation or admin fields.
- No direct client writes to matches.
- Business actions with cross-row rules go through RPCs.
- Users can edit only genuinely user-owned profile data.
- Suspended users cannot discover, swipe, match, message, or appear in discovery.
- Blocks suppress discovery, matching, and messaging in both directions.

## Implementation Phases

### 1. Lock The Security Model

- Use deny-by-default table and function privileges.
- Scope RLS policies to `authenticated` unless a table is intentionally public.
- Require explicit authenticated checks in policies.
- Keep service-role credentials out of the mobile app.
- Preserve mock mode when Supabase env vars are absent.

### 2. Reshape Trusted Data

Preferred long-term shape:

- `profiles`: user-editable display and preference fields.
- `profile_members`: one or two people represented by a profile, including per-person display name, birthdate, gender, orientation, and bio.
- `profile_moderation`: trusted profile state such as `age_verified`, `is_suspended`, suspension reason, and review state.
- `profile_photos`: user-owned photo metadata tied to a specific `profile_members` row.
- `profile_photo_moderation`: trusted photo moderation state.

For the MVP migration, it is acceptable to keep trusted columns in the existing tables if RLS and RPCs prevent clients from setting unsafe values.

### 3. Tighten Grants

- Revoke broad table privileges from `public`, `anon`, and `authenticated`.
- Grant `authenticated` only required table operations.
- Grant no profile or photo read access to `anon`.
- Revoke default function execution and re-grant only intended RPCs to `authenticated`.

### 4. Rewrite RLS Policies

Every mobile-client policy should:

- Use `to authenticated`.
- Include an explicit authenticated user check where ownership is involved.
- Match the product rule it is enforcing.
- Avoid exposing suspended, invisible, blocked, incomplete, or unverified profiles in discovery.

Required policy behavior:

- Users can read and update their own profile.
- Users can read eligible profile members and update only members on their own profile.
- Users can read eligible discovery profiles only.
- Users can read eligible profile photos only.
- Users can read active matches they belong to unless blocked.
- Users can read and send messages only in active unblocked matches.
- Users can insert blocks only as themselves.
- Report and account deletion writes should be handled by RPCs or tightly constrained inserts.

### 5. Move Business Writes Behind RPCs

RPCs should derive actor identity from `auth.uid()` rather than trusting client-supplied actor ids.

Required RPC behavior:

- `create_swipe(target_profile_id, swipe_decision)`
  - Validate actor profile exists.
  - Reject suspended, incomplete, or underage/unverified actors.
  - Validate target is eligible.
  - Reject blocked relationships.
  - Upsert the swipe.
  - Create exactly one active reciprocal match on mutual likes.

- `unmatch_match(target_match_id)`
  - Only active match members can unmatch.
  - Mark the match inactive and record actor/time.

- `block_profile(blocked_profile_id)`
  - Insert the block idempotently.
  - Mark any existing match blocked.
  - Prevent future discovery, matching, and messaging.

- `submit_report(...)`
  - Derive `reporter_id` from `auth.uid()`.
  - Default workflow status to `open`.
  - Validate reported messages are accessible to the reporter.

- `request_account_deletion(reason)`
  - Derive `profile_id` from `auth.uid()`.
  - Store optional reason.
  - Default workflow status to `requested`.

### 6. Fix Current Schema/App Mismatches

- Add `reason text` to `account_deletion_requests`, or remove `reason` from the app adapter.
- Preferred MVP fix: add `reason text` because the app service interface already models it.
- Add `profile_members` and require `profile_photos.member_id` so Supabase can represent the app's `Profile.people[]` model for singles and couples.

### 7. Add Database Tests Before Shared Dev Apply

Add SQL/RLS tests covering:

- Anonymous users cannot read profiles or photos.
- Authenticated users can read their own profile.
- Authenticated users can read only eligible visible profiles.
- Invisible, suspended, blocked, incomplete, and unverified profiles are hidden.
- Users cannot self-set trusted moderation/admin fields.
- Suspended actors cannot swipe.
- Reciprocal likes create one active match.
- Duplicate swipes are idempotent.
- Blocked users cannot match or message.
- Report and account deletion RPCs derive actor identity from the session.

### 8. Dev Apply Sequence

1. Harden and review the migration locally.
2. Add database tests.
3. Apply to a dev Supabase project only.
4. Seed several test users and profiles.
5. Validate with anon and authenticated sessions.
6. Wire app services in order: auth/profile, discovery, swipes/matches, chat, safety.

## Current Status

- Hosted Supabase dev project `orchard-dev` exists and is aligned through migration `202607040004`.
- `supabase/migrations/202606190001_initial_mvp_schema.sql` contains the hardened core schema/RLS/RPC foundation.
- `202606200002_profile_photo_storage.sql` adds the private `profile-photos` bucket and member-scoped photo metadata constraints.
- `202606210001_fixture_profiles_and_settings.sql` adds dev fixture support and default `user_settings`.
- `202607030001_rematch_active_match_history.sql` preserves inactive match history and enforces one active match per pair.
- `202607040001_profile_photo_visible_storage_reads.sql` lets eligible viewers sign visible profile photo storage objects.
- `202607040002_active_match_profile_reads.sql` lets active matched users read each other's profile/member/photo rows and sign matched photos.
- `202607040003_enable_match_message_realtime.sql` publishes `public.matches` and `public.messages` for Realtime.
- `202607040004_match_read_states.sql` adds backend-backed match read states.
- Database/RLS tests exist at `supabase/tests/database/202606200001_mvp_security.sql`.
- Local `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db` have passed for the latest schema set: 1 file / 45 tests.

## Current Hardening Gaps

- Hosted UAT still needs to cover report profile, report message, block, unmatch, and account deletion request with real accounts.
- Hosted UAT still needs to confirm blocked users disappear from discovery, matches, and chat.
- Hosted UAT still needs to confirm suspended/invisible users do not appear in discovery.
- Supabase Studio moderation workflow is documented in `docs/supabase-moderation-workflow.md`; a production admin/moderation process is still needed before `orchard-prod`.
- Production project `orchard-prod` should not be created or used until closed-beta hardening decisions are accepted.

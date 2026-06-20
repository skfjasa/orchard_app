# Supabase Hardening Plan

Last updated: 2026-06-20

## Goal

Harden the initial Supabase MVP migration before applying it to a shared development project or wiring more app behavior to it.

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
- `profile_moderation`: trusted profile state such as `age_verified`, `is_suspended`, suspension reason, and review state.
- `profile_photos`: user-owned photo metadata.
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

### 6. Fix Current Schema/App Mismatch

- Add `reason text` to `account_deletion_requests`, or remove `reason` from the app adapter.
- Preferred MVP fix: add `reason text` because the app service interface already models it.

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

- `supabase/migrations/202606190001_initial_mvp_schema.sql` has been hardened before any shared dev apply.
- Initial database/RLS tests exist at `supabase/tests/database/202606200001_mvp_security.sql`.
- Docker Desktop is operational after enabling firmware virtualization.
- `expo\node_modules\.bin\supabase start` runs the local database, and `expo\node_modules\.bin\supabase test db` passes locally.
- Next step: review the passing hardened migration before applying it to a shared development Supabase project.

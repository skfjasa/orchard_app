# Orchard App Tactical Handoff

Last updated: 2026-07-03

## Current Goal

Continue converting the Orchard Expo prototype into an iOS-first Supabase-backed MVP while preserving mock mode and the existing UI.

## Current State

- Repo: `C:\Users\skfja\Projects\orchard_app`
- Branch: `main`
- Remote: `origin/main`
- Current git state at handoff: dirty with post-decoupling implementation/docs changes, local preview logs, and a deleted `rork.json`; do not revert unrelated user work.
- Latest docs/status checkpoint: `5723aed` - Refresh handoff after fixture checkpoint
- Latest implementation checkpoint: `aa5dae7` - Stabilize onboarding and fixture match flow
- App: Expo React Native / Expo Router / TypeScript under `expo/`
- Backend: hosted Supabase dev project `orchard-dev`, project ref `cvvavwuksygahezzhmqp`
- Runtime is still mixed: local/mock UI state remains primary for discovery, matches, and chat; Supabase auth, profile/member persistence, safety RPCs, gated swipe persistence, and profile photo storage exist.

## Completed This Session

- Stabilized the logged-in prototype fixture/match flow:
  - Discover now gets candidate profiles through `DiscoveryService`.
  - Local likes/super-likes show an in-app match confirmation.
  - Matches and Inbox tabs show badge counts for new/unread local match conversations.
  - Inbox row rendering tolerates missing/older saved conversation message data.
- Added dev fixture profile support:
  - Hosted `orchard-dev` has 22 fixture profiles, 30 fixture members, and fixture settings.
  - Real users who like seeded fixture profiles through `create_swipe` auto-match for dev testing.
  - Fixture profiles are marked with `profiles.is_test_fixture = true`.
- Added/defaulted `user_settings` creation and backfill at the database layer and during Supabase profile completion.
- Refreshed repo handoff/status docs after the fixture checkpoint.
- Removed active Rork toolchain coupling: Expo CLI scripts replaced Rork scripts, Metro now uses the default Expo config, app identifiers are Orchard-specific, `rork.json` was removed, and onboarding backgrounds now use bundled Orchard assets.
- Fixed post-decoupling chat crashes on web:
  - chat now renders an in-screen header/back/safety menu instead of route-level native stack options
  - read marking no longer writes conversations when unread count is already zero
  - conversation messages are normalized before rendering to tolerate older local rows
- Fixed Supabase safety adapter fixture handling:
  - Report profile and Block profile now map seeded mock fixture ids to backend UUIDs before calling RPCs
  - Report profile and Block profile have both passed browser smoke testing
- Fixed rematch timestamp/state semantics:
  - migration `202607030001_rematch_active_match_history.sql` preserves inactive match history and allows one active match per user pair
  - previously unmatched pairs now get a fresh active match row with a fresh `created_at` when they rematch
  - hosted `orchard-dev` is aligned through `202607030001`
- Started backend chat persistence behind the service boundary:
  - Supabase mode now uses `createSupabaseChatService`
  - outbound text messages persist non-blockingly to hosted `messages` when an active backend match exists
  - visible chat state, simulated replies, read receipts, deletes, and photo messages remain local/mock for now
  - hosted browser UAT did not produce a `messages` row or fresh `matches` timestamp, so next session should debug backend-backed active match resolution

## Verification

- Local `bun run typecheck` from `expo/`: passed after fixture/profile/match UX changes.
- Local `bun run lint` from `expo/`: passed after fixture/profile/match UX changes.
- Local `expo\node_modules\.bin\supabase db reset`: passed after `202606210001` and `supabase/seed.sql`.
- Local `expo\node_modules\.bin\supabase test db`: passed with 41 tests after the rematch migration.
- Hosted `orchard-dev` verification after seed/backfill: 23 total profiles, 22 fixture profiles, 23 settings rows.
- GitHub Actions `Expo Checks`: passed after `0bc2ffd`, `e4695be`, and `1f0f211`.
- GitHub manual `Supabase DB Tests`: passed, including local Supabase start/reset and `supabase test db`.
- Session close check: Orchard web preview process group was stopped.
- Post-decoupling verification on 2026-07-03: `bun run typecheck` passed, `bun run lint` passed, `git diff --check` passed, and `bun run start-web` served the app through Expo CLI at `http://localhost:8081`. The legacy-generator reference scan returned no matches. Browser UAT confirmed the app loads, sign-in works, Discover loads, fixture likes work through the visible UI, the match confirmation modal appears, Matches/Inbox badges update, Inbox opens cleanly, a conversation opens, in-screen chat back returns to Inbox, the three-dot safety menu opens, local text send works, local photo attach/send works, Cancel closes the safety menu, Report profile submits without crashing, Block profile returns to Inbox/removes the conversation, and Unmatch removes the conversation. Hosted SQL verification confirmed a fresh `swipes` row from the fixture-like test; `matches` rows exist for fixture matches, but no fresh match timestamp appeared for the retested pair, likely because an existing pair row suppresses rematch timestamps. Text/photo chat sends are still local-only and should not be expected in hosted `messages` yet.

## Active Blockers / Open Loops

- Hosted Supabase email sends are rate-limited to 2/hour; final confirmation-link smoke test is blocked until the limit clears or custom SMTP is configured.
- Need to smoke-test full hosted browser signup/onboarding/photo flow in one browser profile:
  - start from clean local test state
  - complete onboarding with a selected photo
  - receive confirmation email
  - confirm link returns to the app
  - auth callback restores session
  - pending profile/member/photo persistence completes
  - app enters signed-in state
  - Supabase has `profiles`, `profile_members`, `profile_photos`, and Storage object rows
- Decide whether to ingest fixture images into Supabase Storage for backend-backed discovery.
- Discovery and chat are not yet backend source of truth.
- Supabase Auth email branding/custom templates require custom SMTP before external testers.
- Apple Developer Program account still needs to be created.
- Real public legal/support URLs remain placeholders.
- Decide whether Supabase DB tests should run automatically on `supabase/**` pull-request changes.
- GitHub Actions checkout warning resolved locally by updating workflows to `actions/checkout@v6`; push is pending on network connectivity.

## Next Recommended Action

Debug hosted backend-backed active match resolution for chat persistence; current UAT did not produce a hosted `messages` row or fresh hosted `matches` timestamp.

After the Supabase email limit clears, retest the hosted confirmation flow with a selected local photo using the same browser profile for signup and email link. Use the sign-in screen's development `Reset local test data` control first if the normal browser profile has stale state.

## Read First Next Session

1. `C:\Users\skfja\Projects\AGENTS.md`
2. `AGENTS.md`
3. `.agents\handoff.md`
4. `docs\project-status.md`
5. `docs\backend-migration-plan.md`
6. `docs\session-handoff.md`

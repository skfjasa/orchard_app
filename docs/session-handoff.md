# Session Handoff

Last updated: 2026-07-03

## Current Context

The repo is `skfjasa/orchard_app`. App code lives in `expo/`.

This is an Expo React Native app using Expo Router, TypeScript, React Native 0.81.5, Expo 54, React 19, and Bun. The MVP target is an iOS-first TestFlight-ready dating app for polyamorous / ENM users. Android is later.

The product wedge is structured relationship-context matching, not a generic swipe clone. Relationship structure, partnered status, dating mode, boundaries, looking-for intent, and expectations should be clear before chat.

## Important Product Decisions

- App name: Orchard.
- iOS bundle ID: `com.orchardapp.ios`.
- Apple Developer account: needs to be created.
- Supabase dev project: `orchard-dev`.
- Supabase production project later: `orchard-prod`.
- Supabase region: East US (North Virginia) / `us-east-1`.
- Placeholder Privacy Policy URL: `https://yourdomain.com/privacy`.
- Placeholder Terms URL: `https://yourdomain.com/terms`.
- Placeholder Community Standards URL: `https://yourdomain.com/community`.
- Placeholder support email: `support@yourdomain.com`.
- Placeholder Support URL: `https://yourdomain.com/support`.
- Placeholder Account Deletion URL: `https://yourdomain.com/delete`.
- MVP account deletion process: user requests deletion in app, request is stored, admin reviews/completes deletion in Supabase, and deletion/anonymization follows the policy.
- User monetization is out of MVP scope.
- Preserve the existing prototype UI unless explicitly asked to redesign.
- Preserve mock/demo mode while backend features are introduced.

## Current Technical State

- Runtime behavior is still mostly local/mock.
- Persistence is still primarily `AsyncStorage`.
- `ProfileProvider` remains the main runtime state provider. Do not rewrite it in one pass.
- Service interfaces, mock adapters, Supabase swipe/match/safety adapters, backend/mock service factory, Supabase profile service, and Supabase storage service exist.
- Supabase email/password auth is wired when Supabase env vars are present.
- Hosted Supabase dev project `orchard-dev` exists at project ref `cvvavwuksygahezzhmqp`.
- Hardened schema/RLS/RPC migrations exist:
  - `supabase/migrations/202606190001_initial_mvp_schema.sql`
  - `supabase/migrations/202606200002_profile_photo_storage.sql`
- Hosted migrations through `202606210001` have been pushed and verified.
- `profile_members` supports single/couple `Profile.people[]`.
- Private `profile-photos` Supabase Storage bucket and owner-scoped policies exist.
- Supabase Storage-backed selected local onboarding photo upload exists.
- Dev fixture profiles are seeded in hosted `orchard-dev`: 22 fixture profiles, 30 fixture members, and 22 fixture settings. They are marked with `profiles.is_test_fixture = true`.
- `user_settings` rows are now created/backfilled at the database layer and also written during Supabase profile completion. Hosted verification after backfill showed 23 total profiles and 23 settings rows.
- Real users who like seeded fixture profiles through `create_swipe` auto-match for dev testing; fixture profiles do not need to run the app and should not match each other.
- Auth confirmation path was improved in `0bc2ffd`:
  - web auth callback handling supports `?code=` and hash-token callback formats
  - pending onboarding profile is saved locally without credentials when email confirmation is required
  - pending profile/member/photo persistence resumes after confirmation returns a session
  - root loader waits while backend profile restoration is in progress
  - dedicated pending-confirmation screen exists
  - development-only sign-in reset control clears local test state
- Discovery and chat are not yet backend source of truth. Swipe persistence can now target seeded backend fixture profile UUIDs while local UI still drives the visible demo experience.
- Active legacy-generator toolchain coupling has been removed: app scripts now call Expo CLI directly, Metro uses the default Expo config, app scheme/package identifiers are Orchard-specific, generator metadata has been removed, and onboarding backgrounds use bundled Orchard assets instead of externally hosted generated image URLs.

## Current Backend State

Tables covered:

- `profiles`
- `profile_members`
- `profile_photos`
- `swipes`
- `matches`
- `messages`
- `blocks`
- `reports`
- `user_settings`
- `account_deletion_requests`

RPCs:

- `create_swipe(target_profile_id, swipe_decision)`
- `unmatch_match(target_match_id)`
- `block_profile(blocked_profile_id)`
- `submit_report(reported_profile_id, report_reason, report_details, reported_message_id)`
- `request_account_deletion(deletion_reason)`

## Latest Commits

- `5723aed` - Refresh handoff after fixture checkpoint
- `aa5dae7` - Stabilize onboarding and fixture match flow
- `ce27578` - update docs
- `1f0f211` - Track GitHub Actions Node warning
- `e4695be` - Record CI workflow validation
- `0bc2ffd` - Improve auth confirmation flow and add CI checks
- `a52ce0e` - Mark handoff commits pushed
- `06f0a9c` - Refresh handoff after auth resume work

## Current Repo Status

- Branch: `main`
- Remote: `origin/main`
- Current handoff state: clean and synced with `origin/main` at docs/status checkpoint `5723aed`.
- Latest pushed implementation checkpoint: `aa5dae7` - Stabilize onboarding and fixture match flow
- Local-only ignored files may exist for Supabase credentials/env: `.local/`, `expo/.env`, and `supabase/.temp/`.
- `personal-os` may have unrelated dirty files; do not revert them.

## Verification

- Local `bun run typecheck` from `expo/`: passed after fixture/profile/match UX changes.
- Local `bun run lint` from `expo/`: passed after fixture/profile/match UX changes.
- Local `expo\node_modules\.bin\supabase db reset`: passed after `202606210001` and `supabase/seed.sql`.
- Local `expo\node_modules\.bin\supabase test db`: passed with 38 tests.
- Hosted `orchard-dev` verification after seed/backfill: 23 profiles, 22 fixtures, 23 settings rows.
- GitHub Actions `Expo Checks`: passed after `0bc2ffd`, `e4695be`, and `1f0f211`.
- GitHub Actions manual `Supabase DB Tests` run `27895063423`: passed in 4m05s, including local Supabase start, database reset, and `supabase test db`.
- Session close check: Orchard web preview process group was stopped.
- Post-decoupling verification on 2026-07-03: `bun run typecheck` passed, `bun run lint` passed, `git diff --check` passed, and `bun run start-web` served the app through Expo CLI at `http://localhost:8081`. The legacy-generator reference scan returned no matches. Browser UAT confirmed the app loads, sign-in works, Discover loads, fixture likes work through the visible UI, the match confirmation modal appears, Matches/Inbox badges update, Inbox opens cleanly, a conversation opens, in-screen chat back returns to Inbox, the three-dot safety menu opens, local text send works, local photo attach/send works, Cancel closes the safety menu, Report profile submits without crashing, Block profile returns to Inbox/removes the conversation, and Unmatch removes the conversation. Hosted SQL verification confirmed a fresh `swipes` row from the fixture-like test; `matches` rows exist for fixture matches, but no fresh match timestamp appeared for the retested pair, likely because an existing pair row suppresses rematch timestamps. Text/photo chat sends are still local-only and should not be expected in hosted `messages` yet.
- Chat route update-loop fixes landed after UAT found crashes entering chat and using back: the chat screen now renders an in-screen header/actions instead of per-route native stack options, and read marking avoids no-op conversation persistence writes.
- Report profile and Block profile now map seeded mock fixture ids to backend profile UUIDs before calling Supabase safety RPCs. Report profile and Block profile have both passed browser smoke testing.
- Rematch timestamp/state semantics were fixed in migration `202607030001_rematch_active_match_history.sql`: inactive match history is preserved, only one active match per user pair is allowed, and a later rematch creates a fresh active match row with a fresh `created_at`. The migration was applied to hosted `orchard-dev`; follow-up dry run reports the remote database is up to date and migration list shows local/remote aligned through `202607030001`.
- Backend chat persistence has started behind the service boundary: Supabase mode now uses `createSupabaseChatService`, and `ProfileProvider.sendMessage` non-blockingly persists outbound text messages to the hosted `messages` table when a matching active backend match exists. Visible chat state, simulated replies, read receipts, deletes, and photo messages remain local/mock for now.
- Hosted browser UAT did not yet verify backend message insertion: after sending a unique text message, the hosted `public.messages` query returned no row, and hosted `matches` did not show a fresh match row with today's timestamp. Next session should check whether the browser is using a backend-backed active match, whether local mock conversation ids are resolving to hosted fixture match ids correctly, and whether rematch creation is being exercised in hosted Supabase.

## Active Blockers / Open Loops

- Hosted Supabase email sends are rate-limited to 2/hour; confirmation-link smoke test is blocked until the rate limit clears or custom SMTP is configured.
- Need full hosted browser signup/onboarding/photo smoke test in one browser profile.
- Supabase Auth email sender/template branding requires custom SMTP setup.
- Apple Developer Program account still needs to be created.
- Real public legal/support URLs are still placeholders.
- Decide whether manual Supabase DB tests should run automatically for `supabase/**` pull-request changes.
- Resolve GitHub Actions Node 20 deprecation warning from `actions/checkout@v4` when a Node-24-native action version is available.

## Next Best Tasks

1. Debug hosted backend-backed active match resolution for chat persistence; current UAT did not produce a hosted `messages` row or fresh hosted `matches` timestamp.
2. Continue backend source-of-truth work for chat reads/inbox and message attachments.
3. Retest hosted Supabase confirmation flow with selected local photo once email rate limit clears.
4. Decide whether to ingest fixture images into Supabase Storage for backend-backed discovery.
5. Begin backend source-of-truth work behind services without replacing local UI source of truth yet: discovery adapter, match list adapter, chat read/send adapter.
6. Decide whether to auto-run Supabase DB tests on migration pull requests.
7. Create Apple Developer Program account and plan custom SMTP/legal URL setup.

## Session Start Shortcut

If the user says `status report` in any capitalization:

1. Read `AGENTS.md`, `.agents/handoff.md`, `docs/session-handoff.md`, `docs/project-status.md`, and `docs/backend-migration-plan.md`.
2. Inspect `git status` and recent commits.
3. Do not modify files yet.
4. Summarize current repo state, implementation status, latest completed commit, next recommended task, and blockers/human decisions.
5. Wait for user confirmation before making changes.

## Cautions

- Do not remove mock/demo behavior.
- Do not rewrite `expo/providers/profile-provider.tsx` in one pass.
- Do not commit `.env`, secrets, Supabase service-role keys, signing credentials, Apple credentials, Google credentials, or private config.
- Do not put private messages, raw profile text, or PII into analytics.
- Do not collect exact location for MVP unless explicitly approved.
- Supabase RLS/RPC behavior must be tested with multiple users before runtime code depends on it as source of truth.

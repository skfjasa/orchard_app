# Session Handoff

Last updated: 2026-06-21

## Current Context

The repo is `skfjasa/orchard_app`. App code lives in `expo/`.

This is a Rork-generated Expo React Native app using Expo Router, TypeScript, React Native 0.81.5, Expo 54, React 19, and Bun. The MVP target is an iOS-first TestFlight-ready dating app for polyamorous / ENM users. Android is later.

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
- Preserve the existing Rork UI unless explicitly asked to redesign.
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
- Hosted migrations through `202606200002` have been pushed and verified.
- `profile_members` supports single/couple `Profile.people[]`.
- Private `profile-photos` Supabase Storage bucket and owner-scoped policies exist.
- Supabase Storage-backed selected local onboarding photo upload exists.
- Auth confirmation path was improved in `0bc2ffd`:
  - web auth callback handling supports `?code=` and hash-token callback formats
  - pending onboarding profile is saved locally without credentials when email confirmation is required
  - pending profile/member/photo persistence resumes after confirmation returns a session
  - root loader waits while backend profile restoration is in progress
  - dedicated pending-confirmation screen exists
  - development-only sign-in reset control clears local test state
- Discovery, reciprocal match source of truth, and chat are not yet backend source of truth.

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

- `1f0f211` - Track GitHub Actions Node warning
- `e4695be` - Record CI workflow validation
- `0bc2ffd` - Improve auth confirmation flow and add CI checks
- `a52ce0e` - Mark handoff commits pushed
- `06f0a9c` - Refresh handoff after auth resume work

## Current Repo Status

- Branch: `main`
- Remote: `origin/main`
- Current handoff state: code commits are clean/synced with `origin/main`; handoff sync markdown changes are saved locally and uncommitted.
- Latest pushed commit: `1f0f211` - Track GitHub Actions Node warning
- Local-only ignored files may exist for Supabase credentials/env: `.local/`, `expo/.env`, and `supabase/.temp/`.
- `personal-os` may have unrelated dirty files; do not revert them.

## Verification

- Local `bun run typecheck` from `expo/`: passed after auth/UX/CI changes.
- Local `bun run lint` from `expo/`: passed after auth/UX/CI changes.
- Local Supabase database tests previously passed with 25 tests after profile photo storage migration.
- GitHub Actions `Expo Checks`: passed after `0bc2ffd`, `e4695be`, and `1f0f211`.
- GitHub Actions manual `Supabase DB Tests` run `27895063423`: passed in 4m05s, including local Supabase start, database reset, and `supabase test db`.
- Session close check: Orchard web preview process group was stopped.

## Active Blockers / Open Loops

- Hosted Supabase email sends are rate-limited to 2/hour; confirmation-link smoke test is blocked until the rate limit clears or custom SMTP is configured.
- Need full hosted browser signup/onboarding/photo smoke test in one browser profile.
- Supabase Auth email sender/template branding requires custom SMTP setup.
- Apple Developer Program account still needs to be created.
- Real public legal/support URLs are still placeholders.
- Decide whether manual Supabase DB tests should run automatically for `supabase/**` pull-request changes.
- Resolve GitHub Actions Node 20 deprecation warning from `actions/checkout@v4` when a Node-24-native action version is available.

## Next Best Tasks

1. Retest hosted Supabase confirmation flow with selected local photo once email rate limit clears.
2. Add safety/moderation hardening DB/RLS tests for report-message, blocked discovery, blocked chat, unmatch behavior, and account deletion edge cases.
3. Begin backend source-of-truth work behind services without replacing local UI source of truth yet: discovery adapter, match list adapter, chat read/send adapter.
4. Decide whether to auto-run Supabase DB tests on migration pull requests.
5. Create Apple Developer Program account and plan custom SMTP/legal URL setup.

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

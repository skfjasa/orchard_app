# Session Handoff

Last updated: 2026-06-20

## Current Context

The repo is `skfjasa/orchard_app`. App code lives in `expo/`.

This is a Rork-generated Expo React Native app using Expo Router, TypeScript, React Native 0.81.5, Expo 54, React 19, and Bun. The MVP target is an iOS-first TestFlight-ready dating app for polyamorous / ENM users. Android is later.

The product wedge is structured relationship-context matching, not a generic swipe clone. Relationship structure, partnered status, dating mode, boundaries, looking-for intent, and expectations should be clear before chat.

## Session Start Shortcut

If the user says `status report` in any capitalization, treat it as the standard startup command:

1. Read `AGENTS.md`, `docs/session-handoff.md`, `docs/project-status.md`, and `docs/backend-migration-plan.md`.
2. Inspect `git status` and recent commits.
3. Do not modify files yet.
4. Summarize current repo state, implementation status, latest completed commit, next recommended task, and blockers/human decisions.
5. Wait for user confirmation before making changes.

## Important Product Decisions

- User monetization is out of MVP scope.
- Monetizable features should remain demoable without payment walls during the feedback MVP.
- Existing and future monetization surfaces are tracked in `docs/monetization-candidates.md`.
- Preserve the existing Rork UI unless explicitly asked to redesign.
- Preserve mock/demo mode while backend features are introduced.
- Keep changes small and commit/sync after meaningful steps.
- Update `docs/project-status.md` when status, plan, or blockers change.

## Current Technical State

- Runtime behavior is still mostly local/mock.
- Persistence is still primarily `AsyncStorage`.
- `ProfileProvider` remains the main runtime state provider.
- `ProfileProvider` no longer directly owns AsyncStorage helper code.
- Local interaction, monetization, profile mutation, and storage helper logic has been extracted.
- Service interfaces and mock adapters exist.
- Supabase client skeleton exists and is env-gated.
- Auth provider foundation exists and defaults to mock mode when Supabase env vars are absent.
- Hardened Supabase schema/RLS/RPC migration draft exists.
- Supabase service adapters exist for swipe, match, and safety.
- Backend/mock service factory exists.
- Swipe persistence has a gated, non-blocking hook through the service factory. Local UI state remains the source of truth.
- Supabase hardening is tracked in `docs/supabase-hardening-plan.md`.
- Supabase safety report and account deletion calls now use RPCs, with actor identity derived by the database.
- Supabase CLI is installed as an Expo dev dependency (`supabase@2.107.0`), and local Supabase config exists at `supabase/config.toml`.
- Initial pgTAP-style database/RLS tests exist at `supabase/tests/database/202606200001_mvp_security.sql`, but they have not been run because Docker Desktop is not installed/running.

## Current Backend State

Migration draft:

- `supabase/migrations/202606190001_initial_mvp_schema.sql`

Tables covered:

- `profiles`
- `profile_photos`
- `swipes`
- `matches`
- `messages`
- `blocks`
- `reports`
- `user_settings`
- `account_deletion_requests`

Draft RPCs:

- `create_swipe(target_profile_id, swipe_decision)`
- `unmatch_match(target_match_id)`
- `block_profile(blocked_profile_id)`
- `submit_report(reported_profile_id, report_reason, report_details, reported_message_id)`
- `request_account_deletion(deletion_reason)`

The migration has not been applied to a live Supabase project yet.

## Latest Commits

- `f9859fa` - Gate swipe persistence through services
- `8d1c023` - Add backend service factory
- `525df94` - Add Supabase service adapters
- `9cf5b94` - Add core Supabase RPC drafts
- `9422c3a` - Draft initial Supabase schema
- `c4a4efb` - Add auth session provider foundation
- `a4f57ea` - Add env-gated Supabase client skeleton
- `3efd74a` - Update provider architecture status

## Current Repo Status

As of this handoff, before committing this doc refresh:

- Branch: `main`
- Remote: `origin/main`
- Expected status after commit/push: clean and synced

## Checks Used

Run from `expo/`:

```bash
bun run lint
bun run typecheck
```

Both passed after the latest runtime code change (`f9859fa`).

## Next Best Tasks

1. Install/start Docker Desktop.
2. Run `expo\node_modules\.bin\supabase start` from the repo root.
3. Run `expo\node_modules\.bin\supabase test db` from the repo root.
4. Fix any database test failures and review the hardened SQL before dev apply.
5. Decide whether to apply the hardened Supabase migration to a dev project now or build local safety/legal surfaces first.
6. Decide production bundle ID and beta app identity.
7. Add required safety/legal surfaces: privacy, terms, community standards, support, report, block, unmatch, account deletion.
8. Wire real auth into onboarding/sign-in once schema decisions are made.
9. Persist onboarding/profile to Supabase.
10. Add photo upload through `StorageService`.
11. Replace swipe/match/chat local state as source of truth only after auth/profile persistence works.

## Human Decisions Needed

- Production bundle ID.
- Apple Developer account availability.
- Supabase project name and region.
- Public Privacy Policy URL.
- Public Terms URL.
- Public Support URL or email.
- Public Account Deletion URL or documented support process.
- Whether to keep `Orchard` as the final app name.

## Cautions

- Do not rewrite `ProfileProvider` in one pass.
- Do not remove mock/demo behavior.
- Do not commit `.env`, secrets, Supabase service-role keys, signing credentials, Apple credentials, Google credentials, or private config.
- Do not put private messages, raw profile text, or PII into analytics.
- Do not collect exact location for MVP unless explicitly approved.
- Supabase RLS/RPC behavior must be tested with multiple users before runtime code depends on it as source of truth.

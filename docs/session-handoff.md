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

## Session Handoff Shortcut

If the user says `handoff sync` or `session handoff` in any capitalization, follow the global session-end handoff protocol from `C:\Users\skfja\.codex\AGENTS.md` and `C:\Users\skfja\Projects\AGENTS.md`.

For Orchard, the project-specific handoff update should:

1. Inspect `git status` and recent commits.
2. Update all relevant Orchard markdown files containing current status, updates, context, blockers, or next-step instructions. Start with `docs/session-handoff.md`, `docs/project-status.md`, `docs/backend-migration-plan.md`, and `README.md`; update other docs only when materially stale.
3. Update central `personal-os` mirrors when available and relevant.
4. Do not change runtime code unless the user explicitly asks.
5. Summarize changed docs, current blockers, and exact next-session startup steps.

When these docs become large, compact them by preserving active state, blockers, decisions, verification, and next actions in current-state files, while moving older tactical detail to dated history or archive docs.

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
- Initial pgTAP-style database/RLS tests exist at `supabase/tests/database/202606200001_mvp_security.sql` and pass locally.
- Docker Desktop was installed manually during the 2026-06-20 session and is now operational after enabling firmware virtualization.
- Post-fix diagnostics on 2026-06-20:
  - CPU: AMD Ryzen 5 5600X 6-Core Processor
  - `VirtualizationFirmwareEnabled: True`
  - `HypervisorPresent: True`
  - Docker Desktop server running Docker Engine 29.5.3 on Linux
  - `wsl --status`: default distribution `docker-desktop`, default version 2
- The first database test run exposed pgTAP assertion argument mistakes; those were fixed in `supabase/tests/database/202606200001_mvp_security.sql`, and the suite then passed 19/19.
- Initial in-app Safety & Legal surface exists and is linked from Profile.
- Report profile, report message, block, unmatch, and account deletion request entry points exist in the mock/local app flow and call the service boundary.
- Onboarding includes a required 18+ and legal acceptance screen before account type selection; acceptance is stored on the local prototype profile.
- Safety/legal URLs and support contact are env-configurable via `expo/constants/legal.ts` and `expo/.env.example`; final public values are still human decisions.

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

- `a29e3c4` - Harden Supabase MVP migration
- `2b73a97` - Document status report shortcut
- `3a39dbc` - Refresh session handoff context
- `f9859fa` - Gate swipe persistence through services
- `8d1c023` - Add backend service factory
- `525df94` - Add Supabase service adapters
- `9cf5b94` - Add core Supabase RPC drafts
- `9422c3a` - Draft initial Supabase schema
- `c4a4efb` - Add auth session provider foundation
- `a4f57ea` - Add env-gated Supabase client skeleton
- `3efd74a` - Update provider architecture status

## Current Repo Status

As of the 2026-06-20 safety/legal checkpoint, before committing this doc refresh:

- Branch: `main`
- Remote: `origin/main`
- Current working tree contains legal/support env configuration changes plus status doc updates.
- Runtime app code changed in `expo/constants/legal.ts`, `expo/app/safety-legal.tsx`, and `expo/app/onboarding/legal.tsx`.
- Local Supabase database is running via Docker Desktop. Non-database Supabase services are stopped, which was sufficient for `supabase test db`.
- `personal-os` already had unrelated dirty files before this handoff; do not revert them.

## Checks Used

Run from `expo/`:

```bash
bun run lint
bun run typecheck
```

Both passed after the latest runtime code change (`f9859fa`).

Run from the repo root:

```bash
expo/node_modules/.bin/supabase start
expo/node_modules/.bin/supabase test db
```

`supabase test db` passed locally after the Docker checkpoint: 1 file, 19 tests.

After the safety/legal UI changes, run from `expo/`:

```bash
bun run lint
bun run typecheck
```

Both passed.

## 2026-06-20 Handoff Scope

This handoff intentionally updated continuity/status docs only.

Latest handoff additions:

- Added initial Safety & Legal screen linked from Profile.
- Wired report profile, report message, block, unmatch, and account deletion request entry points through the service boundary.
- Preserved mock/local behavior; backend persistence still depends on auth/profile source-of-truth work.
- Added onboarding 18+ and legal acceptance gate before profile creation.
- Added env-backed legal/support configuration and wired Safety & Legal/onboarding policy links to it.

Orchard files updated:

- `AGENTS.md`
- `README.md`
- `docs/session-handoff.md`
- `docs/project-status.md`
- `docs/backend-migration-plan.md`
- `docs/setup.md`
- `docs/supabase-hardening-plan.md`
- `docs/supabase-schema.md`
- `docs/mvp-backlog.md`
- `docs/profile-provider-map.md`
- `docs/codex-operating-guide.md`
- `supabase/tests/database/202606200001_mvp_security.sql`
- `expo/app/safety-legal.tsx`
- `expo/app/_layout.tsx`
- `expo/app/(tabs)/profile.tsx`
- `expo/app/match/[id].tsx`
- `expo/app/chat/[id].tsx`
- `expo/providers/profile-provider.tsx`
- `expo/app/onboarding/legal.tsx`
- `expo/app/onboarding/index.tsx`
- `expo/app/onboarding/_layout.tsx`
- `expo/app/onboarding/photos.tsx`
- `expo/providers/onboarding-provider.tsx`
- `expo/types/index.ts`
- `expo/constants/legal.ts`
- `expo/.env.example`

Global/workspace files updated:

- `C:\Users\skfja\.codex\AGENTS.md`
- `C:\Users\skfja\Projects\AGENTS.md`
- `C:\Users\skfja\Projects\personal-os\AGENTS.md`
- `C:\Users\skfja\Projects\personal-os\01-control-center\repo-status.md`
- `C:\Users\skfja\Projects\personal-os\01-control-center\open-loops.md`
- `C:\Users\skfja\Projects\personal-os\01-control-center\decisions.md`
- `C:\Users\skfja\Projects\personal-os\03-projects\handoffs\index.md`
- `C:\Users\skfja\Projects\personal-os\03-projects\handoffs\orchard_app\latest.md`
- `C:\Users\skfja\Projects\personal-os\03-projects\handoffs\orchard_app\sessions\2026-06-20-docker-restart.md`

Existing unrelated dirty files in `personal-os` should be preserved and not reverted.

## Next Best Tasks

1. Decide public Privacy Policy, Terms, Support, and Account Deletion URLs/email, then fill the legal/support env values.
2. Review the hardened SQL and passing database/RLS tests before dev apply.
3. Decide whether to apply the hardened Supabase migration to a dev project.
4. Decide production bundle ID and beta app identity.
5. Wire real auth into onboarding/sign-in once schema decisions are made.
6. Persist onboarding/profile to Supabase.
7. Add photo upload through `StorageService`.
8. Replace swipe/match/chat local state as source of truth only after auth/profile persistence works.

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

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
- Supabase email/password auth is wired into sign-in and final onboarding completion when Supabase env vars are present.
- Hardened Supabase schema/RLS/RPC migration draft exists.
- The migration includes `profile_members` and requires member-scoped `profile_photos`, so the backend can represent the app's single/couple `Profile.people[]` shape.
- Supabase service adapters exist for swipe, match, and safety.
- Backend/mock service factory exists.
- Swipe persistence has a gated, non-blocking hook through the service factory. Local UI state remains the source of truth.
- Supabase hardening is tracked in `docs/supabase-hardening-plan.md`.
- Supabase safety report and account deletion calls now use RPCs, with actor identity derived by the database.
- Supabase CLI is installed as an Expo dev dependency (`supabase@2.107.0`), and local Supabase config exists at `supabase/config.toml`.
- Hosted Supabase dev project `orchard-dev` exists at project ref `cvvavwuksygahezzhmqp`; local CLI is linked to it.
- Initial pgTAP-style database/RLS tests exist at `supabase/tests/database/202606200001_mvp_security.sql` and pass locally.
- Docker Desktop was installed manually during the 2026-06-20 session and is now operational after enabling firmware virtualization.
- Post-fix diagnostics on 2026-06-20:
  - CPU: AMD Ryzen 5 5600X 6-Core Processor
  - `VirtualizationFirmwareEnabled: True`
  - `HypervisorPresent: True`
  - Docker Desktop server running Docker Engine 29.5.3 on Linux
  - `wsl --status`: default distribution `docker-desktop`, default version 2
- The first database test run exposed pgTAP assertion argument mistakes; those were fixed in `supabase/tests/database/202606200001_mvp_security.sql`. After the profile-member schema update and local database reset, the suite passes 22/22.
- Initial in-app Safety & Legal surface exists and is linked from Profile.
- Report profile, report message, block, unmatch, and account deletion request entry points exist in the mock/local app flow and call the service boundary.
- Report profile/message now routes through a dedicated reason/details form before submission.
- Direct chat routes and provider send helpers are guarded so the local app only shows/writes chat for active local matches.
- Onboarding includes a required 18+ and legal acceptance screen before account type selection; acceptance is stored on the local prototype profile.
- Safety/legal URLs and support contact are env-configurable via `expo/constants/legal.ts` and `expo/.env.example`; final public values are still human decisions.
- In Supabase mode, the root route requires an active Supabase session before entering the tab app. Final onboarding creates a Supabase auth user first and uses the Supabase user id as the local prototype profile id when a session is returned.
- A Supabase profile adapter persists onboarding/profile rows to `profiles` and `profile_members`; the provider can hydrate a signed-in user's local prototype profile from those backend rows.
- A Supabase storage adapter now uploads selected local onboarding profile photos to a private `profile-photos` bucket, writes `profile_photos.member_id` metadata rows, and hydrates signed current-profile photo URLs locally.
- New migration `202606200002_profile_photo_storage.sql` adds the storage bucket, owner-scoped storage object policies, and the `profile_photos(profile_id, member_id, sort_order)` unique constraint required for upserts. It passes local reset/tests and has been pushed to hosted `orchard-dev`; app smoke testing with a selected photo is still pending.
- The project review's `ProfileProvider` and CI/CD recommendations are noted: keep extracting through services instead of rewriting the provider, and add lint/typecheck/database CI after the backend auth/profile path stabilizes.
- MVP prototype gap assessment is recorded in `docs/mvp-prototype-gap-assessment.md`.
- Current distance estimate: local demo prototype is close, real backend MVP is roughly 2-4 focused weeks after hosted Supabase setup, and TestFlight beta is roughly 4-6+ weeks depending on Apple/Supabase/legal/build readiness.

## Current Backend State

Migration draft:

- `supabase/migrations/202606190001_initial_mvp_schema.sql`
- `supabase/migrations/202606200002_profile_photo_storage.sql`

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

Draft RPCs:

- `create_swipe(target_profile_id, swipe_decision)`
- `unmatch_match(target_match_id)`
- `block_profile(blocked_profile_id)`
- `submit_report(reported_profile_id, report_reason, report_details, reported_message_id)`
- `request_account_deletion(deletion_reason)`

The initial migration was applied to hosted `orchard-dev` with `expo/node_modules/.bin/supabase db push`. `supabase migration list` shows `202606190001` aligned locally and remotely. Supabase Dashboard verification confirmed the hosted Orchard tables exist, RLS is enabled on public Orchard tables, and `supabase_migrations.schema_migrations` contains `202606190001`. CLI dry-run verification was temporarily blocked by Supabase's auth circuit breaker after temporary-role auth failures, but dashboard verification completed the hosted setup check.

The storage migration `202606200002` has been applied locally and pushed to hosted `orchard-dev`. A follow-up `supabase db push --dry-run` reported the remote database is up to date. `supabase migration list` verification timed out once after the push, but the dry-run confirmed no pending migrations.

## Latest Commits

- `e87e9f0` - Wire Supabase auth and profile persistence
- `1be95cd` - project review gemini
- `b9110df` - Record MVP decisions and handoff context
- `034e254` - Enforce active match for local sends
- `b56039c` - Guard chat behind active local matches
- `2834c55` - Add report reason details flow
- `e9bff32` - Configure legal and support links
- `5424577` - Add onboarding age and legal gate
- `e402633` - Add initial safety and legal surfaces
- `915bc88` - Verify local Supabase database tests
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

As of the 2026-06-20 Supabase auth/profile persistence handoff:

- Branch: `main`
- Remote: `origin/main`
- Latest pushed commit: `e87e9f0` - Wire Supabase auth and profile persistence.
- Working tree should contain only this handoff doc refresh before the handoff commit.
- Local-only ignored files exist for Supabase credentials/env: `.local/`, `expo/.env`, and `supabase/.temp/`.
- Local Supabase database is running via Docker Desktop. Non-database Supabase services are stopped, which was sufficient for `supabase test db`.
- `personal-os` already had unrelated dirty files before this handoff; do not revert them.

## Checks Used

Run from `expo/` after `e87e9f0`:

```bash
bun run lint
bun run typecheck
```

Both passed.

Run from the repo root:

```bash
expo/node_modules/.bin/supabase start
expo/node_modules/.bin/supabase test db
```

`supabase test db` passed locally after the Docker checkpoint: 1 file, 19 tests.

After the profile-member schema update, the local database was reset with:

```bash
expo/node_modules/.bin/supabase db reset
```

Then:

```bash
expo/node_modules/.bin/supabase test db
```

passed locally: 1 file, 22 tests.

After adding profile photo storage, local verification used:

```bash
bun run typecheck
bun run lint
expo/node_modules/.bin/supabase db reset
expo/node_modules/.bin/supabase test db
```

All passed; `supabase test db` reports 1 file, 25 tests.

## 2026-06-20 Handoff Scope

Latest implementation checkpoint:

- `e87e9f0` wires Supabase email/password sign-in and account creation while preserving mock mode.
- Adds Supabase profile/member persistence through `expo/services/supabase-profile-service.ts`.
- Extends the initial migration with `profile_members` and member-scoped `profile_photos`.
- Applies the initial migration to hosted `orchard-dev`; Dashboard verification confirmed tables, RLS, and migration history.
- Keeps profile photos local/default for now; Supabase Storage and `profile_photos.member_id` writes are the next backend task.
- Records review follow-ups: avoid a broad `ProfileProvider` rewrite, keep moving behavior behind services, and add CI after backend command reliability is confirmed.

Orchard files updated:

- `.gitignore`
- `docs/20260620_project_review.md`
- `docs/session-handoff.md`
- `docs/project-status.md`
- `docs/backend-migration-plan.md`
- `docs/mvp-backlog.md`
- `docs/mvp-plan.md`
- `docs/supabase-hardening-plan.md`
- `docs/supabase-schema.md`
- `expo/app/index.tsx`
- `expo/app/onboarding/photos.tsx`
- `expo/app/onboarding/sign-in.tsx`
- `expo/lib/supabase.ts`
- `expo/providers/auth-provider.tsx`
- `expo/providers/profile-provider.tsx`
- `expo/services/app-services.ts`
- `expo/services/auth-service.ts`
- `expo/services/index.ts`
- `expo/services/supabase-profile-service.ts`
- `supabase/migrations/202606190001_initial_mvp_schema.sql`
- `supabase/tests/database/202606200001_mvp_security.sql`

Existing unrelated dirty files in `personal-os` should be preserved and not reverted.

## Next Best Tasks

1. Create Apple Developer Program account.
2. Smoke-test onboarding in Supabase mode with a selected local photo.
3. Add focused CI for lint, typecheck, and database tests once remote/local DB command reliability is confirmed.
4. Replace swipe/match/chat local state as source of truth only after auth/profile persistence works.
5. Add EAS build config and TestFlight metadata when backend/legal placeholders are acceptable.

## Human Decisions Needed

- Apple Developer account creation.
- Real public domain/legal URLs before productionization.

## Cautions

- Do not rewrite `ProfileProvider` in one pass.
- Do not remove mock/demo behavior.
- Do not commit `.env`, secrets, Supabase service-role keys, signing credentials, Apple credentials, Google credentials, or private config.
- Do not put private messages, raw profile text, or PII into analytics.
- Do not collect exact location for MVP unless explicitly approved.
- Supabase RLS/RPC behavior must be tested with multiple users before runtime code depends on it as source of truth.

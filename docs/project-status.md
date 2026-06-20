# Project Status

Last updated: 2026-06-20

## Current Repo State

- Repo: `skfjasa/orchard_app`
- Handoff checkpoint: 2026-06-20 Supabase auth/profile persistence handoff
- App code: `expo/`
- Runtime: Expo React Native with Expo Router and TypeScript
- Package manager: Bun
- Backend: Supabase client, email/password auth wiring, hosted profile/member persistence, Supabase Storage-backed profile photo upload, hardened schema/RLS/RPC draft with single/couple profile member support, initial Supabase service adapters, backend/mock service factory, gated swipe persistence hook, and hosted `orchard-dev` project linked/applied through migration `202606200002`; discovery/matching/chat behavior is not fully backend source-of-truth yet
- Persistence: local `AsyncStorage`
- Checks: `bun run typecheck`, `bun run lint`, `expo\node_modules\.bin\supabase db reset`, and `expo\node_modules\.bin\supabase test db`
- Branch: `main`
- MVP monetization: disabled
- Local Docker: Docker Desktop is operational after enabling firmware virtualization. `docker version` reports Docker Desktop with a Linux engine, and WSL default distribution is `docker-desktop`.
- Handoff procedure: global `handoff sync` / `session handoff` behavior is being recorded in global/workspace instructions and Orchard-specific docs.

## Latest Foundation Commits

- `6100fc5` - Add Supabase profile photo storage
- `e87e9f0` - Wire Supabase auth and profile persistence
- `1be95cd` - Add Gemini project review
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
- `f9859fa` - Gate swipe persistence through backend service factory
- `8d1c023` - Add backend/mock service factory
- `525df94` - Add Supabase swipe, match, and safety service adapters
- `9cf5b94` - Add core Supabase matching and safety RPC drafts
- `9422c3a` - Draft initial Supabase schema and RLS
- `c4a4efb` - Add auth/session provider foundation
- `a4f57ea` - Add env-gated Supabase client skeleton
- `3efd74a` - Update provider architecture status
- `4ad31ef` - Demo-enable monetizable features without MVP paywalls
- `b5aa1d0` - Extract local profile mutation helpers
- `4a214e6` - Extract local monetization helpers
- `b699432` - Extract local interaction helpers
- `cb19b2b` - Extract local profile storage service
- `95069ee` - Fix existing lint issues
- `53981d9` - Add mock service adapters
- `eeec50f` - Add service interface skeletons
- `13f7df9` - Document profile provider responsibilities
- `b39368e` - Add project operating layer

## What Is Done

- Project operating docs and repo audit exist.
- `.env.example` exists under `expo/`.
- Typecheck script exists.
- Service interfaces and mock adapters exist.
- `ProfileProvider` no longer owns direct `AsyncStorage` calls.
- Local swipe/chat/message simulation helpers are extracted.
- Local monetization calculations are extracted.
- Local profile mutation helpers are extracted.
- `docs/project-status.md` is the running status/context/plan tracker.
- Monetization is explicitly out of scope for the feedback MVP.
- Monetizable features should be demoable without payment walls when monetization is disabled.
- Existing and possible future monetization surfaces are tracked in `docs/monetization-candidates.md`.
- Supabase dependency and env-gated client skeleton exist.
- Auth/session provider foundation exists and defaults to mock mode when Supabase env vars are absent.
- Initial Supabase schema/RLS migration draft exists.
- Draft RPCs exist for reciprocal swipe matching, unmatch, and block behavior.
- Supabase service adapters exist for swipe, match, and safety behavior. Swipe persistence is lightly wired into the provider as a gated, non-blocking hook; match and safety adapters are not wired into UI/provider flows yet.
- Backend/mock service factory exists and exposes per-service capabilities so partial Supabase support is explicit.
- `ProfileProvider` can now call the swipe service factory as a non-blocking persistence hook when Supabase mode has a real authenticated profile id. Local state remains the UI source of truth.
- Supabase hardening is tracked in `docs/supabase-hardening-plan.md`.
- The initial Supabase migration draft has been hardened with authenticated-only RLS policies, private eligibility helpers, column-scoped profile/photo grants, RPC-only report/account-deletion writes, actor eligibility checks for swipes/messages, and the missing account deletion `reason` column.
- The Supabase safety adapter now uses RPCs for report and account deletion requests so actor identity is derived server-side.
- Supabase CLI is installed as an Expo dev dependency (`supabase@2.107.0`), and local Supabase config exists at `supabase/config.toml`.
- Hosted Supabase dev project `orchard-dev` exists at project ref `cvvavwuksygahezzhmqp`.
- Initial pgTAP-style database/RLS tests exist at `supabase/tests/database/202606200001_mvp_security.sql` and pass locally.
- Docker Desktop was installed manually during the 2026-06-20 session and is now operational after firmware virtualization was enabled.
- Diagnostics captured after enabling virtualization on 2026-06-20: AMD Ryzen 5 5600X, `VirtualizationFirmwareEnabled: True`, `HypervisorPresent: True`, Docker Desktop server running Docker Engine 29.5.3 on Linux, WSL default distribution `docker-desktop`, WSL default version 2.
- The first database test run exposed pgTAP assertion argument mistakes, which were fixed in `supabase/tests/database/202606200001_mvp_security.sql`; the suite then passed 19/19.
- Initial in-app Safety & Legal surface exists at `expo/app/safety-legal.tsx`, linked from Profile.
- Profile detail and chat now expose report/block actions; chat also exposes unmatch and report-message actions. These use the existing safety service boundary and preserve mock mode.
- Report profile and report message actions now open a reason/details form before submitting through the safety service.
- Account deletion can be requested from the Safety & Legal screen; the local flow records the request through the safety service and signs out.
- Direct chat routes and local message/photo send helpers now require an active local match before showing or writing conversation content.
- Onboarding now includes a pre-profile age/legal gate for 18+ confirmation, MVP terms, privacy notice, and community standards acceptance. Acceptance is stored on the local prototype profile.
- Safety/legal links and support contact are env-configurable through `EXPO_PUBLIC_PRIVACY_POLICY_URL`, `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_COMMUNITY_STANDARDS_URL`, `EXPO_PUBLIC_SUPPORT_EMAIL`, `EXPO_PUBLIC_SUPPORT_URL`, and `EXPO_PUBLIC_ACCOUNT_DELETION_URL`.
- MVP prototype gap assessment is recorded in `docs/mvp-prototype-gap-assessment.md`.
- Product/release decisions recorded: app name `Orchard`, iOS bundle ID `com.orchardapp.ios`, Supabase dev project `orchard-dev`, production project later `orchard-prod`, Supabase region East US (North Virginia) / `us-east-1`, and placeholder public legal/support URLs under `https://yourdomain.com`.
- Project review recorded in `docs/20260620_project_review.md`.
- The Supabase migration now includes `profile_members` and requires `profile_photos.member_id` to reference a member on the same profile, resolving the review's blocking single/couple schema mismatch before hosted dev apply.
- After a local Supabase database reset to apply the edited migration, `expo\node_modules\.bin\supabase test db` passes: 1 file, 22 tests.
- The local Supabase CLI was linked to hosted `orchard-dev`, `supabase db push --dry-run` showed one pending migration, and `supabase db push` applied `202606190001_initial_mvp_schema.sql`.
- `supabase migration list` shows local and remote migration `202606190001` aligned.
- Supabase Dashboard verification confirmed the hosted Orchard tables exist, RLS is enabled on public Orchard tables, and `supabase_migrations.schema_migrations` contains `202606190001`.
- CLI post-apply dry-run verification was temporarily blocked by Supabase's remote auth circuit breaker after failed temporary-role auth attempts; dashboard verification completed the hosted setup check.
- Real Supabase email/password auth is now wired into sign-in and final onboarding completion when Supabase env vars are present.
- In Supabase mode, the root route requires an active Supabase session before entering the tab app.
- Final onboarding creates a Supabase auth user first and uses the Supabase user id as the local prototype profile id when a session is returned.
- Profile/account-deletion sign-out now clears both local prototype state and the Supabase auth session.
- A Supabase `ProfileService` now persists onboarding/profile rows to `profiles` and `profile_members`, and the provider can hydrate a signed-in user's local prototype profile from those backend rows.
- A Supabase `StorageService` now uploads selected local profile photos to the private `profile-photos` bucket, writes `profile_photos` rows with `member_id`, and hydrates signed photo URLs for the current profile.
- New local migration `202606200002_profile_photo_storage.sql` creates the private storage bucket, owner-scoped storage object policies, and the `profile_photos(profile_id, member_id, sort_order)` unique constraint needed for metadata upserts.
- After the storage migration, `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db` pass locally: 1 file, 25 tests.
- The storage migration `202606200002_profile_photo_storage.sql` has been pushed to hosted `orchard-dev`; follow-up dry run reports the remote database is up to date. A full app smoke test with a selected local photo is still pending.
- Hosted SQL verification on 2026-06-20 confirmed `202606200002` is recorded in `supabase_migrations.schema_migrations`, the `profile-photos` bucket is private, four owner-scoped storage object policies exist, and `profile_photos_profile_member_sort_unique` exists.
- A hosted anon-client smoke test attempted to create a fresh test auth user and was blocked by Supabase's email rate limit before a session was returned. Retest after the rate limit clears or with an existing confirmed dev account.
- Project review recommendations remain relevant: avoid a broad `ProfileProvider` rewrite, keep moving behavior behind services, and add CI/database automation after the auth/profile path has a little more coverage.
- Latest implementation checkpoint `6100fc5` is pushed to `origin/main`.

## Current Task

Smoke-test the Supabase Storage-backed profile photo path in hosted `orchard-dev` with an existing confirmed dev account or after the email rate limit clears.

## Next Planned Tasks

1. Create Apple Developer Program account.
2. Smoke-test onboarding in Supabase mode with a real selected photo.
3. Add a focused CI workflow for `bun run lint`, `bun run typecheck`, and database tests once remote/local DB command reliability is confirmed.
4. Continue reducing `ProfileProvider` responsibility by moving backend-backed behavior behind services.

## Human Decisions Needed

- Apple Developer account creation.
- Real domain for public legal/support URLs before productionization.

## Status Tracking Rule

Update this file whenever a commit materially changes project status, next tasks, or known blockers.

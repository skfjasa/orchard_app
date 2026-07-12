# Current Agent State

Last updated: 2026-07-12

## Objective

Continue converting Orchard into an iOS-first Supabase-backed MVP for close-friends / inner-circle closed beta while preserving mock mode and the existing prototype UI.

## Branch And Commit

- Branch: `main`.
- Remote state: local `main` contains the item 6 and auth-redirect implementation checkpoints and is pending handoff-sync commit/push.
- Latest code checkpoint: `88a1f2a` - Fix hosted auth callback redirect.
- Recent relevant checkpoints:
  - `280b601` - Remove swipe repair from chat sending.
  - `ddac497` - Enforce profile photo path ownership.
  - `96c25bc` - Make onboarding completion two-phase.
  - `e9d3f1b` - Make profile photo replacement transactional.
  - `88a1f2a` - Fix hosted auth callback redirect.
  - `dfac3c2` - Sync session handoff.
  - `bd7c53a` - Sync human-gated remaining work.
  - `f960925` - Remove pass swipe provider wrapper.
  - `9c32cc1` - Extract seen match application.
  - `d14e2b8` - Extract monetization result application.
  - `77f7d4d` - Stabilize query auth and route errors.
  - `4f18af1` - Move match focus refresh to query invalidation.
  - `0544a8a` - Reconcile privacy audit checklist.
  - `a041aa3` - Extract super like recharge helpers.
  - `eadb12b` - Sync handoff after provider cleanup.
  - `487e94e` - Consolidate partner profile mutation wrapper.
  - `68d9a08` - Record backend first chat audit.
  - `b54027b` - Record chat unmatch block audit.
  - `cb8ff54` - Add root app error boundary.
  - `6b24afe` - Add repeatable full-flow UAT checklist.
  - `054679d` - Document Supabase moderation workflow.
  - `249f11e` - Restore fixture profile copy.
  - `7d66cf3` - Record privacy logging audit.

## Current Product / Technical State

- React Query/auth/error-boundary stabilization from `docs/repo-audit-and-foundation-plan.md` Part 4 is implemented. Profile and conversation persistence callbacks now call stable mutation refs, `AuthProvider` processes cold-start auth callback URLs with `Linking.getInitialURL()`, and tab/onboarding route groups have retry error boundaries.
- Current milestone remains **M4 - Supabase source-of-truth app session**.
- M1 provider/facade cleanup has advanced:
  - Local read-watermark and seen-match preference calculations live in `expo/services/local-interaction-service.ts`.
  - Partner-link local profile mutations now share one provider-local persistence helper instead of repeating the same wrapper across invite/resend/accept/remove.
  - Super-like recharge timing calculation now lives in `expo/services/local-monetization-service.ts`; the provider applies the resulting store reset.
  - Local purchase/subscription result application now lives in `expo/services/local-monetization-service.ts`; provider facade actions delegate store updates.
  - Local seen-match state/ref application for `markMatchSeen` now delegates to `expo/services/local-interaction-service.ts`.
  - Backend pass-swipe persistence now calls `recordBackendSwipe` directly through `expo/services/backend-swipe-action-service.ts` instead of a provider-owned wrapper.
  - Matches/Inbox focus refresh no longer depends on a provider `refreshBackendMatches` facade; focused hooks invalidate the React Query matches key directly.
- M7 safety/moderation work advanced:
  - No production analytics calls or private message-body logging were found. The 2026-07-10 deep audit supersedes the earlier broader privacy claim: current diagnostics still log a raw sign-in identifier, stable user/profile ids, and a selected-photo URI.
  - Fixture audit confirmed deterministic test emails/ids and fictional mock copy; original human-like dating/profile language is intentionally preserved for simulation realism.
  - Interim Supabase Studio moderation workflow is documented in `docs/supabase-moderation-workflow.md`.
- M9 QA hardening advanced:
  - Repeatable full-flow UAT checklist now lives in `docs/milestone-tracker.md`.
  - Root Expo Router error boundary exists in `expo/app/_layout.tsx` with retry UI and message-only diagnostic logging.
- M10 TestFlight prep advanced:
  - `expo/eas.json` exists with internal preview and production build profiles plus an iOS submit placeholder.
  - `expo/app.json` now has explicit iOS photo-library and microphone permission copy. The adversarial audit review found that Expo introspection still emits Android camera permission despite `cameraPermission: false`; native permission minimization remains open.
  - Current app metadata/assets were audited: `Orchard`, slug `orchard`, version `1.0.0`, iOS bundle `com.orchardapp.ios`, Android package `com.orchardapp.android`, and 1024x1024 branded icon/adaptive/splash assets.
- M8/M10 release preparation advanced: `docs/beta-release-notes.md` contains draft tester instructions, beta description, and reviewer-note scaffolding with placeholders only.
- M5 discovery advanced: Supabase-mode Discover now relies on the backend discovery service/swipe table for query exclusions instead of local liked/passed ids; mock mode still uses local exclusions.
- M6 chat source audits advanced:
  - Real/non-fixture Supabase text chat is backend-first and appends local conversation state only from successful backend messages.
  - Supabase text-send failures do not create false local sent bubbles.
  - Unmatch/block source paths remove local conversation visibility and server policies deny direct read/send while a match remains inactive. The 2026-07-10 audit found a separate consent bug: stale chat sending can create a new like and active rematch.
- `docs/2026-07-10-repository-audit-gpt-5.6-sol-ultra.md` contains the original deep audit plus a timestamped `gpt-5.6-sol-max` adversarial review. Use the adversarial section for corrected verdicts, exclusions, and the 18-slice PR-sized backlog.
- Corrected backlog item 1 is implemented at `bcd6961`: `expo/package.json` exposes Bun's native test runner, one pure service test covers configured/missing Supabase response semantics, and the regular Expo CI workflow runs application tests. The manual Supabase database workflow is unchanged.
- Corrected backlog item 3 is implemented at `280b601` with automated checks passed and targeted human UAT pending. Chat lookup no longer calls swipe repair, missing/inactive matches trigger the existing bounded local cleanup, and non-match lookup/send failures remain distinct.
- Corrected backlog item 4 is implemented at `ddac497` with automated checks passed and hosted preflight/UAT pending. New migration `202607110001` binds `profile_photos.storage_path` to the row owner at the constraint and RLS layers without changing existing private storage visibility or write policies.
- Corrected backlog item 5 is implemented at `96c25bc` with automated checks passed and human UAT pending. Supabase onboarding now prepares profiles as incomplete/invisible, persists members/settings/photos idempotently, and publishes completion/visibility only in one finalization step. Incomplete server rows resume from pending onboarding when available and cannot enter protected routes. No migration or RPC was added.
- Corrected backlog item 6 is implemented at `e9d3f1b` with automated checks passed and hosted UAT pending. New migration `202607110002` adds an authenticated, owner-scoped transactional photo replacement RPC. The app uploads first, calls the RPC once, compensates new uploads on pre-commit failure, and removes only validated displaced paths after commit. Cleanup failures are awaited and returned as nonfatal committed-with-cleanup warnings. Migration `202607110001` was not edited.
- The auth redirect repository regression is fixed at `88a1f2a`. One pure resolver normalizes web origins/full callbacks to `/onboarding/sign-in`, preserves dynamic web fallback and native Expo/deep-link behavior, and is shared by signup confirmation and password reset. Ignored local `expo/.env` uses `https://maturely-usher-electable.ngrok-free.dev/onboarding/sign-in`. Hosted URL Configuration, Site URL, and email templates were unavailable and were not changed; hosted configuration and newly generated email UAT remain pending.
- `ProfileProvider` remains active as a compatibility facade. App routes/components no longer import `useProfile()` directly; focused read-model hooks own route/provider access.
- Supabase mode has auth/profile/photo/discovery/match/chat/read-state/Realtime paths in varying degrees.
- Mock/Fruit/demo mode remains required and should not be broken by hosted-mode work.

## Validation State

Latest code-touching checks:

- `expo\node_modules\.bin\supabase db reset`: passed through migration `202607110002` and seed.
- `expo\node_modules\.bin\supabase test db`: passed, 1 file and 103 pgTAP cases after item 6 transactional RPC coverage.
- `expo\node_modules\.bin\supabase db lint --level warning`: passed with no schema errors.
- `cd expo; bun test`: passed after both work packages (67 tests, 125 assertions).
- `cd expo; bun run typecheck`: passed after both work packages.
- `cd expo; bun run lint`: passed after both work packages.
- `git diff --check`: passed after both work packages with only existing LF-to-CRLF warnings.
- `cd expo; bun run typecheck`: passed after chat swipe-repair removal.
- `cd expo; bun run lint`: passed after chat swipe-repair removal.
- `git diff --check`: passed after chat swipe-repair removal, with only Git's existing LF-to-CRLF working-copy warnings.
- `cd expo; bun test`: passed after the minimal application test harness (1 test, 2 assertions).
- `cd expo; bun run typecheck`: passed after the minimal application test harness.
- `cd expo; bun run lint`: passed after the minimal application test harness.
- `git diff --check`: passed after the minimal application test harness, with only Git's existing LF-to-CRLF working-copy warnings.
- `cd expo; bun run typecheck`: passed during the 2026-07-10 read-only audit.
- `cd expo; bun run lint`: passed during the 2026-07-10 read-only audit.
- Current GitHub Expo Checks for `dfac3c2`: passed.
- The latest July Supabase migrations were not rerun locally or through the manual DB workflow during the audit.

- `cd expo; bun run typecheck`: passed after M5 Supabase discovery source-of-truth change.
- `cd expo; bun run lint`: passed after M5 Supabase discovery source-of-truth change.
- `git diff --check`: passed after M5 Supabase discovery source-of-truth change.
- `cd expo; bun run typecheck`: passed after partner profile mutation wrapper cleanup.
- `cd expo; bun run lint`: passed after partner profile mutation wrapper cleanup.
- `git diff --check`: passed after partner profile mutation wrapper cleanup.
- `cd expo; bun run typecheck`: passed after match focus refresh moved to query invalidation.
- `cd expo; bun run lint`: passed after match focus refresh moved to query invalidation.
- `git diff --check`: passed after match focus refresh moved to query invalidation.
- `expo/app.json` JSON parse check passed after permission-string config.
- `cd expo; bun run typecheck`: passed after Part 4 React Query/auth/error-boundary stabilization.
- `cd expo; bun run lint`: passed after Part 4 React Query/auth/error-boundary stabilization.
- `git diff --check`: passed after Part 4 React Query/auth/error-boundary stabilization and status doc updates.
- `cd expo; bun run typecheck`: passed after monetization result application cleanup.
- `cd expo; bun run lint`: passed after monetization result application cleanup.
- `git diff --check`: passed after monetization result application cleanup.
- `cd expo; bun run typecheck`: passed after local seen-match action cleanup.
- `cd expo; bun run lint`: passed after local seen-match action cleanup.
- `git diff --check`: passed after local seen-match action cleanup.
- `cd expo; bun run typecheck`: passed after backend pass-swipe wrapper cleanup.
- `cd expo; bun run lint`: passed after backend pass-swipe wrapper cleanup.
- `git diff --check`: passed after backend pass-swipe wrapper cleanup.

No new human UAT was run after these checkpoints.

Final docs-only sync `bd7c53a` ran `git diff --check`; typecheck/lint were not rerun because no runtime code changed.

## Current Blockers / Human Decisions

- Forgot-password flow is wired but still needs human UAT when practical.
- Apple Developer Program, App Store Connect, and real public legal/support/account-deletion URLs are still required before TestFlight polish.
- Human decisions remain open for analytics/crash reporting, automatic Supabase DB tests on migration PRs, fixture image ingestion, feedback channel/support process, and whether mobile web/ngrok is acceptable for the first inner-circle pass before TestFlight.
- M6 Supabase-mode fixture simulated replies/photo behavior still needs a product decision before changing chat behavior further.
- Seeded/demo account creation and private credential handling remain human-owned; the repo now has only placeholder release-note scaffolding.
- Corrected backlog item 1 is complete. Item 2 remains unimplemented; do not claim or partially implement it in another slice.
- Corrected backlog item 3 is `Implemented / Automated Checks Passed / Awaiting UAT`; do not mark it accepted until the targeted hosted scenarios pass.
- Corrected backlog item 4 is `Implemented / Automated Checks Passed / Awaiting Hosted Preflight / Apply / UAT`; hosted preflight and migration apply were not performed.
- Corrected backlog item 5 is `Implemented / Automated Checks Passed / Awaiting UAT`.
- Corrected backlog item 6 is `Implemented / Automated Checks Passed / Awaiting Hosted UAT`; neither July photo migration was applied hosted.
- The auth redirect is `Repository Fix Complete / Hosted Configuration or Email UAT Pending`. Previously issued email links cannot validate the fix.

## Canonical Docs

- `docs/milestone-tracker.md`: single canonical milestone/checklist/UAT/blocker/human-decision source of truth.
- `docs/project-status.md`: running narrative status log.
- `docs/beta-release-notes.md`: draft tester instructions, beta description, and reviewer-note scaffolding.
- `docs/supabase-moderation-workflow.md`: interim Studio moderation workflow.
- `docs/repo-audit-and-foundation-plan.md`: provider/foundation cleanup plan.
- `docs/2026-07-10-repository-audit-gpt-5.6-sol-ultra.md`: original deep audit plus the authoritative adversarial correction, exclusions, and sequenced implementation slices.
- `docs/profile-provider-map.md`: provider responsibility map and extraction context.
- `docs/README.md`: docs index.

## Next Recommended Task

Best next task: finish the handoff commit, push, and verify CI, then run item 4/5/6 and auth-redirect hosted UAT when accounts/sessions are available. Item 2 remains open, item 3 remains awaiting UAT, and item 4 remains awaiting hosted preflight/apply/UAT. Do not begin corrected backlog item 7 without explicit instruction.

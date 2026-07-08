# Current Agent State

Last updated: 2026-07-08

## Objective

Continue converting Orchard into an iOS-first Supabase-backed MVP for close-friends / inner-circle closed beta while preserving mock mode and the existing prototype UI.

## Branch And Commit

- Branch: `main`.
- Remote state: clean with `origin/main` as of latest push.
- Latest checkpoint: `6510765` - Sync agent state after milestone progress.
- Recent relevant checkpoints:
  - `6510765` - Sync agent state after milestone progress.
  - `cd8d0ae` - Clarify Supabase discovery source of truth.
  - `02ee0d9` - Draft beta release notes.
  - `e0bca1c` - Audit TestFlight app metadata.
  - `96a78d9` - Refresh continuity after release prep.
  - `0af8c4e` - Add EAS build configuration.
  - `d149606` - Record hosted filtering source audit.
  - `cb8ff54` - Add root app error boundary.
  - `6b24afe` - Add repeatable full-flow UAT checklist.
  - `054679d` - Document Supabase moderation workflow.
  - `249f11e` - Restore fixture profile copy.
  - `7d66cf3` - Record privacy logging audit.

## Current Product / Technical State

- Current milestone remains **M4 - Supabase source-of-truth app session**.
- M1 provider/facade cleanup has advanced: local read-watermark and seen-match preference calculations now live in `expo/services/local-interaction-service.ts`.
- M7 safety/moderation work advanced:
  - Privacy/logging audit found no production analytics calls and no private message bodies/raw profile text/PII in current diagnostics.
  - Fixture audit confirmed deterministic test emails/ids and fictional mock copy; original human-like dating/profile language is intentionally preserved for simulation realism.
  - Interim Supabase Studio moderation workflow is documented in `docs/supabase-moderation-workflow.md`.
- M9 QA hardening advanced:
  - Repeatable full-flow UAT checklist now lives in `docs/milestone-tracker.md`.
  - Root Expo Router error boundary exists in `expo/app/_layout.tsx` with retry UI and message-only diagnostic logging.
- M10 TestFlight prep advanced:
  - `expo/eas.json` exists with internal preview and production build profiles plus an iOS submit placeholder.
  - `expo/app.json` now has explicit iOS photo-library and microphone permission copy; camera permission is blocked because current flows only launch the photo library.
  - Current app metadata/assets were audited: `Orchard`, slug `orchard`, version `1.0.0`, iOS bundle `com.orchardapp.ios`, Android package `com.orchardapp.android`, and 1024x1024 branded icon/adaptive/splash assets.
- M8/M10 release preparation advanced: `docs/beta-release-notes.md` contains draft tester instructions, beta description, and reviewer-note scaffolding with placeholders only.
- M5 discovery advanced: Supabase-mode Discover now relies on the backend discovery service/swipe table for query exclusions instead of local liked/passed ids; mock mode still uses local exclusions.
- `ProfileProvider` remains active as a compatibility facade. App routes/components no longer import `useProfile()` directly; focused read-model hooks own route/provider access.
- Supabase mode has auth/profile/photo/discovery/match/chat/read-state/Realtime paths in varying degrees.
- Mock/Fruit/demo mode remains required and should not be broken by hosted-mode work.

## Validation State

Latest code-touching checks:

- `cd expo; bun run typecheck`: passed after M5 Supabase discovery source-of-truth change.
- `cd expo; bun run lint`: passed after M5 Supabase discovery source-of-truth change.
- `git diff --check`: passed after M5 Supabase discovery source-of-truth change.
- `expo/app.json` JSON parse check passed after permission-string config.

No new human UAT was run after these checkpoints.

## Current Blockers / Human Decisions

- Forgot-password flow is wired but still needs human UAT when practical.
- Apple Developer Program, App Store Connect, and real public legal/support/account-deletion URLs are still required before TestFlight polish.
- Human decisions remain open for analytics/crash reporting, automatic Supabase DB tests on migration PRs, fixture image ingestion, feedback channel/support process, and whether mobile web/ngrok is acceptable for the first inner-circle pass before TestFlight.
- M6 Supabase-mode fixture simulated replies/photo behavior still needs a product decision before changing chat behavior further.
- Seeded/demo account creation and private credential handling remain human-owned; the repo now has only placeholder release-note scaffolding.

## Canonical Docs

- `docs/milestone-tracker.md`: single canonical milestone/checklist/UAT/blocker/human-decision source of truth.
- `docs/project-status.md`: running narrative status log.
- `docs/beta-release-notes.md`: draft tester instructions, beta description, and reviewer-note scaffolding.
- `docs/supabase-moderation-workflow.md`: interim Studio moderation workflow.
- `docs/repo-audit-and-foundation-plan.md`: provider/foundation cleanup plan.
- `docs/profile-provider-map.md`: provider responsibility map and extraction context.
- `docs/README.md`: docs index.

## Next Recommended Task

Best next non-UAT task: inspect M6 backend-first chat failure behavior and verify whether Supabase text-message failures can create misleading local sent state. Do not change local simulated replies or photo-request behavior until the M6 product decision is made.

# Current Agent State

Last updated: 2026-07-08

## Objective

Continue converting Orchard into an iOS-first Supabase-backed MVP for close-friends / inner-circle closed beta while preserving mock mode and the existing prototype UI.

## Branch And Commit

- Branch: `main`.
- Remote state: ahead of `origin/main` by 29 commits as of latest check.
- Latest checkpoint: `cb8ff54` - Add root app error boundary.
- Recent relevant checkpoints:
  - `cb8ff54` - Add root app error boundary.
  - `6b24afe` - Add repeatable full-flow UAT checklist.
  - `054679d` - Document Supabase moderation workflow.
  - `249f11e` - Restore fixture profile copy.
  - `7d66cf3` - Record privacy logging audit.
  - `84f7b98` - Extract seen match preference application.
  - `f17c7f8` - Extract local read watermark application.

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
- `ProfileProvider` remains active as a compatibility facade. App routes/components no longer import `useProfile()` directly; focused read-model hooks own route/provider access.
- Supabase mode has auth/profile/photo/discovery/match/chat/read-state/Realtime paths in varying degrees.
- Mock/Fruit/demo mode remains required and should not be broken by hosted-mode work.

## Validation State

Latest code-touching checks:

- `cd expo; bun run typecheck`: passed after root error boundary.
- `cd expo; bun run lint`: passed after root error boundary.
- `git diff --check`: passed for the UAT checklist and moderation/error-boundary doc updates.

No new human UAT was run after these checkpoints.

## Current Blockers / Human Decisions

- Forgot-password flow is wired but still needs human UAT when practical.
- Apple Developer Program, App Store Connect, and real public legal/support/account-deletion URLs are still required before TestFlight polish.
- Human decisions remain open for analytics/crash reporting, automatic Supabase DB tests on migration PRs, fixture image ingestion, feedback channel/support process, and whether mobile web/ngrok is acceptable for the first inner-circle pass before TestFlight.
- M6 Supabase-mode fixture simulated replies/photo behavior still needs a product decision before changing chat behavior further.

## Canonical Docs

- `docs/milestone-tracker.md`: single canonical milestone/checklist/UAT/blocker/human-decision source of truth.
- `docs/project-status.md`: running narrative status log.
- `docs/supabase-moderation-workflow.md`: interim Studio moderation workflow.
- `docs/repo-audit-and-foundation-plan.md`: provider/foundation cleanup plan.
- `docs/profile-provider-map.md`: provider responsibility map and extraction context.
- `docs/README.md`: docs index.

## Next Recommended Task

Best next non-UAT task: inspect M5/M6 source-of-truth gaps and choose the smallest code slice that does not require the unresolved fixture-chat product decision. Good candidates are discovery/pass-state source-of-truth cleanup or a source audit of blocked/invisible/suspended filtering that prepares hosted UAT without changing user-facing mock behavior.

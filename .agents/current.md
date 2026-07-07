# Current Agent State

Last updated: 2026-07-06

## Objective

Continue converting Orchard into an iOS-first Supabase-backed MVP for close-friends / inner-circle closed beta while preserving mock mode and the existing prototype UI.

## Branch And Commit

- Branch: `main`
- Latest pushed checkpoint: `64ebd44` - Consolidate Orchard planning docs
- Current working state: foundation Slice 1 navigation cleanup, UAT web-tunnel helper, web canonical-back follow-up, and forgot-password recovery fix are present and uncommitted.

## Canonical Docs

- `docs/milestone-tracker.md`: single canonical milestone/checklist/UAT/blocker/human-decision source of truth for closed beta.
- `docs/repo-audit-and-foundation-plan.md`: active engineering plan for Option 3 foundation cleanup.
- `docs/architecture-history.md`: consolidated durable audit and historical planning lineage.
- `docs/project-status.md`: running narrative status log.
- `docs/README.md`: docs index and source-of-truth map.

Old duplicate roadmap/checklist/audit docs were consolidated and deleted from active docs:

- `docs/repo-audit.md`
- `docs/20260620_project_review.md`
- `docs/20260621_repo_audit_recommendations.md`
- `docs/20260621_second_opinion_audit_v2.md`
- `docs/mvp-plan.md`
- `docs/mvp-backlog.md`
- `docs/mvp-prototype-gap-assessment.md`
- `docs/mobile-release-checklist.md`
- `docs/safety-and-privacy-checklist.md`

## Current Product / Technical State

- Current milestone: M4 - Supabase source-of-truth app session.
- Hosted `orchard-dev` is aligned through migration `202607040004`.
- Supabase mode has auth/profile/photo/discovery/match/chat/read-state/Realtime paths in varying degrees.
- Mock/Fruit/demo mode remains required.
- `ProfileProvider` remains active and too broad; the accepted direction is staged extraction with a compatibility facade, not one-pass deletion.
- Foundation Slice 1 has removed Match Detail web history/hash workarounds, preserves native Android `BackHandler`, and uses focused web browser-back replacement in the shared canonical-back hook.
- Focused UAT now passes for Android Chat, desktop Chat, desktop Match Detail, and Android Match Detail back navigation. Android Match Detail still shows a brief app-background loader during early repeated backs, then stops after warmup; monitor but do not treat as blocking unless it becomes multi-second, frequent after warmup, or loses rows/highlight state.
- Forgot-password was reported broken by a real/dev tester because the sign-in screen only had a placeholder alert. It now sends a Supabase reset email, detects recovery callbacks, and lets the user set a new password in app.

## Validation State

Latest known code-validation state before docs consolidation:

- `bun run typecheck`: passed.
- `bun run lint`: passed.
- Local Supabase DB reset/test passed for latest schema set: 1 file / 45 tests.

Docs consolidation validation:

- `git diff --check`: passed.
- Deleted-doc reference scan found only intentional entries in consolidated/deleted-doc lists and architecture history.
- Runtime code was not changed; changed files are docs, README, and `.agents` only.

Foundation Slice 1 validation:

- `cd expo; bun run typecheck`: passed.
- `cd expo; bun run lint`: passed.
- `git diff --check`: passed.
- Human UAT: Android Chat pass, desktop Chat pass, desktop Match Detail pass, Android Match Detail pass with residual brief app-background loader.
- Forgot-password fix validation: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, `git diff --check` passed.

## Current Docs-Only Changes

- Rewrote `docs/milestone-tracker.md` as the canonical closed-beta roadmap/checklist/feedback-loop doc.
- Rewrote `docs/repo-audit-and-foundation-plan.md` to make Option 3 PR-sized and safe.
- Added `docs/architecture-history.md`.
- Added `docs/README.md`.
- Updated README/setup/backend/schema/hardening/Codex/provider-map/status docs to point to the canonical docs and remove stale current-state claims.
- Deleted obsolete duplicate planning/checklist/audit docs listed above.

## Next Recommended Task

Human UAT forgot-password on hosted Supabase/ngrok, then move to foundation Slice 2: update/freeze the `ProfileProvider` facade contract and responsibility inventory. Keep the Android Match Detail loader as a monitored follow-up, not a blocker unless it worsens.

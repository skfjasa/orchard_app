# Architecture Audit History

Last updated: 2026-07-06

This document preserves useful lineage from earlier Orchard audits without making those older docs the active execution plan.

Current active plan:

- [Repo Audit & Foundation Refactor Plan](repo-audit-and-foundation-plan.md)
- [Closed-Beta Milestone Tracker](milestone-tracker.md)

## Why This Exists

Several older audits correctly identified that `ProfileProvider` was becoming too large and that Orchard needed stronger service boundaries, backend source-of-truth behavior, and safer local persistence. Some implementation details in those audits are now stale because the repo has advanced: Supabase adapters, Realtime, read-state persistence, protected-route bootstrap gates, and hosted UAT flows now exist.

Keep old audits for historical reasoning. Use the July 2026 plan for execution.

## Audit Lineage

### Former `docs/repo-audit.md`

Date: 2026-06-19.

Useful historical context:

- Establishes the original prototype baseline.
- Documents the initial local/mock-only state.
- Lists early TestFlight blockers.

Superseded areas:

- Auth, profile persistence, profile photo storage, safety surfaces, CI, and Supabase foundation have advanced substantially since this audit.

### Former `docs/20260620_project_review.md`

Date: 2026-06-20.

Useful historical context:

- Confirms the core product wedge: structured relationship-context matching for poly/ENM users.
- Identifies service boundaries and the capabilities-driven `createAppServices` factory as the right migration path.
- Identifies `ProfileProvider` bloat before it became the current foundation issue.
- Calls out couple-profile schema mismatch, which led to `profile_members` and member-scoped profile photo metadata.

Superseded areas:

- Couple-profile schema mismatch has been addressed in migrations and app profile persistence.
- Provider line count and current backend state are stale.
- CI, hosted Supabase, auth/profile/photo wiring, Realtime, read-state persistence, and several safety flows have advanced.

### Former `docs/20260621_repo_audit_recommendations.md`

Date: 2026-06-21.

Useful historical context:

- Correctly identifies the structured relationship-context product wedge.
- Recommends reducing `ProfileProvider` responsibility.
- Recommends keeping monetization disabled for early testing.
- Captures early release and compliance thinking.

Superseded areas:

- Discovery, chat, safety, Realtime, and hosted Supabase state are no longer as described.
- Timeline-style release roadmap is no longer the active project plan.
- State-management recommendations are directional only; the active plan uses PR-sized extraction with a compatibility facade.

### Former `docs/20260621_second_opinion_audit_v2.md`

Date: 2026-06-21.

Useful historical context:

- Highlights security and reliability risks that remain worth considering:
  - Avoid persisting sensitive credentials.
  - Add stronger error handling and/or app-level error boundaries.
  - Generate or synchronize Supabase TypeScript types.
  - Avoid silent local persistence failures.

Superseded areas:

- The directive to refactor `ProfileProvider` before all remaining tasks is too broad for the current repo state.
- The old line count and missing-adapter descriptions are stale.
- The current execution path is incremental provider extraction, not an immediate Zustand rewrite.

### `docs/profile-provider-map.md`

Useful historical context:

- Maps the provider's original responsibilities and extraction risks.
- Records durable non-goals: no one-pass provider rewrite, no direct Supabase calls in screens, and no mock-mode removal.

Superseded areas:

- Backend discovery, match hydration, chat text persistence, Realtime, read state, and protected bootstrap behavior have advanced since the original map.
- Use it as a responsibility inventory, not as a current-state implementation summary.

### Former `docs/mvp-plan.md`

Useful historical context:

- Defines the MVP user outcomes: account creation, structured profile, photos, discovery, reciprocal matching, active-match chat, safety flows, account deletion, feedback, and privacy-safe analytics.
- Captures the product principle that monetization, advanced ranking, video, group chat, public App Store polish, and Android production launch are deferred.

Superseded areas:

- Implementation milestones and first PR-sized tasks are stale.
- The active milestone and closed-beta source of truth is now `docs/milestone-tracker.md`.

### Former `docs/mvp-backlog.md`

Useful historical context:

- Early milestone breakdown from operating layer through Android later.
- Reinforces preserving mock mode and replacing local behavior gradually.

Superseded areas:

- Milestone statuses and task lists are stale.
- The active backlog is now embedded in `docs/milestone-tracker.md`.

### Former `docs/mvp-prototype-gap-assessment.md`

Useful historical context:

- Records original gap estimates and durable project decisions such as Orchard name, iOS bundle id, `orchard-dev`, `orchard-prod`, and placeholder legal/support URLs.

Superseded areas:

- Many listed gaps have been completed, including hosted Supabase setup, auth, profile persistence, photo storage, and safety surface wiring.
- Current gaps and blockers live in `docs/milestone-tracker.md`.

### Former `docs/mobile-release-checklist.md`

Useful historical context:

- Captures iOS/TestFlight and Android-later release concerns.

Superseded areas:

- It is no longer an active release checklist. Release tasks and blockers now live in `docs/milestone-tracker.md` M8-M11.

### Former `docs/safety-and-privacy-checklist.md`

Useful historical context:

- Captures MVP safety/privacy requirements and enforcement categories.

Superseded areas:

- It is no longer the active safety checklist. Current safety/privacy status lives in `docs/milestone-tracker.md` M7 and M9.

## Durable Decisions

- Orchard should remain iOS-first for the MVP, with Android later.
- The product wedge is structured poly/ENM relationship-context matching, not generic swiping.
- Mock/demo mode must continue to run when Supabase env vars are absent.
- Runtime behavior should move behind service boundaries before old local state is removed.
- `ProfileProvider` should shrink through staged extraction and should not be deleted until consumers are migrated.
- Supabase mode should move toward backend source-of-truth startup: profile, matches, display profiles/photos, inbox summaries, threads, read state, and safety visibility must be known before protected tabs render.
- `docs/milestone-tracker.md` is the canonical milestone/checklist/closed-beta plan.
- Monetization remains out of scope for the closed beta; safety-critical and core feedback-loop features must not be paid-only.

## Historical Items Not Active As Instructions

- One-pass deletion of `expo/providers/profile-provider.tsx`.
- Duplicating Supabase session state into a separate Zustand auth store while `AuthProvider` remains active.
- Treating local `likedIds` as the long-term Supabase active-match source of truth.
- Replacing every screen's `useProfile()` dependency in one pass.
- Using manual browser hash sentinels as the preferred Match Detail back-navigation model.

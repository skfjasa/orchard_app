# Session: Docs Consolidation

Date: 2026-07-06

## Goal

Consolidate Orchard planning, audit, checklist, and handoff docs so future work has one canonical closed-beta milestone source of truth and one durable architecture/audit lineage doc.

## Completed

- Made `docs/milestone-tracker.md` the canonical closed-beta roadmap, milestone checklist, UAT loop, blocker register, and human-decision tracker.
- Added `docs/README.md` as the docs index.
- Added `docs/architecture-history.md` as the durable audit/history lineage doc.
- Rewrote `docs/repo-audit-and-foundation-plan.md` as the active Option 3 foundation plan:
  - PR-sized slices.
  - `ProfileProvider` stays as a compatibility facade.
  - No one-pass provider deletion.
  - No duplicate Zustand auth store while `AuthProvider` owns Supabase session state.
  - Slice 1 is Match Detail web navigation cleanup.
- Updated supporting reference docs:
  - `README.md`
  - `AGENTS.md`
  - `docs/backend-migration-plan.md`
  - `docs/codex-operating-guide.md`
  - `docs/profile-provider-map.md`
  - `docs/project-status.md`
  - `docs/setup.md`
  - `docs/supabase-hardening-plan.md`
  - `docs/supabase-schema.md`
- Deleted stale duplicate roadmap/checklist/audit/handoff docs after consolidating durable content:
  - `docs/repo-audit.md`
  - `docs/20260620_project_review.md`
  - `docs/20260621_repo_audit_recommendations.md`
  - `docs/20260621_second_opinion_audit_v2.md`
  - `docs/mvp-plan.md`
  - `docs/mvp-backlog.md`
  - `docs/mvp-prototype-gap-assessment.md`
  - `docs/mobile-release-checklist.md`
  - `docs/safety-and-privacy-checklist.md`
  - `docs/session-handoff.md`
- Compacted `.agents/current.md` and `.agents/next.md`.
- Updated `.agents/handoff.md` to stop referencing deleted `docs/session-handoff.md`.

## Verification

- `git diff --check`: passed.
- Deleted-doc reference scan: only intentional entries remain in `docs/README.md`, `docs/architecture-history.md`, and `.agents/current.md` deleted/consolidated lists.
- Runtime code was not changed.

## Current Git State Before Commit

- Branch: `main`.
- Latest commit before this docs checkpoint: `6dda28a` - Stabilize Supabase session bootstrap.
- Working tree contains docs-only consolidation changes.

## Next Recommended Task

Implement foundation Slice 1 from `docs/repo-audit-and-foundation-plan.md`:

1. Remove web `popstate` behavior/options from `expo/hooks/use-canonical-back.ts`.
2. Remove `window.history.pushState` / hash sentinel from `expo/app/(tabs)/matches.tsx`.
3. Remove web-specific `useCanonicalBack` options from `expo/app/match/[id].tsx`.
4. Run `cd expo; bun run typecheck`, `cd expo; bun run lint`, and `git diff --check`.
5. Run targeted desktop Chrome and Android Chrome UAT from `docs/milestone-tracker.md`.

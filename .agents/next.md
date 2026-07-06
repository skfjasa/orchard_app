# Next Task

Implement foundation Slice 1 from `docs/repo-audit-and-foundation-plan.md`: web navigation cleanup for Match Detail, without changing runtime data/bootstrap behavior.

## Canonical Startup Context

Read these first:

- `AGENTS.md`
- `.agents/current.md`
- `.agents/next.md`
- `docs/milestone-tracker.md`
- `docs/repo-audit-and-foundation-plan.md`
- `docs/README.md`

Read only if needed:

- `docs/project-status.md`
- `docs/architecture-history.md`
- `docs/supabase-schema.md`
- `docs/backend-migration-plan.md`

## Scope

- `expo/hooks/use-canonical-back.ts`: remove web `popstate` behavior and web options; keep Android `BackHandler`.
- `expo/app/(tabs)/matches.tsx`: remove `window.history.pushState` / hash sentinel before opening Match Detail.
- `expo/app/match/[id].tsx`: remove web-specific `useCanonicalBack` options.

## Do Not Change In This Slice

- Do not change auth callback URL handling in `AuthProvider`.
- Do not change protected-route bootstrap behavior.
- Do not change backend match/thread/profile hydration logic.
- Do not begin Zustand/React Query provider extraction yet.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- Targeted desktop Chrome and Android Chrome UAT from `docs/milestone-tracker.md`.

## Follow-Up After Slice 1

If UAT passes, update `docs/milestone-tracker.md`, `docs/project-status.md`, `.agents/current.md`, and `.agents/next.md` to mark the navigation cleanup accepted and move to foundation Slice 2.

If UAT fails, capture the exact route sequence, URLs before/after back, whether rows disappear or return by themselves, whether the opened match highlight stays cleared, and any visible instrumentation logs.

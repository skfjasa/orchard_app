# Next Task

Run targeted UAT for foundation Slice 1 from `docs/repo-audit-and-foundation-plan.md`.

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

## Implemented Scope

- `expo/hooks/use-canonical-back.ts`: removed web `popstate` behavior and web options; kept Android `BackHandler`.
- `expo/app/(tabs)/matches.tsx`: removed `window.history.pushState` / hash sentinel before opening Match Detail.
- `expo/app/match/[id].tsx`: removed web-specific `useCanonicalBack` options.

## Validation

- `cd expo; bun run typecheck`: passed.
- `cd expo; bun run lint`: passed.
- `git diff --check`: passed.
- Targeted desktop Chrome and Android Chrome UAT from `docs/milestone-tracker.md`.

## Follow-Up After Slice 1

If UAT passes, update `docs/milestone-tracker.md`, `docs/project-status.md`, `.agents/current.md`, and `.agents/next.md` to mark the navigation cleanup accepted and move to foundation Slice 2.

If UAT fails, capture the exact route sequence, URLs before/after back, whether rows disappear or return by themselves, whether the opened match highlight stays cleared, and any visible instrumentation logs.

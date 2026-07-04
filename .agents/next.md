# Next Task

Choose and start the next project track now that the active UAT list is banked.

## Likely Areas

- `docs/project-status.md`
- `docs/backend-migration-plan.md`
- `docs/supabase-hardening-plan.md`
- `expo/providers/profile-provider.tsx`
- `expo/services/`
- `.github/workflows/`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Pick whether the next slice is human setup, backend/source-of-truth hardening, or service-boundary cleanup.
- Re-read the relevant plan doc only for the chosen slice.

## Definition Of Done

- The next task is scoped to one PR-sized slice.
- Mock mode and hosted Supabase mode remain intact.
- `docs/project-status.md` remains current after any material change.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

1. Human setup track: create Apple Developer Program account, then prepare iOS/TestFlight prerequisites.
2. Backend track: continue moving discovery/matches/inbox/chat toward Supabase as the source of truth, including Realtime or tighter refresh behavior.
3. Fixture/media track: decide whether to ingest fixture profile images into Supabase Storage for backend-backed discovery.
4. CI track: decide whether to make Supabase DB tests automatic for migration pull requests and address the GitHub Actions Node warning.

# Next Task

Choose the next backend/source-of-truth hardening slice or move to human setup.

## Likely Areas

- `docs/project-status.md`
- `expo/providers/profile-provider.tsx`
- `expo/services/`
- `expo/app/(tabs)/matches.tsx`
- `expo/app/(tabs)/inbox.tsx`
- `expo/app/chat/[id].tsx`
- `.github/workflows/`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Pick a single PR-sized slice.
- Re-read the relevant plan doc only for the chosen slice.

## Definition Of Done

- The next slice is scoped and validated.
- Mock mode and hosted Supabase mode remain intact.
- `docs/project-status.md` remains current after any material change.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

1. Backend track: continue moving chat/read state, message attachments, or screen data reads behind services.
2. Human setup track: create Apple Developer Program account, then prepare iOS/TestFlight prerequisites.
3. Fixture/media track: decide whether to ingest fixture profile images into Supabase Storage.
4. CI track: decide whether to make Supabase DB tests automatic for migration pull requests and address the GitHub Actions Node warning.

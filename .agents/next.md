# Next Task

Continue backend source-of-truth cleanup for match, inbox, and profile-detail read paths.

## Likely Areas

- `expo/providers/profile-provider.tsx`
- `expo/services/`
- `expo/app/(tabs)/matches.tsx`
- `expo/app/(tabs)/inbox.tsx`
- `expo/app/match/[id].tsx`
- `expo/app/chat/[id].tsx`
- `docs/project-status.md`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Read the relevant service interfaces before changing screen/provider behavior.
- Keep mock mode behavior unchanged.

## Definition Of Done

- The selected read path uses an existing or narrowly extended service boundary.
- Supabase mode keeps hosted match/profile/message state as the source of truth where supported.
- Mock mode and local fixture behavior still work.
- `docs/project-status.md` remains current after any material change.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

Use `t`, `tt`, and/or `test2` against hosted Supabase mode after the next implementation slice is selected.

# Next Task

UAT the Realtime-triggered match/message refresh slice.

## Likely Areas

- `docs/project-status.md`
- `expo/providers/profile-provider.tsx`
- `expo/services/realtime-service.ts`
- `expo/services/supabase-realtime-service.ts`
- `expo/mocks/adapters/mock-realtime-service.ts`
- `supabase/migrations/202607040003_enable_match_message_realtime.sql`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Confirm local typecheck/lint/diff check still pass.
- Confirm local `supabase db reset` and `supabase test db` pass after the migration.
- Confirm hosted `orchard-dev` remains aligned through `202607040003` if needed.

## Definition Of Done

- Incoming hosted matches/messages trigger Matches/Inbox refresh through Realtime without needing a swipe or waiting for the 10-second fallback.
- Existing 10-second polling and app-active refresh remain as fallback behavior.
- Mock mode remains intact through the no-op realtime adapter.
- `docs/project-status.md` remains current after any material change.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

1. Sign in as `t`; keep Matches/Inbox visible.
2. In another tab/session, sign in as `tt` or `test2` and create/send a reciprocal match/message involving `t`.
3. Confirm `t` sees the new match/message update promptly without making a swipe and without waiting for the polling fallback.
4. Repeat from the other profile direction if practical.

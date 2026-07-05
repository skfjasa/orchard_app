# Next Task

UAT backend-backed read state.

## Likely Areas

- `docs/project-status.md`
- `expo/providers/profile-provider.tsx`
- `expo/services/`
- `expo/app/(tabs)/inbox.tsx`
- `expo/app/chat/[id].tsx`
- `expo/services/supabase-chat-service.ts`
- `supabase/migrations/202607040004_match_read_states.sql`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Confirm hosted `orchard-dev` remains aligned through `202607040004` if needed.
- Use the existing dev profiles `t`, `tt`, and/or `test2`.

## Definition Of Done

- Reading a hosted incoming message writes hosted read state.
- After sign-out/sign-in, the read conversation stays read until a newer incoming message arrives.
- Another incoming message increments Inbox unread again.
- Mock mode and hosted Supabase mode remain intact.
- `docs/project-status.md` remains current after any material change.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

1. Sign in as `t`.
2. From `tt` or `test2`, send `t` a hosted message.
3. As `t`, open the Inbox conversation and confirm the unread badge clears.
4. Sign out as `t`, then sign back in as `t`; confirm the conversation is still read.
5. Send a newer message from `tt` or `test2`; confirm `t` gets a new unread badge/highlight.

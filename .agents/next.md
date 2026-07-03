# Next Task

Debug hosted backend-backed active match resolution for chat persistence.

## Likely Areas

- `expo/providers/profile-provider.tsx`
- `expo/services/supabase-chat-service.ts`
- `expo/services/supabase-match-service.ts`
- `expo/services/supabase-swipe-service.ts`
- `expo/constants/mock-profile-ids.ts`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Reproduce or reason from hosted UAT result: no `public.messages` row and no fresh hosted `matches` timestamp.
- Confirm whether the browser session's conversation profile id maps to a hosted fixture UUID and active match.

## Definition Of Done

- Root cause is identified.
- If code changes are needed, they preserve local/mock UI behavior.
- Hosted text send either writes a row to `public.messages` or the remaining blocker is documented precisely.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- Supabase SQL check for a unique sent test message when manual UAT is available.

## Manual QA

Send a unique text message in a backend-backed active match and query hosted `public.messages` for that body.

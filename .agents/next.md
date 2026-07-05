# Next Task

Smoke UAT the device/browser back-history guard.

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
- Use hosted Supabase mode with `t`, `tt`, and/or `test2`.

## Definition Of Done

- Device/browser back does not reveal tabs, chat, or match detail while auth/profile hydration is incomplete.
- Matches list still shows active matches after using back.
- Inbox list still shows conversations, unread row highlights, and unread tab badge counts after using back.
- Match detail and chat still open only when a profile and active match are loaded.
- Mock mode and local fixture behavior still work.
- `docs/project-status.md` remains current after any material change.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

1. Sign in as one of `t`, `tt`, or `test2`.
2. Navigate through Matches, match detail, chat, Inbox, and profile detail from the Inbox avatar area.
3. Use the device/browser back button several times from chat, match detail, and tabs.
4. Confirm Matches and Inbox do not briefly render empty/missing state for a signed-in profile.
5. Confirm tab badges and unread row highlights remain consistent after back navigation settles.

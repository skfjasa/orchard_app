# Next Task

Smoke UAT the read-path selector cleanup.

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

- Matches list still shows active matches.
- Match tab badge and highlighted new match behavior still work.
- Inbox list still shows conversations, unread row highlights, and unread tab badge counts.
- Match detail still opens from Matches and Inbox avatar/profile area.
- Chat still opens only for active matches and can send/read messages.
- Mock mode and local fixture behavior still work.
- `docs/project-status.md` remains current after any material change.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

1. Sign in as one of `t`, `tt`, or `test2`.
2. Check Match and Inbox tab badge counts.
3. Open Matches, tap a matched profile, and confirm profile detail opens.
4. From profile detail, open chat and send a message.
5. Return to Inbox, open the matched profile from the avatar area, then open chat from the row body.
6. Confirm unread state still clears after opening the conversation.

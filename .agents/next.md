# Next Task

Smoke UAT badge stability while Realtime/10-second refreshes are active.

## Likely Areas

- `expo/providers/profile-provider.tsx`
- `expo/services/`
- `expo/app/(tabs)/matches.tsx`
- `expo/app/(tabs)/inbox.tsx`
- `expo/components/navigation/ProtectedRoute.tsx`
- `expo/hooks/use-canonical-back.ts`
- `expo/providers/profile-provider.tsx`
- `expo/app/match/[id].tsx`
- `expo/app/chat/[id].tsx`
- `expo/app/edit-profile.tsx`
- `expo/app/paywall.tsx`
- `expo/app/report.tsx`
- `expo/app/safety-legal.tsx`
- `docs/project-status.md`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Use hosted Supabase mode with `t`, `tt`, and/or `test2`.

## Definition Of Done

- Device/browser back does not reveal protected app routes while auth/profile hydration is incomplete.
- Android hardware back from Chat returns to Inbox, matching the in-app chat back button.
- Cleared Match badges do not reappear after backend refresh unless there is a genuinely new match.
- Cleared Inbox badges/unread rows do not reappear after backend refresh unless there is a genuinely new unread incoming message.
- Matches list still shows active matches after using back.
- Inbox list still shows conversations, unread row highlights, and unread tab badge counts after using back.
- Match detail and chat still open only when a profile and active match are loaded.
- Edit Profile, Paywall, Report, and Safety & Legal do not render signed-in-only content when profile state is missing.
- Mock mode and local fixture behavior still work.
- `docs/project-status.md` remains current after any material change.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

1. Sign in as one of `t`, `tt`, or `test2`.
2. Clear any Match badge by opening each highlighted new match detail.
3. Clear any Inbox badge by opening unread conversations.
4. Navigate across tabs and use browser/device back several times.
5. Wait at least 10 seconds without sending or receiving a new match/message.
6. Confirm cleared Match and Inbox badges do not reappear.
7. Send a genuinely new message from another dev profile and confirm the Inbox badge appears once for that new message.

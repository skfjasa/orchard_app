# Next Task

Smoke UAT device/browser back from match detail and chat.

## Likely Areas

- `expo/providers/profile-provider.tsx`
- `expo/services/`
- `expo/app/(tabs)/matches.tsx`
- `expo/app/(tabs)/inbox.tsx`
- `expo/app/(tabs)/fruit.tsx`
- `expo/app/(tabs)/discover.tsx`
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
- Real/dev profiles that are already matched do not appear in Fruit.
- Opening an unread Inbox row clears the badge before Chat navigation, so rapid device/browser back does not flash the old unread state.
- Real/dev matches remain visible after using device/browser back from match detail.
- Generic "Orchard user" fallback profiles do not appear in Matches or Inbox after rapid back navigation.
- Match detail opened from Matches, Inbox, Discover, Fruit, or Chat has a canonical Android hardware-back destination and does not snap back onto the same detail modal.
- Matches and Inbox refresh backend match/profile data on focus, so Fruit/Discover should not be required to restore missing real/dev cards.
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
2. From Matches, open a real/dev profile detail and use device/browser back repeatedly.
3. Confirm Matches still shows real/dev matches, not only fixture matches.
4. Confirm Matches does not show a generic "Orchard user" card.
5. Confirm the profile detail does not animate back then land on itself.
6. From Inbox, open a conversation and use device/browser back repeatedly.
7. Confirm Inbox still shows real/dev conversations, not a generic "Orchard user" row, and badges remain consistent.
8. Confirm already matched real/dev profiles do not appear in Fruit.
9. Wait at least 10 seconds without sending or receiving a new match/message and confirm cleared badges do not reappear.

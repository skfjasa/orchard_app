# Next Task

Retest real non-fixture Supabase match badge and profile-detail entry points, then address the `/onboarding` background sizing regression.

## Likely Areas

- `expo/app/onboarding/photos.tsx`
- `expo/app/onboarding/pending-confirmation.tsx`
- `expo/app/onboarding/sign-in.tsx`
- `expo/providers/auth-provider.tsx`
- `expo/providers/profile-provider.tsx`
- `expo/services/supabase-profile-service.ts`
- `expo/services/supabase-storage-service.ts`
- `expo/services/supabase-discovery-service.ts`
- `expo/services/supabase-match-service.ts`
- `supabase/migrations/202607040001_profile_photo_visible_storage_reads.sql`
- `supabase/tests/database/202606200001_mvp_security.sql`
- `expo/app/match/[id].tsx`
- `expo/app/chat/[id].tsx`
- `expo/app/(tabs)/_layout.tsx`
- `expo/app/(tabs)/matches.tsx`
- `expo/app/(tabs)/inbox.tsx`
- `expo/app/(tabs)/discover.tsx`
- `expo/app/chat/[id].tsx`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Confirm the current real-profile UAT fix slice is committed after validation.
- Start `bun run start-web` from `expo/` if the preview is not already running.
- Use two or three hosted non-fixture Supabase profiles with clean enough swipe state to create a fresh match/message.

## Definition Of Done

- Hosted real-user discovery displays at least one non-fixture backend profile with expected name, relationship context, and signed stored photo.
- Stale local-only matches/conversations from previous UAT are pruned after fresh Supabase sign-in/hydration when no hosted active match exists.
- A one-sided like of a real non-fixture profile records the swipe but does not show a match modal, does not create local Matches/Inbox rows, and does not allow chat.
- A reciprocal real-profile like creates a backend active match; Matches, Inbox, and Chat resolve the backend profile after sign-out/sign-in.
- A new reciprocal match shows a badge on the Matches tab until that matched profile's detail screen is viewed; multiple new matches decrement one at a time.
- Received backend messages show an Inbox tab badge equal to the total unread message count, plus per-row unread highlight/count until each conversation is opened/read.
- Matched profile detail is reachable from Matches cards, Inbox avatar, and Chat header avatar/name.
- `/onboarding` background sizing is restored to cover the full viewing space.
- If code changes are needed, mock mode and existing prototype UI behavior remain intact.
- Backend profile/photo rows and storage object behavior are verified where possible.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

For backend profile discovery/display smoke:

1. Create a fresh reciprocal match between two hosted non-fixture profiles and verify the Matches tab badge appears.
2. Open Matches and verify the badge remains until a new matched profile is opened.
3. Tap a Matches card and verify it opens profile detail, not chat, and the badge decrements for that profile.
4. Send messages from two matched profiles; sign in as the receiver and verify the Inbox tab badge counts total unread messages and each unread row is highlighted with its own count.
5. Open one unread conversation and verify that row clears and the Inbox tab badge decrements by that row's unread count.
6. Open Inbox and tap the avatar to profile detail; tap the message preview area to chat.
7. In Chat, tap the avatar/name header area and verify it opens profile detail.
8. Recheck `/onboarding` at desktop and mobile widths after the background sizing fix.

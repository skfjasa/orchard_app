# Next Task

Retest the latest Fruit/read-state fixes, then address `/onboarding` background sizing.

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
- `expo/app/(tabs)/fruit.tsx`
- `expo/app/(tabs)/discover.tsx`
- `expo/app/chat/[id].tsx`
- `expo/app/match/[id].tsx`
- `expo/services/local-profile-storage.ts`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Confirm `main` is clean/synced at or after the Fruit/read-state/new-match persistence fix.
- Start `bun run start-web` from `expo/` if the preview is not already running.
- Use the existing hosted `t`, `tt`, `test2`, and `Stephon` rows when checking whether Fruit surfaces real/dev backend profiles.

## Definition Of Done

- Hosted real-user discovery displays at least one non-fixture backend profile with expected name, relationship context, and signed stored photo.
- Stale local-only matches/conversations from previous UAT are pruned after fresh Supabase sign-in/hydration when no hosted active match exists.
- A one-sided like of a real non-fixture profile records the swipe but does not show a match modal, does not create local Matches/Inbox rows, and does not allow chat.
- A reciprocal real-profile like creates a backend active match; Matches, Inbox, and Chat resolve the backend profile after sign-out/sign-in.
- A new reciprocal match shows a badge on the Matches tab and a highlighted card in Matches until that matched profile's detail screen is viewed; multiple new matches decrement one at a time.
- Received backend messages show an Inbox tab badge equal to the total unread message count, plus per-row unread highlight/count until each conversation is opened/read.
- New hosted matches/messages hydrate after sign-in or within the refresh interval without requiring a swipe or other user action.
- Fruit tab includes real/dev backend profiles and static Fruit fixtures, including backend profiles already swiped in prior UAT.
- Fruit fixture likes auto-match for testing and immediately add one Matches tab badge count plus a highlighted new-match card.
- One-sided Fruit/profile-detail likes use in-app UI, not browser alerts.
- Read Inbox messages stay read after sign-out/sign-in until newer messages arrive, and fixture replies received while the conversation is open do not leave the Inbox badge stuck.
- Opened new-match highlights stay cleared after sign-out/sign-in.
- Fixture/mock profiles still send local simulated replies after user response.
- Matched profile detail is reachable from Matches cards, Inbox avatar, and Chat header avatar/name.
- `/onboarding` background sizing is restored to cover the full viewing space.
- If code changes are needed, mock mode and existing prototype UI behavior remain intact.
- Backend profile/photo rows and storage object behavior are verified where possible.
- If the existing three-way rows still do not appear after browser refresh/sign-in, inspect app console logs for backend match/thread hydration failures, especially `session_mismatch`.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

For backend profile discovery/display smoke:

1. Open Fruit and verify static Fruit fixtures plus real/dev backend profiles can appear.
2. Tap a Fruit fixture heart and verify an in-app match overlay appears, the Matches tab badge increases by one, and the new match card is highlighted.
3. Open that highlighted Fruit fixture match, then verify the Matches badge decreases by one and the highlight clears.
4. Send a message in a fixture conversation and stay in that chat until the fake reply appears; verify the Inbox badge does not stay increased for that open conversation.
5. Tap a real/dev Fruit heart for a one-sided like and verify an in-app "Like sent" overlay appears.
6. Read an unread real backend conversation, sign out, sign back in, and verify it stays read unless a newer message arrived.
7. Open a highlighted new real match profile, sign out, sign back in, and verify that match stays unhighlighted.
8. Sign in as `t`, send messages to `tt` and `test2`, sign out, then sign in as `tt` and `test2` and verify Matches/Inbox hydrate without making a swipe.
9. Recheck `/onboarding` at desktop and mobile widths after the background sizing fix.

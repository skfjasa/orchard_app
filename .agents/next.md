# Next Task

Browser-test arbitrary real-user backend discovery/profile display with at least two hosted non-fixture profiles. If that cannot be tested yet, continue the next backend source-of-truth slice for chat reads/inbox and message attachments.

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
- `expo/app/match/[id].tsx`
- `expo/app/(tabs)/matches.tsx`
- `expo/app/(tabs)/inbox.tsx`
- `expo/app/(tabs)/discover.tsx`
- `expo/app/chat/[id].tsx`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Confirm the current working slice is committed after validation.
- Start `bun run start-web` from `expo/` if the preview is not already running.
- Use two hosted non-fixture Supabase profiles, or create a second one through onboarding if needed.

## Definition Of Done

- Hosted real-user discovery displays at least one non-fixture backend profile with expected name, relationship context, and signed stored photo.
- Match detail, chat, matches, and inbox can resolve a remembered/backend profile instead of falling back only to `MOCK_PROFILES`.
- If code changes are needed, mock mode and existing prototype UI behavior remain intact.
- Backend profile/photo rows and storage object behavior are verified where possible.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

For backend profile discovery/display smoke:

1. Sign in as hosted profile A.
2. Confirm Discover can show hosted profile B when B is visible and eligible.
3. Open B's match detail and verify the real profile fields/photo render.
4. Like B and verify the current prototype UI behavior remains stable.
5. If A and B are reciprocal/active matched, verify Matches, Inbox, and Chat resolve B's backend profile after sign-out/sign-in.
6. Query hosted `profiles`, `profile_members`, `profile_photos`, and `matches` as needed to confirm the expected backend rows.

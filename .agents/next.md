# Next Task

Run the hosted onboarding/profile-photo confirmation smoke test, or continue backend source-of-truth work for arbitrary real-user discovery/profile display if email confirmation remains blocked.

## Likely Areas

- `expo/app/onboarding/photos.tsx`
- `expo/app/onboarding/pending-confirmation.tsx`
- `expo/app/onboarding/sign-in.tsx`
- `expo/providers/auth-provider.tsx`
- `expo/providers/profile-provider.tsx`
- `expo/services/supabase-profile-service.ts`
- `expo/services/supabase-storage-service.ts`
- `expo/services/supabase-discovery-service.ts`
- `expo/app/match/[id].tsx`
- `expo/app/(tabs)/matches.tsx`
- `expo/app/(tabs)/inbox.tsx`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Verify whether Supabase email confirmation can be tested without hitting rate limits.
- If testing onboarding/photo flow, start `bun run start-web` from `expo/` and use a clean browser profile or the sign-in screen's local test reset.
- If email remains blocked, skip hosted auth UAT and implement the next backend source-of-truth slice for arbitrary real-user profile display.

## Definition Of Done

- Hosted onboarding with a selected local photo either passes end to end, or the precise external blocker is documented.
- If code changes are needed, mock mode and existing prototype UI behavior remain intact.
- Backend profile/photo rows and storage object behavior are verified where possible.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

For onboarding/photo smoke:

1. Reset local test data from the sign-in screen if needed.
2. Create or resume a Supabase account from onboarding.
3. Select a real local profile photo.
4. Confirm the email link in the same browser profile.
5. Verify the app hydrates the profile and photo after confirmation/sign-in.
6. Query hosted `profiles`, `profile_members`, `profile_photos`, and storage objects for the test profile.

# Next Task

Visually confirm onboarding welcome/sign-in polish through the local/ngrok web preview.

## Likely Areas

- `expo/app/onboarding/photos.tsx`
- `expo/app/onboarding/pending-confirmation.tsx`
- `expo/app/onboarding/sign-in.tsx`
- `expo/app/onboarding/index.tsx`
- `expo/assets/images/welcome-background.png`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Start `bun run start-web` from `expo/` if the preview is not already running.
- Reload the browser/phone preview so it picks up the latest local bundle.

## Definition Of Done

- `/onboarding` background image covers the full visible page area without blank margins.
- `/onboarding/sign-in` has no blank white header strip above "Welcome back".
- Welcome, sign-in, and pending-confirmation still use the recovered local background asset.
- The existing onboarding layout remains intact and usable at desktop and mobile widths.
- Mock mode and hosted Supabase mode remain unaffected.

## Validation

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

1. Open `/onboarding` and verify the background image fills the visible page area without blank margins.
2. Open `/onboarding/sign-in` and verify the same background behavior, with no blank white header strip above "Welcome back".
3. Open `/onboarding/pending-confirmation` if reachable and verify the same background behavior.
4. Recheck at one desktop width and one mobile width.

# Next Task

Restore `/onboarding` background sizing so the recovered background image covers the full viewing space again.

## Likely Areas

- `expo/app/onboarding/photos.tsx`
- `expo/app/onboarding/pending-confirmation.tsx`
- `expo/app/onboarding/sign-in.tsx`
- `expo/app/onboarding/index.tsx`
- `expo/assets/images/welcome-background.png`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Start `bun run start-web` from `expo/` if the preview is not already running.
- Compare welcome, sign-in, and pending-confirmation screens at desktop and mobile widths.

## Definition Of Done

- `/onboarding` background sizing is restored to cover the full viewing space.
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
2. Open `/onboarding/sign-in` and verify the same background behavior.
3. Open `/onboarding/pending-confirmation` if reachable and verify the same background behavior.
4. Recheck at one desktop width and one mobile width.

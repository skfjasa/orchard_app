# Orchard App Tactical Handoff

Last updated: 2026-06-21

## Current Goal

Continue converting the Rork-generated Orchard Expo prototype into an iOS-first Supabase-backed MVP while preserving mock mode and the existing UI.

## Current State

- Repo: `C:\Users\skfja\Projects\orchard_app`
- Branch: `main`
- Remote: `origin/main`
- Current git state at handoff: code commits are clean/synced with `origin/main`; handoff sync markdown changes are saved locally and uncommitted.
- Latest pushed commit: `1f0f211` - Track GitHub Actions Node warning
- Latest implementation commit: `0bc2ffd` - Improve auth confirmation flow and add CI checks
- App: Expo React Native / Expo Router / TypeScript under `expo/`
- Backend: hosted Supabase dev project `orchard-dev`, project ref `cvvavwuksygahezzhmqp`
- Runtime is still mixed: local/mock UI state remains primary for discovery, matches, and chat; Supabase auth, profile/member persistence, safety RPCs, gated swipe persistence, and profile photo storage exist.

## Completed This Session

- Improved hosted Supabase email-confirmation handling:
  - Auth provider explicitly handles `?code=` and hash-token confirmation callback URLs on web.
  - Confirmed users are routed through the root loader while pending profile restoration completes.
  - Pending profile hydration now stays pending until persistence actually finishes.
- Added `expo/app/onboarding/pending-confirmation.tsx` and routes Supabase-confirmation signups there after saving pending onboarding profile data locally without credentials.
- Mapped raw Supabase auth errors for email rate limits and unconfirmed email states to clearer user-facing copy.
- Hardened the welcome screen sign-in action with a direct `Pressable` and test id.
- Added a development-only `Reset local test data` control on sign-in. It signs out, clears local prototype profile state, and clears pending onboarding state.
- Added CI:
  - `.github/workflows/expo-checks.yml` runs install, typecheck, and lint on push/PR.
  - `.github/workflows/supabase-db-tests.yml` manually runs local Supabase start, database reset, and DB/RLS tests.
- Validated GitHub Actions:
  - `Expo Checks` passed on pushes for commits `0bc2ffd`, `e4695be`, and `1f0f211`.
  - Manual `Supabase DB Tests` run `27895063423` passed in 4m05s.
- Recorded the GitHub Actions Node 20 deprecation warning from `actions/checkout@v4` as a follow-up.

## Verification

- Local `bun run typecheck` from `expo/`: passed after auth/UX/CI changes.
- Local `bun run lint` from `expo/`: passed after auth/UX/CI changes.
- GitHub `Expo Checks`: passed after latest pushed commit `1f0f211`.
- GitHub manual `Supabase DB Tests`: passed, including local Supabase start/reset and `supabase test db`.
- Session close check: Orchard web preview process group was stopped.

## Active Blockers / Open Loops

- Hosted Supabase email sends are rate-limited to 2/hour; final confirmation-link smoke test is blocked until the limit clears or custom SMTP is configured.
- Need to smoke-test full hosted browser signup/onboarding/photo flow in one browser profile:
  - start from clean local test state
  - complete onboarding with a selected photo
  - receive confirmation email
  - confirm link returns to the app
  - auth callback restores session
  - pending profile/member/photo persistence completes
  - app enters signed-in state
  - Supabase has `profiles`, `profile_members`, `profile_photos`, and Storage object rows
- Supabase Auth email branding/custom templates require custom SMTP before external testers.
- Apple Developer Program account still needs to be created.
- Real public legal/support URLs remain placeholders.
- Decide whether Supabase DB tests should run automatically on `supabase/**` pull-request changes.
- Track/resolve GitHub Actions Node 20 deprecation warning when a Node-24-native checkout action is available.

## Next Recommended Action

After the Supabase email limit clears, retest the hosted confirmation flow from `http://localhost:8081` using the same browser profile for signup and email link. Use the sign-in screen's development `Reset local test data` control first if the normal browser profile has stale state.

If continuing work before that test, the best non-blocked task is safety/moderation hardening: expand DB/RLS tests for report-message, blocked discovery, blocked chat, unmatch behavior, and account deletion edge cases.

## Read First Next Session

1. `C:\Users\skfja\Projects\AGENTS.md`
2. `AGENTS.md`
3. `.agents\handoff.md`
4. `docs\project-status.md`
5. `docs\backend-migration-plan.md`
6. `docs\session-handoff.md`

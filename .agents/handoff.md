# Orchard App Tactical Handoff

Last updated: 2026-06-21

## Current Goal

Continue turning the Rork-generated Orchard Expo prototype into an iOS-first Supabase-backed MVP while preserving mock mode and the existing UI.

## Current State

- Repo: `C:\Users\skfja\Projects\orchard_app`
- Branch: `main`
- Latest pushed commit: `06f0a9c` - Refresh handoff after auth resume work
- Latest implementation commit: `19f3a05` - Resume onboarding after email confirmation
- App: Expo React Native / Expo Router / TypeScript under `expo/`
- Backend: Supabase dev project `orchard-dev`, project ref `cvvavwuksygahezzhmqp`
- Runtime is still mixed: local/mock UI state remains primary for discovery/matches/chat, while Supabase auth, profile/member persistence, safety RPCs, swipe persistence hook, and profile photo storage now exist.

## Completed This Session

- Added Supabase Storage-backed profile photo upload through `StorageService`.
- Added hosted migration `202606200002_profile_photo_storage.sql` and pushed it to `orchard-dev`.
- Verified hosted storage migration by SQL: migration recorded, private `profile-photos` bucket exists, four owner-scoped storage policies exist, and metadata unique constraint exists.
- Fixed Supabase signup redirect handling for web: app passes current origin plus `/onboarding/sign-in`, supports `EXPO_PUBLIC_AUTH_REDIRECT_URL`, and enables web session detection from confirmation URLs.
- Added pending onboarding resume path for hosted email confirmation: pending profile is stored locally without credentials and persisted after confirmation returns with a session.
- Updated browser image picker handling so web-selected photos are stored as data URIs for the pending confirmation path.

## Verification

- `bun run typecheck` from `expo/`: passed after `19f3a05`.
- `bun run lint` from `expo/`: passed after `19f3a05`.
- Earlier this session: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db` passed locally with 1 file, 25 tests after photo storage migration.
- Hosted SQL verification passed for storage migration.

## Blockers / Open Loops

- Need to restart the browser preview and smoke-test the full hosted Supabase signup confirmation flow with a real selected photo.
- User completed Supabase Auth redirect URL setup for the browser preview.
- Supabase Auth email template/branding edits require custom SMTP in Dashboard; SMTP fields are currently blank except project auth secrets.
- Hosted Supabase default email rate limits may block repeated test signups.
- Apple Developer Program account still needs to be created.
- Real public legal/support URLs are still placeholders.

## Exact Next Action

1. Restart `bun run start-web` from `expo/`.
2. Run a fresh signup/onboarding test with a selected photo.
3. Confirm the email link returns to `/onboarding/sign-in`, the pending profile persists after confirmation, and Supabase has `profiles`, `profile_members`, `profile_photos`, and Storage object rows.

## Read First Next Session

1. `AGENTS.md`
2. `.agents/handoff.md`
3. `docs/session-handoff.md`
4. `docs/project-status.md`
5. `docs/backend-migration-plan.md`

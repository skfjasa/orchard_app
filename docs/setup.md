# Development Setup

## Recommended Editor

Use Visual Studio Code or another code editor that can open the repository root.

Open:

```text
C:\Users\skfja\Projects\orchard_app
```

The actual Expo app is inside:

```text
C:\Users\skfja\Projects\orchard_app\expo
```

## Prerequisites

Install:

- Git
- Node.js
- Bun
- VS Code or equivalent editor
- Expo Go on iPhone for quick local testing

Later for TestFlight:

- Apple Developer Program access
- Expo account
- EAS CLI
- App Store Connect access

For local Supabase database/RLS tests:

- Docker Desktop
- Supabase CLI from `expo/node_modules/.bin/supabase`

Current local note: Docker Desktop was installed manually on 2026-06-20 and is operational after enabling firmware virtualization. `docker version` reports a Docker Desktop Linux engine, and local Supabase database/RLS tests pass.

To verify Docker/virtualization from PowerShell:

```powershell
Get-CimInstance Win32_Processor | Select-Object Name,VirtualizationFirmwareEnabled
Get-ComputerInfo -Property HyperVRequirement*
docker version
```

If Docker still fails after firmware virtualization is enabled, enable the required Windows features from an Administrator PowerShell and restart:

```powershell
dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
wsl --update
wsl --set-default-version 2
```

## Install Dependencies

From the Expo app folder:

```powershell
cd C:\Users\skfja\Projects\orchard_app\expo
bun install
```

## Start Development Server

Native preview:

```powershell
cd C:\Users\skfja\Projects\orchard_app\expo
bun run start
```

Web preview:

```powershell
cd C:\Users\skfja\Projects\orchard_app\expo
bun run start-web
```

Mobile web UAT through ngrok:

```powershell
cd C:\Users\skfja\Projects\orchard_app\expo
bun run uat-web-tunnel
```

This command starts Expo web on `http://localhost:8081` and starts a standalone ngrok tunnel to the same port. It intentionally uses a globally installed ngrok v3.20.0+ agent instead of Expo's bundled `@expo/ngrok` v2 agent, which current ngrok free accounts may reject. If needed, install or update ngrok first:

```powershell
winget install --id Ngrok.Ngrok -e
ngrok config add-authtoken "<YOUR_AUTHTOKEN>"
```

iOS simulator, if available:

```powershell
cd C:\Users\skfja\Projects\orchard_app\expo
bun run start -- --ios
```

Android emulator, later:

```powershell
cd C:\Users\skfja\Projects\orchard_app\expo
bun run start -- --android
```

## Git Workflow

Check status:

```powershell
cd C:\Users\skfja\Projects\orchard_app
git status --short --branch
```

Create a small working branch:

```powershell
git switch -c chore/dev-foundation
```

Keep changes PR-sized. Good first branches:

- `docs/setup-and-audit`
- `chore/env-example`
- `chore/supabase-client-skeleton`
- `feat/auth-session-provider`
- `feat/profile-storage-adapter`

## Current App Mode

The app still supports mock/demo mode when Supabase environment variables are absent. Supabase mode now includes real auth, profile/member persistence, profile photo storage, backend discovery/display support, swipe/match service paths, backend text-message persistence/hydration, Realtime/polling refresh, and backend-backed read state.

Some behavior is still local or prototype-oriented:

- Mock/Fruit fixture behavior remains intentionally available for demo/testing.
- Local simulated replies and photo-request behavior still exist.
- Some Supabase actions are still being moved from local-first behavior to backend-first/source-of-truth behavior.
- Monetization remains disabled for the feedback MVP.

Current milestone and next tasks live in `docs/milestone-tracker.md`.

## Expected Environment Variables

Create a future `.env` from `.env.example` once it exists.

Expected variables:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_AUTH_REDIRECT_URL=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=
EXPO_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://yourdomain.com/privacy
EXPO_PUBLIC_TERMS_URL=https://yourdomain.com/terms
EXPO_PUBLIC_COMMUNITY_STANDARDS_URL=https://yourdomain.com/community
EXPO_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
EXPO_PUBLIC_SUPPORT_URL=https://yourdomain.com/support
EXPO_PUBLIC_ACCOUNT_DELETION_URL=https://yourdomain.com/delete
```

Rules:

- Do not commit real secrets.
- `EXPO_PUBLIC_*` variables are bundled into the client and must not contain service-role keys.
- Analytics and Sentry should be optional.
- If Supabase variables are missing, the app should run in mock mode.

Supabase hosted auth setup:

- Add the local/web preview URL to the Supabase Auth redirect allow-list before browser sign-up testing. For local web this may be `http://localhost:8081`; for Expo tunnel testing use the current tunnel origin.
- `EXPO_PUBLIC_AUTH_REDIRECT_URL` can pin a redirect URL when the dynamic browser origin should not be used. Leave it blank to use the current web origin on web and the Expo app link on native.
- Supabase-hosted auth email template edits require custom SMTP configuration in the Dashboard. Until SMTP is configured, confirmation emails may use default Supabase Auth branding.
- For external testing, configure custom SMTP, set an Orchard sender name/from address, then update the confirm-signup email template.

## Useful Files

- `expo/package.json`: scripts and dependencies
- `supabase/config.toml`: local Supabase config
- `supabase/migrations/202606190001_initial_mvp_schema.sql`: hardened MVP schema/RLS/RPC migration draft
- `supabase/tests/database/202606200001_mvp_security.sql`: initial database/RLS tests, passing locally
- `expo/app.json`: Expo app config
- `expo/app/_layout.tsx`: root navigation/providers
- `expo/providers/profile-provider.tsx`: current local app state
- `expo/providers/onboarding-provider.tsx`: onboarding draft state
- `expo/mocks/profiles.ts`: mock discovery profiles
- `expo/types/index.ts`: current domain types
- `expo/utils/match.ts`: local match scoring

## iOS TestFlight Notes

Before TestFlight, add or verify:

- `eas.json`
- Production bundle identifier
- App version and build number
- iOS permission strings
- Privacy policy URL
- Terms URL
- Account deletion/support URL
- Report/block/unmatch/account deletion flows
- Real backend auth and persistence
- Demo account or seeded beta data

Expected commands later:

```powershell
cd C:\Users\skfja\Projects\orchard_app\expo
bunx eas build:configure
bunx eas build --platform ios
bunx eas submit --platform ios
```

## Development Priorities

Use `docs/milestone-tracker.md` for the canonical milestone/checklist view and `docs/repo-audit-and-foundation-plan.md` for the current foundation-refactor execution plan. Do not maintain separate backlog lists in setup docs.

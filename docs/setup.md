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

The current app runs in local prototype mode:

- Profile data is stored in AsyncStorage.
- Discovery profiles come from local mocks.
- Matches are created locally.
- Chat is local and includes fake replies.
- Paywall behavior is simulated.

Future work should add Supabase-backed behavior while keeping mock mode available when Supabase environment variables are absent.

## Expected Environment Variables

Create a future `.env` from `.env.example` once it exists.

Expected variables:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=
EXPO_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

Rules:

- Do not commit real secrets.
- `EXPO_PUBLIC_*` variables are bundled into the client and must not contain service-role keys.
- Analytics and Sentry should be optional.
- If Supabase variables are missing, the app should run in mock mode.

## Useful Files

- `rork.json`: Rork app metadata
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

Start with foundation and docs before replacing app behavior:

1. `.env.example`
2. Typed environment/mock-mode helper
3. Supabase client skeleton
4. Data adapter interface
5. Auth/session provider
6. Profile persistence
7. Photo upload
8. Discovery/swipes/matches
9. Chat
10. Safety/account deletion

# Repo Audit

Audit date: 2026-06-19

## Summary

This repository contains an Expo React Native dating app prototype named Orchard. The Git repo root is `orchard_app`, and the actual mobile app lives in `expo/`.

The app is currently suitable as a prototype/demo, not yet as a functional MVP. Core product behavior is local or mocked: profile persistence, auth, discovery, swipes, matches, chat, purchases, and subscriptions all run without a backend.

## Git And Remote

The repository is connected to GitHub:

```text
origin https://github.com/skfjasa/orchard_app.git
```

At the time of audit, local `main` matched `origin/main` at:

```text
4f811c5 Fixed a problem that prevented the app from opening in the tester.
```

## Framework And Runtime

The app is an Expo React Native app using Expo Router.

Key files:

- Legacy generator metadata has been removed.
- `expo/package.json`
- `expo/app.json`
- `expo/app/_layout.tsx`

Core stack:

- Expo `~54.0.27`
- React Native `0.81.5`
- React `19.1.0`
- Expo Router `~6.0.17`
- TypeScript strict mode
- React Query
- AsyncStorage
- Bun

## Package Manager

The package manager is Bun. A `bun.lock` file exists in `expo/`.

Install command:

```powershell
cd expo
bun install
```

## Entrypoint And Routing

The app entrypoint is:

```json
"main": "expo-router/entry"
```

Routing is file-based under `expo/app`.

Important routes:

- `app/_layout.tsx`: root providers and stack routes
- `app/index.tsx`: redirects based on local profile state
- `app/onboarding/*`: onboarding flow
- `app/(tabs)/_layout.tsx`: tab navigation
- `app/(tabs)/discover.tsx`: swipe discovery
- `app/(tabs)/fruit.tsx`: trending profiles
- `app/(tabs)/matches.tsx`: match grid
- `app/(tabs)/inbox.tsx`: conversation list
- `app/(tabs)/profile.tsx`: profile/account surface
- `app/match/[id].tsx`: profile detail modal
- `app/chat/[id].tsx`: chat screen
- `app/paywall.tsx`: simulated purchase/subscription screen
- `app/edit-profile.tsx`: profile editor

Root providers include:

- `QueryClientProvider`
- `SafeAreaProvider`
- `ProfileProvider`
- `GestureHandlerRootView`

## Existing Screens And Components

Main screens:

- Welcome
- Sign in
- Onboarding account type
- Onboarding basics
- Onboarding identity
- Onboarding interests/prompts
- Onboarding preferences/polyamory style
- Onboarding photos/bio/socials
- Discover swipe deck
- Fruit/trending
- Matches
- Inbox
- Chat
- Match detail
- Profile
- Edit profile
- Paywall

Shared components:

- `components/ui.tsx`: `Button`, `Chip`, `SectionLabel`, `Divider`
- `components/SuperLikeIcon.tsx`
- `components/SuperLikeBurst.tsx`

Providers:

- `providers/profile-provider.tsx`
- `providers/onboarding-provider.tsx`

## Mock Data Sources

Mock profile data:

- `mocks/profiles.ts`
- `mocks/fruit-profiles.ts`

Other local data/constants:

- `types/index.ts`
- `constants/cities.ts`
- `constants/colors.ts`
- `constants/poly-fruits.ts`
- `utils/match.ts`

## Current Swipe, Match, And Chat Status

Current behavior is local prototype behavior.

Discovery:

- Reads from `MOCK_PROFILES`
- Filters liked/passed profiles locally
- Ranks with `utils/match.ts`
- Stores liked/passed IDs in AsyncStorage

Matching:

- Swipe right immediately creates a local match/conversation
- No backend mutual-like logic
- No server-side duplicate prevention
- No blocked-user exclusion

Chat:

- Conversations are stored in AsyncStorage
- Sending a message writes a local message
- Fake auto-replies are generated with `setTimeout`
- Photo messages use local image picker URIs and simulated approval
- No realtime backend, push notifications, delivery state, or moderation

Auth:

- Sign-in is local-only
- Credentials are stored on the local profile object
- Social auth buttons are placeholders
- Passwords are not securely stored

Payments:

- Paywall is simulated
- Purchases and subscriptions mutate local counters only
- No App Store / Google Play billing

## Build Commands

Development commands from `expo/package.json`:

```powershell
cd expo
bun run start
bun run start-web
```

Native preview commands:

```powershell
cd expo
bun run start -- --ios
bun run start -- --android
```

Expected EAS commands for real beta builds:

```powershell
cd expo
bunx eas build:configure
bunx eas build --platform ios
bunx eas submit --platform ios
```

No `eas.json` was present during the audit.

## Environment Variables

No required environment variables are currently used by the app.

Expected MVP variables:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_POSTHOG_HOST=
EXPO_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

The app should continue to run in mock mode when Supabase variables are absent. Analytics and Sentry should be optional.

## iOS TestFlight Risks

Major blockers before TestFlight:

- No real auth
- No backend data persistence
- No real profile/photo storage
- No real mutual match creation
- No real chat backend
- No block/report/unmatch/account deletion flows
- No moderation workflow
- No `eas.json`
- Legacy generated bundle identifier still present
- Simulated purchases should be removed or hidden for MVP unless real IAP is implemented
- Privacy policy, terms, community standards, support, and deletion URLs are not in place
- Permission strings and App Store Connect metadata need review
- No tests or CI

## Product Implication

The useful prototype UI is already here. The MVP work should preserve the working screens where possible while replacing local state and mock data with backend-backed auth, profiles, photos, swipes, matches, chat, and safety workflows.

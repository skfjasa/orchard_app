# Orchard

Orchard is an iOS-first dating app MVP project for polyamorous / ENM users. The current codebase is an Expo React Native prototype that is being converted into a functional closed-beta app suitable for TestFlight.

The product goal is not to build a generic swipe app with different labels. The MVP should validate whether structured relationship context improves dating outcomes for poly/ENM users: relationship structure, partnered status, dating mode, boundaries, and expectations should be clear before matching and chatting.

## Current Status

The app is currently a prototype with a backend migration path in progress.

- Framework: Expo React Native with Expo Router
- Runtime app path: `expo/`
- Package manager: Bun
- Current data mode: local/mock UI state with Supabase auth, profile/member persistence, local Supabase Storage profile photo upload, and gated swipe persistence scaffolding
- Backend target: Supabase
- Initial deployment target: iOS TestFlight
- Android support: later

Most core behavior is currently simulated or stored locally:

- Profiles use AsyncStorage and mock data.
- Discovery reads local mock profiles.
- Likes/passes/matches are local.
- Chat is local and includes fake replies.
- Paywall, boosts, subscriptions, and Super Likes are simulated.

Backend foundation currently exists for:

- Env-gated Supabase client setup
- Auth/session provider foundation with email/password sign-in and account creation
- Resumable hosted Supabase email-confirmation flow for onboarding/profile persistence, with a pending-confirmation screen and local pending-profile restore
- Initial Supabase schema/RLS/RPC migration draft
- Hosted `orchard-dev` migration apply and Dashboard verification
- Profile/member persistence to Supabase `profiles` and `profile_members`
- Local Supabase Storage-backed profile photo upload to a private `profile-photos` bucket, with `profile_photos.member_id` metadata persistence
- Supabase service adapters for swipe, match, and safety flows
- Backend/mock service factory
- Non-blocking gated swipe persistence hook
- Local Supabase CLI/config and initial database/RLS tests, now passing against Docker Desktop/local Supabase
- GitHub Actions for Expo install/typecheck/lint, plus a validated manual Supabase DB/RLS test workflow

## Repository Layout

```text
.
├── android/              # Root-level generated Android asset folder
├── assets/               # Root-level generated assets
├── docs/                 # Canonical milestone tracker, architecture plan, setup/status notes
└── expo/                 # Main Expo React Native app
```

Important app files:

```text
expo/app/                 # Expo Router screens
expo/app/_layout.tsx      # Root app providers and navigation
expo/app/(tabs)/          # Main tab screens
expo/providers/           # Current local state providers
expo/mocks/               # Mock profiles
expo/types/index.ts       # Current domain types
expo/utils/match.ts       # Prototype match scoring
```

## Getting Started

Install dependencies:

```powershell
cd expo
bun install
```

Start native preview:

```powershell
cd expo
bun run start
```

Start web preview:

```powershell
cd expo
bun run start-web
```

See [docs/setup.md](docs/setup.md) for more setup detail.

## MVP Direction

The preferred MVP architecture is:

- Frontend: Expo React Native
- Auth: Supabase Auth
- Database: Supabase Postgres
- Photo storage: Supabase Storage
- Chat: Supabase Realtime or polling fallback
- Analytics: optional PostHog
- Crash/error logging: optional Sentry
- iOS beta deployment: EAS Build + TestFlight

The app should continue to run in mock mode when Supabase environment variables are missing.

## MVP Must-Haves

- Auth
- Age gate / 18+ confirmation
- Terms, privacy policy, and community standards acceptance
- Profile creation
- Photo upload
- Swipe discovery
- Like/pass persistence
- Mutual match creation
- Match list
- 1:1 chat after match
- Block user
- Report profile
- Report message
- Unmatch
- Account deletion initiation
- Basic moderation workflow
- Product analytics events
- iOS TestFlight build configuration

## Defer Until Later

- Paid subscriptions
- Boosts
- Super Likes
- Advanced verification
- Complex ranking or ML matching
- Video profiles
- Audio messages
- Group chat
- Couple-linked accounts
- Public App Store launch polish
- Android production launch

## Documentation

- [Docs index](docs/README.md)
- [Closed-beta milestone tracker](docs/milestone-tracker.md)
- [Repo audit and foundation refactor plan](docs/repo-audit-and-foundation-plan.md)
- [Architecture audit history](docs/architecture-history.md)
- [Development setup](docs/setup.md)
- [Current project status](docs/project-status.md)
- [Backend migration plan](docs/backend-migration-plan.md)

## Development Principles

- Preserve the working prototype UI where practical.
- Replace mocked data gradually.
- Keep mock mode available.
- Keep changes PR-sized.
- Do not commit secrets.
- Use environment variables for external services.
- Prioritize iOS TestFlight readiness before Android work.
- Build safety and moderation into the MVP, not as a later add-on.

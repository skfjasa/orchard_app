# Orchard

Orchard is an iOS-first dating app MVP project for polyamorous / ENM users. The current codebase is a Rork-generated Expo React Native prototype that is being converted into a functional closed-beta app suitable for TestFlight.

The product goal is not to build a generic swipe app with different labels. The MVP should validate whether structured relationship context improves dating outcomes for poly/ENM users: relationship structure, partnered status, dating mode, boundaries, and expectations should be clear before matching and chatting.

## Current Status

The app is currently a prototype.

- Framework: Expo React Native with Expo Router
- Runtime app path: `expo/`
- Package manager: Bun
- Current data mode: local/mock
- Backend target: Supabase
- Initial deployment target: iOS TestFlight
- Android support: later

Most core behavior is currently simulated or stored locally:

- Profiles use AsyncStorage and mock data.
- Discovery reads local mock profiles.
- Likes/passes/matches are local.
- Chat is local and includes fake replies.
- Paywall, boosts, subscriptions, and Super Likes are simulated.

## Repository Layout

```text
.
├── android/              # Root-level generated Android asset folder
├── assets/               # Root-level generated assets
├── docs/                 # Project audit, MVP plan, setup notes
├── expo/                 # Main Expo React Native app
└── rork.json             # Rork project metadata
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

- [Repo audit](docs/repo-audit.md)
- [MVP plan](docs/mvp-plan.md)
- [Development setup](docs/setup.md)

## Development Principles

- Preserve the working Rork prototype UI where practical.
- Replace mocked data gradually.
- Keep mock mode available.
- Keep changes PR-sized.
- Do not commit secrets.
- Use environment variables for external services.
- Prioritize iOS TestFlight readiness before Android work.
- Build safety and moderation into the MVP, not as a later add-on.

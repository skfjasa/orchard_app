# AGENTS.md

## Project Summary

Orchard is a Rork-generated dating app prototype being converted into an iOS-first MVP for polyamorous / ENM users. The product wedge is structured relationship-context matching: relationship structure, partnered status, dating mode, boundaries, looking-for intent, and compatibility expectations should be clear before chat.

This app should not become a generic swipe clone. Preserve the working prototype while replacing local/mock behavior incrementally.

## Actual Stack

- App code: `expo/`
- Framework/runtime: Expo React Native
- Routing: Expo Router
- Language: TypeScript
- Package manager: Bun
- React: `19.1.0`
- React Native: `0.81.5`
- Expo: `~54.0.27`
- Entrypoint: `expo-router/entry`
- Root layout: `expo/app/_layout.tsx`
- Initial redirect: `expo/app/index.tsx`
- State provider: `expo/providers/profile-provider.tsx`
- Onboarding provider: `expo/providers/onboarding-provider.tsx`
- Mock data: `expo/mocks/profiles.ts`, `expo/mocks/fruit-profiles.ts`

There is currently no backend implementation, no Supabase client, no migrations, no API client, no server functions, no real auth, no real storage, and no real chat backend.

## Actual Repo Structure

```text
.
├── AGENTS.md
├── README.md
├── rork.json
├── docs/
├── android/
├── assets/
└── expo/
    ├── app/
    ├── assets/
    ├── components/
    ├── constants/
    ├── mocks/
    ├── providers/
    ├── types/
    ├── utils/
    ├── app.json
    ├── bun.lock
    └── package.json
```

## Actual Commands

Run app commands from `expo/`.

```powershell
cd expo
bun install
bun run start
bun run start-web
bun run lint
```

Existing scripts:

- `start`: `bunx rork start -p h12kndiz6neur3chkh3q1 --tunnel`
- `start-web`: `bunx rork start -p h12kndiz6neur3chkh3q1 --web --tunnel`
- `start-web-dev`: `DEBUG=expo* bunx rork start -p h12kndiz6neur3chkh3q1 --web --tunnel`
- `lint`: `expo lint`
- `typecheck`: `tsc --noEmit`

Use `bun run lint` and `bun run typecheck` from `expo/` for code changes.

## Coding Rules

- Preserve the Rork-generated UI unless explicitly asked to redesign.
- Keep changes small, repo-specific, and reversible.
- Prefer PR-sized tasks.
- Do not rewrite the app.
- Do not bulk-rewrite `expo/providers/profile-provider.tsx`.
- Introduce adapters/services gradually before replacing local state.
- Preserve mock/demo mode while backend behavior is being added.
- Use Bun for dependency and script workflows.
- Do not add paid services without human approval.
- Do not remove existing docs unless they are obsolete and replaced.
- Do not implement production behavior in docs-only tasks.
- Keep `docs/project-status.md` current when commits change status, plans, or blockers.

## MVP Priority Order

1. Operating layer and docs.
2. App foundation and adapter boundaries.
3. Supabase backend foundation.
4. Real auth and onboarding.
5. Photo upload and profile storage.
6. Discovery, swipes, and reciprocal matches.
7. Active-match-only chat.
8. Safety and moderation.
9. Privacy, terms, support, and account deletion.
10. Analytics and crash reporting.
11. iOS TestFlight.
12. Android later.

## Safety / Privacy Requirements

These cannot be skipped for the TestFlight MVP:

- Age gate / 18+ confirmation.
- Privacy policy access.
- Terms access.
- Community standards access.
- Support/contact access.
- Account deletion in app.
- Report profile.
- Report message.
- Block user.
- Unmatch.
- Basic moderation workflow.

Behavioral rules:

- Chat must only be available between active matches.
- Blocked users must not see, match, or message each other.
- Suspended users must not appear in discovery.
- Invisible users must not appear in discovery.
- Do not require exact location for the MVP.
- Do not put private messages, raw profile text, or PII in analytics.

## Backend / Supabase Rules

The intended backend is Supabase, but no backend code exists yet.

Future backend access rules must enforce:

- Users can update only their own profile.
- Users can read only eligible visible profiles.
- Users can like/pass only as themselves.
- Matches are created only from reciprocal likes.
- Users can read/send messages only for active matches they belong to.
- Blocks are enforced server-side for discovery, matching, and chat.
- Reports can be created by authenticated users.
- Suspended/invisible users are excluded from discovery.
- Service-role keys never ship in the mobile app.

The app must still run in mock mode when Supabase environment variables are absent.

## Sensitive Data Rules

Never commit:

- `.env`
- API keys
- Supabase service-role keys
- Signing credentials
- Apple credentials
- Google credentials
- Private config
- Real user profile data
- Real private messages
- Raw PII in fixtures or analytics

Add or update `.env.example` whenever environment variables are introduced.

## Definition Of Done

For code changes:

- Relevant files were inspected first.
- Change scope is small and clearly tied to the task.
- Existing Rork UI and mock/demo behavior are preserved unless explicitly changed.
- `bun run lint` is run from `expo/` when practical.
- `bun run typecheck` is run from `expo/` when practical.
- `docs/project-status.md` is updated when the change affects status, plans, or blockers.
- Manual test steps are documented in the final response.
- Risks/blockers are called out.

For docs-only changes:

- No runtime behavior changed.
- Docs reflect the actual repo state.
- Commands and paths are repo-specific.
- Future implementation guidance is clear and conservative.

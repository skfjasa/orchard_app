# Project Status

Last updated: 2026-06-19

## Current Repo State

- Repo: `skfjasa/orchard_app`
- App code: `expo/`
- Runtime: Expo React Native with Expo Router and TypeScript
- Package manager: Bun
- Backend: none yet
- Persistence: local `AsyncStorage`
- Checks: `bun run lint` and `bun run typecheck`
- Branch: `main`
- MVP monetization: disabled

## Latest Foundation Commits

- This commit - Reassess remaining ProfileProvider responsibilities
- `4ad31ef` - Demo-enable monetizable features without MVP paywalls
- `b5aa1d0` - Extract local profile mutation helpers
- `4a214e6` - Extract local monetization helpers
- `b699432` - Extract local interaction helpers
- `cb19b2b` - Extract local profile storage service
- `95069ee` - Fix existing lint issues
- `53981d9` - Add mock service adapters
- `eeec50f` - Add service interface skeletons
- `13f7df9` - Document profile provider responsibilities
- `b39368e` - Add project operating layer

## What Is Done

- Project operating docs and repo audit exist.
- `.env.example` exists under `expo/`.
- Typecheck script exists.
- Service interfaces and mock adapters exist.
- `ProfileProvider` no longer owns direct `AsyncStorage` calls.
- Local swipe/chat/message simulation helpers are extracted.
- Local monetization calculations are extracted.
- Local profile mutation helpers are extracted.
- `docs/project-status.md` is the running status/context/plan tracker.
- Monetization is explicitly out of scope for the feedback MVP.
- Monetizable features should be demoable without payment walls when monetization is disabled.
- Existing and possible future monetization surfaces are tracked in `docs/monetization-candidates.md`.

## Current Task

Reassess remaining `ProfileProvider` responsibilities after helper extraction and update the repo architecture notes before Supabase work begins.

## Next Planned Tasks

1. Add Supabase dependency and env-gated client skeleton.
2. Add auth/session foundation while preserving mock mode.
3. Draft initial Supabase schema/migration plan.
4. Decide production bundle ID and beta app identity.
5. Add safety/legal surfaces required for TestFlight planning.

## Human Decisions Needed

- Production bundle ID.
- Apple Developer account availability.
- Supabase project name and region.
- Public Privacy Policy, Terms, Support, and Account Deletion URLs.
- Whether to keep `Orchard` as final app name.

## Status Tracking Rule

Update this file whenever a commit materially changes project status, next tasks, or known blockers.

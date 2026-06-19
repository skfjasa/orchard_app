# Project Status

Last updated: 2026-06-19

## Current Repo State

- Repo: `skfjasa/orchard_app`
- App code: `expo/`
- Runtime: Expo React Native with Expo Router and TypeScript
- Package manager: Bun
- Backend: Supabase client, auth/session provider skeleton, and schema draft only; no backend profile/matching/chat behavior wired yet
- Persistence: local `AsyncStorage`
- Checks: `bun run lint` and `bun run typecheck`
- Branch: `main`
- MVP monetization: disabled

## Latest Foundation Commits

- This commit - Add core Supabase matching and safety RPC drafts
- `9422c3a` - Draft initial Supabase schema and RLS
- `c4a4efb` - Add auth/session provider foundation
- `a4f57ea` - Add env-gated Supabase client skeleton
- `3efd74a` - Update provider architecture status
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
- Supabase dependency and env-gated client skeleton exist.
- Auth/session provider foundation exists and defaults to mock mode when Supabase env vars are absent.
- Initial Supabase schema/RLS migration draft exists.
- Draft RPCs exist for reciprocal swipe matching, unmatch, and block behavior.

## Current Task

Add core Supabase matching and safety RPC drafts before wiring runtime behavior to backend tables.

## Next Planned Tasks

1. Review Supabase schema/RLS/RPCs before applying to a dev project.
2. Decide production bundle ID and beta app identity.
3. Add safety/legal surfaces required for TestFlight planning.
4. Wire one low-risk service to backend/mock adapter boundary.
5. Start wiring real auth into onboarding/sign-in once schema decisions are made.

## Human Decisions Needed

- Production bundle ID.
- Apple Developer account availability.
- Supabase project name and region.
- Public Privacy Policy, Terms, Support, and Account Deletion URLs.
- Whether to keep `Orchard` as final app name.

## Status Tracking Rule

Update this file whenever a commit materially changes project status, next tasks, or known blockers.

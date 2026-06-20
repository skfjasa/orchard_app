# Project Status

Last updated: 2026-06-20

## Current Repo State

- Repo: `skfjasa/orchard_app`
- Handoff checkpoint: 2026-06-20 safety/legal surfaces
- App code: `expo/`
- Runtime: Expo React Native with Expo Router and TypeScript
- Package manager: Bun
- Backend: Supabase client, auth/session provider skeleton, hardened schema/RLS/RPC draft, initial Supabase service adapters, backend/mock service factory, and gated swipe persistence hook; no backend profile/matching/chat behavior is fully wired yet
- Persistence: local `AsyncStorage`
- Checks: `bun run lint`, `bun run typecheck`, and `expo\node_modules\.bin\supabase test db`
- Branch: `main`
- MVP monetization: disabled
- Local Docker: Docker Desktop is operational after enabling firmware virtualization. `docker version` reports Docker Desktop with a Linux engine, and WSL default distribution is `docker-desktop`.
- Handoff procedure: global `handoff sync` / `session handoff` behavior is being recorded in global/workspace instructions and Orchard-specific docs.

## Latest Foundation Commits

- `a29e3c4` - Harden Supabase MVP migration
- `2b73a97` - Document status report shortcut
- `3a39dbc` - Refresh session handoff context
- `f9859fa` - Gate swipe persistence through backend service factory
- `8d1c023` - Add backend/mock service factory
- `525df94` - Add Supabase swipe, match, and safety service adapters
- `9cf5b94` - Add core Supabase matching and safety RPC drafts
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
- Supabase service adapters exist for swipe, match, and safety behavior. Swipe persistence is lightly wired into the provider as a gated, non-blocking hook; match and safety adapters are not wired into UI/provider flows yet.
- Backend/mock service factory exists and exposes per-service capabilities so partial Supabase support is explicit.
- `ProfileProvider` can now call the swipe service factory as a non-blocking persistence hook when Supabase mode has a real authenticated profile id. Local state remains the UI source of truth.
- Supabase hardening is tracked in `docs/supabase-hardening-plan.md`.
- The initial Supabase migration draft has been hardened with authenticated-only RLS policies, private eligibility helpers, column-scoped profile/photo grants, RPC-only report/account-deletion writes, actor eligibility checks for swipes/messages, and the missing account deletion `reason` column.
- The Supabase safety adapter now uses RPCs for report and account deletion requests so actor identity is derived server-side.
- Supabase CLI is installed as an Expo dev dependency (`supabase@2.107.0`), and local Supabase config exists at `supabase/config.toml`.
- Initial pgTAP-style database/RLS tests exist at `supabase/tests/database/202606200001_mvp_security.sql` and pass locally.
- Docker Desktop was installed manually during the 2026-06-20 session and is now operational after firmware virtualization was enabled.
- Diagnostics captured after enabling virtualization on 2026-06-20: AMD Ryzen 5 5600X, `VirtualizationFirmwareEnabled: True`, `HypervisorPresent: True`, Docker Desktop server running Docker Engine 29.5.3 on Linux, WSL default distribution `docker-desktop`, WSL default version 2.
- The first database test run exposed pgTAP assertion argument mistakes, which were fixed in `supabase/tests/database/202606200001_mvp_security.sql`; the suite then passed 19/19.
- Initial in-app Safety & Legal surface exists at `expo/app/safety-legal.tsx`, linked from Profile.
- Profile detail and chat now expose report/block actions; chat also exposes unmatch and report-message actions. These use the existing safety service boundary and preserve mock mode.
- Report profile and report message actions now open a reason/details form before submitting through the safety service.
- Account deletion can be requested from the Safety & Legal screen; the local flow records the request through the safety service and signs out.
- Direct chat routes and local message/photo send helpers now require an active local match before showing or writing conversation content.
- Onboarding now includes a pre-profile age/legal gate for 18+ confirmation, MVP terms, privacy notice, and community standards acceptance. Acceptance is stored on the local prototype profile.
- Safety/legal links and support contact are env-configurable through `EXPO_PUBLIC_PRIVACY_POLICY_URL`, `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_COMMUNITY_STANDARDS_URL`, `EXPO_PUBLIC_SUPPORT_EMAIL`, `EXPO_PUBLIC_SUPPORT_URL`, and `EXPO_PUBLIC_ACCOUNT_DELETION_URL`.

## Current Task

Continue safety/legal hardening by filling final public policy/support env values and wiring persisted backend safety/legal/report flows once auth/profile persistence is live.

## Next Planned Tasks

1. Decide public Privacy Policy, Terms, Support, and Account Deletion URLs/email, then fill the legal/support env values.
2. Review the hardened SQL and passing database/RLS tests before dev apply.
3. Decide whether to apply the hardened migration to a dev project.
4. Decide production bundle ID and beta app identity.
5. Start wiring real auth into onboarding/sign-in once schema decisions are made.

## Human Decisions Needed

- Production bundle ID.
- Apple Developer account availability.
- Supabase project name and region.
- Public Privacy Policy, Terms, Support, and Account Deletion URLs.
- Whether to keep `Orchard` as final app name.

## Status Tracking Rule

Update this file whenever a commit materially changes project status, next tasks, or known blockers.

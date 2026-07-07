# AGENTS.md

## Project Summary

Orchard is an Expo React Native dating app prototype being converted into an iOS-first MVP for polyamorous / ENM users. The product wedge is structured relationship-context matching: relationship structure, partnered status, dating mode, boundaries, looking-for intent, and compatibility expectations should be clear before chat.

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
- State providers: `expo/providers/profile-provider.tsx`, `expo/providers/auth-provider.tsx`
- Onboarding provider: `expo/providers/onboarding-provider.tsx`
- Mock data: `expo/mocks/profiles.ts`, `expo/mocks/fruit-profiles.ts`

There is currently no production backend wired as the app source of truth. Supabase JS, an env-gated client skeleton, auth/session provider foundation, initial schema/RLS/RPC migration draft, Supabase swipe/match/safety adapters, and a backend/mock service factory exist. Profile storage, discovery, photos, reciprocal match source of truth, and chat are still local/mock. Swipe persistence has a gated, non-blocking Supabase hook when Supabase mode has a matching authenticated profile id.

## Actual Repo Structure

```text
.
├── AGENTS.md
├── README.md
├── docs/
├── supabase/
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
bun run uat-web-tunnel
bun run lint
```

Existing scripts:

- `start`: `expo start`
- `start-web`: `expo start --web`
- `start-web-dev`: `DEBUG=expo* expo start --web`
- `uat-web-tunnel`: starts Expo web on port 8081 and a standalone ngrok v3 tunnel for UAT
- `lint`: `expo lint`
- `typecheck`: `tsc --noEmit`

Use `bun run lint` and `bun run typecheck` from `expo/` for code changes.

## Coding Rules

- Preserve the existing prototype UI unless explicitly asked to redesign.
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

## Agent Workflow Trigger Phrases

### `status report`

Treat `status report` in any capitalization as the default lightweight session-start command for this repo.

Read only:

1. `C:\Users\skfja\Projects\AGENTS.md`
2. `AGENTS.md`
3. `.agents/current.md`
4. `.agents/next.md`
5. Git status, current branch, and latest commit

Do not read long docs, archived handoffs, planning docs, architecture maps, or dated session history unless `.agents/current.md` explicitly says they are needed for the next task. Do not edit files.

Output current branch, dirty files, latest commit, current objective, validation status, likely relevant files, and recommended next step. Then wait for the user.

### `handoff sync`

Treat `handoff sync` or `session handoff` in any capitalization as the default lightweight end-of-session command.

Update `.agents/current.md` and `.agents/next.md`. Archive a detailed handoff under `.agents/sessions/` only if meaningful code, architecture, schema, workflow, or process changed. Keep `.agents/current.md` concise, ideally under 100-150 lines.

Also update the compact central mirror in `personal-os\03-projects\handoffs\orchard_app\latest.md` when status materially changed. Do not edit runtime code unless explicitly asked.

## Project Handoff Files

For this repo, lightweight startup state lives in:

- `.agents/current.md`
- `.agents/next.md`

Detailed or compatibility handoff/status files should be refreshed only when they are relevant or would otherwise become stale:

- `docs/project-status.md`
- `docs/backend-migration-plan.md`
- `docs/supabase-hardening-plan.md`
- `README.md`
- Any other markdown file containing stale status, setup, blocker, or next-step context

## Session Handoff Shortcut

When the user says `handoff sync` or `session handoff` in any capitalization, update `.agents/current.md` and `.agents/next.md` first, then update broader repo-specific docs only when status materially changed.

Do this:

1. Inspect `git status` and recent commits.
2. Update `.agents/current.md` and `.agents/next.md`.
3. Update the relevant project handoff/status markdown files listed above when they would otherwise be stale.
4. Update central `personal-os` mirrors when available and relevant.
5. Do not change runtime code unless the user explicitly asks.
6. Summarize changed docs, current blockers, and exact next-session startup steps.

## Handoff Cleanup

When handoff/status docs become large or repetitive, compact them without losing continuity:

- Keep current handoff files focused on the latest state, active blockers, decisions, verification, and next steps.
- Move or summarize older tactical detail into dated session history or archive docs.
- Preserve durable decisions and current blockers in the files read at session start.
- Remove duplicated procedural text when it is already covered by global or workspace instructions.
- Keep enough context for a new session to resume without loading long dated histories by default.

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

The intended backend is Supabase. Backend foundation code and migration drafts exist, but Supabase is not yet wired as the app source of truth.

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
- Existing prototype UI and mock/demo behavior are preserved unless explicitly changed.
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

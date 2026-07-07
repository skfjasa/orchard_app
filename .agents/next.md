# Next Task

Human UAT forgot-password, then start foundation Slice 2 from `docs/repo-audit-and-foundation-plan.md`.

## Canonical Startup Context

Read these first:

- `AGENTS.md`
- `.agents/current.md`
- `.agents/next.md`
- `docs/milestone-tracker.md`
- `docs/repo-audit-and-foundation-plan.md`
- `docs/README.md`

Read only if needed:

- `docs/project-status.md`
- `docs/architecture-history.md`
- `docs/supabase-schema.md`
- `docs/backend-migration-plan.md`

## Implemented Scope

- `expo/hooks/use-canonical-back.ts`: removed web `popstate` behavior and web options; kept Android `BackHandler`.
- `expo/app/(tabs)/matches.tsx`: removed `window.history.pushState` / hash sentinel before opening Match Detail.
- `expo/app/match/[id].tsx`: removed web-specific `useCanonicalBack` options.
- `expo/scripts/start-uat-web-tunnel.cjs`: added one-command UAT launcher for Expo web plus standalone ngrok v3.
- `expo/hooks/use-canonical-back.ts`: follow-up restored focused web browser-back handling by replacing to the canonical route instead of using the removed Match-tab hash/history workaround.
- `expo/providers/auth-provider.tsx` and `expo/app/onboarding/sign-in.tsx`: wired hosted Supabase forgot-password recovery and in-app password update.

## Validation

- `cd expo; bun run typecheck`: passed.
- `cd expo; bun run lint`: passed.
- `git diff --check`: passed.
- Targeted desktop Chrome and Android Chrome UAT passed for Chat and Match Detail back navigation. Android Match Detail has a brief app-background loader during early repeated backs, then warms up.
- Forgot-password fix: `cd expo; bun run typecheck` passed, `cd expo; bun run lint` passed, and `git diff --check` passed.

## Follow-Up After Slice 1

Navigation cleanup is accepted. Before Slice 2, human UAT the forgot-password flow: request reset email, open link, set a new password, sign in with the new password, and confirm the old password no longer works. Then move to Slice 2: update/freeze the `ProfileProvider` facade contract and responsibility inventory.

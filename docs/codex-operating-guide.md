# Codex Operating Guide

## Repo Facts

- Live repo: `skfjasa/orchard_app`
- App code lives in `expo/`
- Runtime: Expo React Native
- Routing: Expo Router
- Package manager: Bun
- Current persistence: local AsyncStorage
- Current backend: Supabase foundation exists, but production backend behavior is not wired as source of truth
- Current mode: Rork prototype with mock/local behavior
- Local Docker/Supabase status: Docker Desktop is operational after enabling firmware virtualization, and `expo\node_modules\.bin\supabase test db` passes locally

## Commands

Run app commands from `expo/`.

```powershell
cd expo
bun install
bun run start
bun run start-web
bun run lint
```

Use the existing Rork start commands in `expo/package.json`. Do not replace them unless explicitly asked.

## Working Rules

- Inspect before editing.
- Before edits, identify the files to change.
- Keep changes small and PR-sized.
- Do not bulk-rewrite `expo/providers/profile-provider.tsx`.
- Preserve local/mock behavior until each backend-backed feature is ready.
- Prefer adapter/service extraction before replacing local state.
- Preserve the Rork-generated UI unless asked to redesign.
- Do not add paid services without human approval.
- Do not add secrets.
- Do not remove existing docs unless obsolete and replaced.
- Use Bun, not npm/yarn/pnpm, unless there is a specific reason.

## Recommended Working Loop

1. Inspect the relevant files.
2. Propose a small task boundary.
3. Change only necessary files.
4. Run `bun run lint` from `expo/` if available.
5. Run typecheck if a script exists.
6. Document manual test steps.
7. Summarize risks and blockers.

## Session Continuity

- `status report` starts a read-only session orientation.
- `handoff sync` or `session handoff` updates all relevant continuity markdown files and central mirrors so a new session can resume cleanly.
- Compact handoff/status docs when they become repetitive; keep current-state files focused on active blockers, decisions, verification, and next actions.

## Backend Migration Rule

Backend migration should be incremental:

- Keep mock mode available.
- Add interfaces/adapters first.
- Add Supabase-backed implementations beside mock implementations.
- Switch screens one behavior at a time.
- Avoid coupling UI directly to Supabase calls.

## Safety Rule

Safety and privacy flows are MVP requirements, not polish. Report, block, unmatch, account deletion, privacy, terms, community standards, and support must exist before TestFlight MVP.

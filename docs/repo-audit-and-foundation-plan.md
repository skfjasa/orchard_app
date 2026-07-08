# Orchard Repo Audit & Foundation Refactor Plan

Last updated: 2026-07-08

This is the active execution plan for the July 2026 repository audit. It supersedes older one-pass refactor recommendations while preserving their useful findings in [Architecture Audit History](architecture-history.md).

## Decision

Proceed with Option 3 as an incremental foundation cleanup, not as a one-shot provider replacement.

The audit findings are valid:

- Web navigation has accumulated manual browser-history workarounds around Match Detail.
- `ProfileProvider` has grown into a broad coordinator for session bootstrap, backend hydration, Realtime, local persistence, mock behavior, UI selectors, and prototype monetization state.

The original deletion plan is not the right execution path. The repo rules and migration docs explicitly require preserving mock mode, avoiding a bulk rewrite of `expo/providers/profile-provider.tsx`, and moving behavior behind services gradually.

## Engineering Principles

- Preserve the existing prototype UI unless a task explicitly changes it.
- Keep mock/Fruit/demo behavior working while Supabase mode is hardened.
- Prefer service boundaries and query/store extraction over screen-level Supabase calls.
- Keep each slice small enough to validate with `bun run typecheck`, `bun run lint`, and targeted UAT.
- Keep `ProfileProvider` as a compatibility facade until consumers are migrated.
- Do not duplicate Supabase Auth session state into a second global auth store while `AuthProvider` remains the session source of truth.
- Do not delete `ProfileProvider` until no active route or component depends on `useProfile()`.

## Part 1: Audit Findings

### Finding 1: Web Navigation Race Conditions

Android Chrome UAT exposed a blank white transient reload/state gap around Match Detail browser/device back. Current code still contains manual web history/hash handling:

- `expo/app/(tabs)/matches.tsx`: manual `window.history.pushState(...)`.
- `expo/hooks/use-canonical-back.ts`: custom web `popstate` handling.
- `expo/app/match/[id].tsx`: Match Detail opts into that web handling.

Current product impact:

- Mobile web testing can show route/state gaps that are hard to distinguish from backend hydration bugs.
- The workaround increases coupling between Expo Router and raw browser history.

Target direction:

- Let Expo Router own web route state.
- Keep native Android hardware-back handling through React Native `BackHandler`.
- Keep Supabase bootstrap guards independent of browser-history hacks.

### Finding 2: `ProfileProvider` State Monolith

`expo/providers/profile-provider.tsx` is now roughly 1,900 lines and mixes several domains:

- Local profile/cache hydration.
- Supabase profile bootstrap.
- Backend match/thread/profile-display hydration.
- Realtime subscriptions and polling fallback.
- Local and backend swipe/match/chat behavior.
- Read watermarks and seen-match state.
- Mock/Fruit fixture behavior.
- Prototype monetization counters.
- UI-facing selectors for Matches, Inbox, profile lookup, tab badges, and active-match checks.

Current product impact:

- Race-condition fixes tend to land as provider-level patches.
- A change in one domain can rerender unrelated screens.
- Backend source-of-truth work is harder to reason about because local cache, mock fixtures, and hosted state are merged in one place.

Target direction:

- Server state belongs in React Query hooks keyed by authenticated profile/session context.
- Client preferences and local-only interaction state can move to Zustand stores with explicit persistence.
- The provider should shrink into a facade or be deleted only after consumers migrate to domain hooks.

## Part 2: PR-Sized Execution Plan

### Slice 0: Plan And Status Alignment

Status: current docs-only task.

Files:

- `docs/repo-audit-and-foundation-plan.md`
- `docs/architecture-history.md`
- `docs/project-status.md`
- `docs/backend-migration-plan.md`
- `docs/profile-provider-map.md`
- older audit docs, with supersession notes only

Actions:

- Replace the one-pass provider deletion directive with this incremental plan.
- Preserve old audit findings as historical lineage.
- Mark stale execution directives as superseded where needed.
- Do not modify runtime code.

Validation:

- `git diff --check`
- Confirm no files under `expo/`, `supabase/`, or app runtime code changed.

### Slice 1: Web Navigation Cleanup

Goal:

Remove raw browser-history coordination from Match Detail navigation while preserving native Android hardware back.

Files:

- `expo/hooks/use-canonical-back.ts`
- `expo/app/(tabs)/matches.tsx`
- `expo/app/match/[id].tsx`

Actions:

- Remove `options.web` and `webAction` from `useCanonicalBack`.
- Remove the `popstate` listener from `useCanonicalBack`.
- Keep the Android `BackHandler` branch.
- Remove Match-tab `window.history.pushState(...)`.
- Keep `await markMatchSeen(profileId)` before `router.push(...)`.
- Remove `{ web: true, webAction: "replace" }` from Match Detail.

Do not:

- Change `AuthProvider` URL callback listeners in this slice.
- Change protected-route bootstrap behavior.
- Change match or inbox data hydration logic.

Validation:

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- Desktop browser: open Match Detail from Matches, use browser back, confirm Matches returns without blank/empty state.
- Android Chrome UAT: repeat the current order-dependent flow. Capture whether the white flash remains after removing the hash workaround.

### Slice 2: Domain Inventory And Facade Contract

Goal:

Freeze the current public `useProfile()` contract before extracting implementation pieces.

Files:

- `docs/profile-provider-map.md`
- optionally a new `expo/providers/profile-provider-contract.ts` type-only file if useful

Actions:

- Update the provider responsibility map to current reality.
- Categorize each provider field/action as one of:
  - Auth/profile bootstrap.
  - Server state.
  - Client preference state.
  - Local mock/demo state.
  - Prototype monetization state.
  - UI selector/facade.
- Identify first consumers to migrate:
  - Matches and Inbox read selectors.
  - Match Detail profile lookup/seen state.
  - Chat thread/read state.

Do not:

- Move runtime state yet.
- Rename storage keys yet.
- Change UI behavior.

Validation:

- Docs-only `git diff --check`.

### Slice 3: Client Preferences Store

Goal:

Move small, low-risk persisted client preferences out of `ProfileProvider`.

Candidate file:

- `expo/store/use-preferences-store.ts`

State:

- `readWatermarks`
- `seenMatchIds`

Actions:

- Use Zustand with persistence backed by AsyncStorage.
- Preserve existing storage keys or add a migration path before changing keys.
- Keep provider methods `markRead` and `markMatchSeen` as compatibility wrappers initially.
- Update provider internals to read/write through the store.

Do not:

- Move Supabase `match_read_states` behavior out of the provider in the same slice.
- Change whether seen-match state is local-only or backend-backed; that remains a product decision.

Validation:

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- UAT: read Inbox row, sign out/in, confirm read state stays cleared until a newer incoming message.
- UAT: open new match, confirm highlight clears and stays cleared in the same local browser/device profile.

### Slice 4: Interaction Store For Local-Only Swipe State

Status: implemented 2026-07-07.

Goal:

Separate local/demo interaction arrays from backend match source-of-truth state.

Candidate file:

- `expo/store/use-interaction-store.ts`

State:

- `likedIds`
- `passedIds`
- `superLikedIds`
- local-only fixture match markers if needed

Actions:

- Move persistence and simple local mutation helpers into the store.
- Keep Supabase reciprocal-match decisions behind `SwipeService` and `MatchService`.
- Keep provider wrappers so screens do not all migrate at once.
- Make mock/Fruit behavior explicit in store/action naming.

Do not:

- Treat `likedIds` as the long-term source of truth for Supabase active matches.
- Move backend match hydration in this slice.

Validation:

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- Mock mode: local fixture like/pass/super-like behavior still works.
- Supabase mode: one-sided real/dev likes do not become local active matches unless backend returns a reciprocal match.

### Slice 5: React Query Server-State Hooks

Status: implemented 2026-07-07.

Goal:

Move backend reads out of provider effects and into explicit query hooks.

Candidate files:

- `expo/hooks/api/use-matches.ts`
- `expo/hooks/api/use-chat-thread.ts`
- `expo/hooks/api/use-discovery.ts`
- optional query key helper: `expo/hooks/api/query-keys.ts`

Actions:

- Wrap existing `appServices` methods rather than calling Supabase directly from screens.
- Key queries by mode, profile id, match id, and relevant filters.
- Use `enabled` guards for auth/profile readiness.
- Use Realtime events to invalidate/refetch query keys instead of manually merging state where practical.
- Keep provider facade consuming these hooks only where React hook rules allow; otherwise migrate individual screens behind a feature-sliced hook.

Do not:

- Replace all provider backend hydration in one slice.
- Remove polling fallback until Realtime is proven stable.
- Change RLS/schema behavior.

Validation:

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- Supabase mode: sign in waits for backend profile, active matches, display profiles/photos, inbox summaries, thread snippets, and read state.
- Mock mode: app still runs without Supabase env vars.

### Slice 6: Screen Migration By Domain

Goal:

Move screens from `useProfile()` to focused domain hooks without changing visible UI.

Order:

1. Matches read path.
2. Inbox read path.
3. Match Detail read path and seen-state calls.
4. Chat thread/read/send path.
5. Discover/Fruit discovery and local fixture behavior.
6. Profile/safety/paywall/onboarding calls.

Actions:

- Keep each route migration as a separate PR-sized change.
- Use selectors so a chat update does not force unrelated discovery/matches rerenders.
- Preserve `ProtectedRoute` behavior until replacement bootstrap hooks are stable.

Do not:

- Convert all routes in one commit.
- Change product behavior while moving dependencies unless the slice explicitly targets that behavior.

Validation:

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- Targeted UAT for the migrated route.
- Regression UAT for sign-in, Matches, Inbox, Match Detail, Chat, Discover/Fruit, and sign-out after each larger route group.

### Slice 7: Backend-First Actions

Goal:

Make Supabase mode actions write backend-first or use bounded optimistic updates.

Targets:

- Like/pass/super-like.
- Match creation/hydration.
- Unmatch/block/report.
- Text message send/read.

Actions:

- Use existing service boundaries first.
- Only update local visible state optimistically when rollback/error behavior is explicit.
- Keep fixture/mock action behavior separate from real/dev backend profile behavior.

Validation:

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- Supabase DB tests for schema/RLS changes only:
  - `expo\node_modules\.bin\supabase db reset`
  - `expo\node_modules\.bin\supabase test db`
- Hosted UAT with at least two real/dev accounts.

### Slice 8: Provider Retirement

Goal:

Remove `ProfileProvider` only after it is no longer the runtime dependency for active routes.

Prerequisites:

- `rg "useProfile\\(" expo/app expo/components expo/hooks` returns no active route/component consumers, or only an intentionally temporary compatibility wrapper.
- Auth/profile/bootstrap hooks replace provider gating.
- Server state is query-backed.
- Client state is store-backed.
- Mock mode has explicit tests/UAT.

Actions:

- Remove `<ProfileProvider>` from `expo/app/_layout.tsx`.
- Delete or archive `expo/providers/profile-provider.tsx`.
- Remove dead local persistence wrappers only after migration paths are no longer needed.

Validation:

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- Full smoke/UAT:
  - Mock mode startup.
  - Supabase sign-in/profile bootstrap.
  - Matches/Inbox first render.
  - Android Chrome back from Match Detail and Chat.
  - Discovery/Fruit fixture behavior.
  - Reciprocal match and backend chat.
  - Safety flows.

## Part 3: React Query Control Flow Handover (Slice 5b)

Status: implemented 2026-07-08.

> [!WARNING]
> **To the executing agent (Codex):** The previous Slice 5 extraction created `useMatchesQuery` but left it neutered (`enabled: false`). It is currently being manually triggered by `ProfileProvider.refreshBackendMatches` inside `setInterval` loops. Execute the following steps to permanently hand over the background polling control flow to React Query and dismantle the manual loops.

### Step 1: Remove Manual Polling from `ProfileProvider`
- **[MODIFY] `expo/providers/profile-provider.tsx`**
  - Delete the `setInterval` block that triggers `refreshBackendMatches` based on `BACKEND_MATCH_REFRESH_INTERVAL_MS`.
  - Delete the `AppState.addEventListener` block that triggers `refreshBackendMatches` on app focus.

### Step 2: Native React Query Configuration
- **[MODIFY] `expo/hooks/api/use-matches.ts`**
  - Remove `enabled: false`. Allow the query to run natively when the `profileId` is present and the mode is `supabase`.
  - Add `refetchInterval: 10000` (10 seconds) to the `useQuery` config so React Query handles the background polling automatically.
  - Add `refetchOnWindowFocus: true` so React Query handles the AppState foregrounding automatically.

### Step 3: Extract Realtime Subscriptions
- **[NEW] `expo/hooks/api/use-match-realtime.ts`**
  - Move the Supabase Realtime subscription logic (`appServices.realtime.subscribeToMatchAndMessageChanges`) out of `ProfileProvider` and into this new hook.
  - Instead of calling `refreshBackendMatches()` on a socket event, this hook should simply call `queryClient.invalidateQueries({ queryKey: ["matches"] })`.

### Step 4: Isolate the Data Merge Algorithm
- **[MODIFY] `expo/providers/profile-provider.tsx` (or extract to a service)**
  - Move the complex merging of `useMatchesQuery.data` (which merges backend threads, Fruit profiles, and Mock modes into Zustand stores) out of the manual `refreshBackendMatches` function.
  - Instead, run this merge logic reactively inside a `useEffect` that listens for changes to `useMatchesQuery.data`, or preferably inside the `select` / `onSuccess` handlers of the React Query hook itself.

## Deprecated Items Removed From Active Plan

These items are no longer active instructions:

- Delete `ProfileProvider` during the first refactor pass.
- Add a Zustand auth store that duplicates `AuthProvider` session/user state.
- Convert all active screens to new stores/hooks in one slice.
- Treat local `likedIds` as the long-term Supabase active-match source of truth.
- Use manual Match-tab URL hash sentinels as the preferred navigation model.
- Use `bun run share`; the repo scripts are `bun run start`, `bun run start-web`, and `bun run start-web-dev`.

Historical rationale for these removed items is preserved in [Architecture Audit History](architecture-history.md).

## Current Recommended Next Step

Slices 2 through 6 and Slice 5b are implemented, and provider-internal cleanup has started with selector, prototype monetization, chat UI state, local conversation persistence, local chat simulation timing, backend match lookup, backend chat send/read action orchestration, Supabase discovery fixture filtering, React Query polling/realtime invalidation handover, and pure conversation helper extraction. Next, continue moving one small state domain at a time out of `ProfileProvider` without changing visible UI or mock/Supabase behavior.

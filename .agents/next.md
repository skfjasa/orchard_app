# Next Task

Human UAT for the order-dependent Android Chrome Match Detail browser-back fix.

## Milestone Context

This is still part of the inner-circle testing readiness path, not just an Android back-navigation bug. Supabase mode should authenticate, hydrate the current profile, hydrate active matches/profile display data/thread summaries/read state, and only then release the protected app tabs. Local/mock state should remain a fallback and demo mode, not the first visible source of truth for signed-in Supabase users.

Latest UAT narrowed the remaining issue: Match tab first passes, and Inbox conversation back first passes after a fresh sign-in, but doing Inbox first and then Match Detail in the same Android Chrome session repeatedly causes a blank white ~0.5-1 second reload/state gap. The URL stayed on `/matches` while Match Detail was visible and rows returned by themselves, so this is stale browser history behind an in-memory detail screen rather than missing backend rows. The current code re-enables web `popstate` normalization only for Match Detail, uses deterministic `router.replace` to the canonical tab destination, adds a Match-tab-only web hash sentinel (`/matches#match-...`) before opening detail, and awaits direct seen-match storage persistence before navigation so a transient page churn should not restore the opened match highlight/badge.

Use `docs/milestone-tracker.md` as the standardized milestone checklist. Keep it current whenever milestone status, blockers, or priority order changes.

## Likely Areas

- `expo/providers/profile-provider.tsx`
- `expo/services/`
- `expo/app/(tabs)/matches.tsx`
- `expo/app/(tabs)/inbox.tsx`
- `expo/app/(tabs)/fruit.tsx`
- `expo/app/(tabs)/discover.tsx`
- `expo/components/navigation/ProtectedRoute.tsx`
- `expo/hooks/use-canonical-back.ts`
- `expo/providers/profile-provider.tsx`
- `expo/app/match/[id].tsx`
- `expo/app/chat/[id].tsx`
- `expo/app/edit-profile.tsx`
- `expo/app/paywall.tsx`
- `expo/app/report.tsx`
- `expo/app/safety-legal.tsx`
- `docs/project-status.md`
- `docs/milestone-tracker.md`

## Pre-Edit Checks

- Inspect git status and latest commit.
- Use hosted Supabase mode with `t`, `tt`, and/or `test2`.

## Definition Of Done

- Device/browser back does not reveal protected app routes while auth/profile hydration is incomplete.
- Android hardware back from Chat returns to Inbox, matching the in-app chat back button.
- Cleared Match badges do not reappear after backend refresh unless there is a genuinely new match.
- Cleared Inbox badges/unread rows do not reappear after backend refresh unless there is a genuinely new unread incoming message.
- Real/dev profiles that are already matched do not appear in Fruit.
- Opening an unread Inbox row clears the badge before Chat navigation, so rapid device/browser back does not flash the old unread state.
- Real/dev matches remain visible after using device/browser back from match detail.
- Real/dev conversations remain visible after using device/browser back from a chat opened through Inbox.
- Match tab still shows real/dev matches after using device/browser back from a chat opened through Inbox.
- Slow or weak mobile network should show last-known-good Matches/Inbox rows instead of dropping real/dev rows.
- Generic "Orchard user" fallback profiles do not appear in Matches or Inbox after rapid back navigation.
- Match detail opened from Matches, Inbox, Discover, Fruit, or Chat has a canonical Android hardware-back destination and does not snap back onto the same detail modal.
- Match detail opens as a normal stack screen, not a root modal, so browser/device back should perform a normal pop.
- Matches and Inbox refresh backend match/profile data on focus, so Fruit/Discover should not be required to restore missing real/dev cards.
- Matches list still shows active matches after using back.
- Inbox list still shows conversations, unread row highlights, and unread tab badge counts after using back.
- Match detail and chat still open only when a profile and active match are loaded.
- Edit Profile, Paywall, Report, and Safety & Legal do not render signed-in-only content when profile state is missing.
- Mock mode and local fixture behavior still work.
- `docs/project-status.md` remains current after any material change.

## Validation

- `cd expo; bun run typecheck` passed for the cache-retention, web canonical-back, last-resolved profile fallback, provider-level transient-empty list guard, Supabase backend bootstrap gate, Match-detail-only hash-sentinel/replace-based browser-back fixes, and awaited seen-match persistence.
- `cd expo; bun run lint` passed for the cache-retention, web canonical-back, last-resolved profile fallback, provider-level transient-empty list guard, Supabase backend bootstrap gate, Match-detail-only hash-sentinel/replace-based browser-back fixes, and awaited seen-match persistence.
- `git diff --check` passed for the cache-retention, web canonical-back, last-resolved profile fallback, provider-level transient-empty list guard, Supabase backend bootstrap gate, Match-detail-only hash-sentinel/replace-based browser-back fixes, and awaited seen-match persistence.
- For schema/RLS changes only: `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db`

## Manual QA

1. Use hosted Supabase mode with account `t`.
2. Start from a fresh Android Chrome incognito tab after signing in.
3. Confirm the app stays on the loader/finalizing state until backend matches and inbox summaries are ready.
4. Open Inbox first, open one real/dev conversation, then immediately use Android device back or swipe-back.
5. Confirm Inbox returns normally and keeps all expected rows visible.
6. Without signing out or resetting incognito, open Matches, tap one real/dev match, then immediately use Android device back or swipe-back.
7. Confirm the URL shows `/matches#match-...` while the Match Detail is visible.
8. Confirm Android device/swipe back removes the hash and Matches returns with all expected rows visible immediately, without a blank white browser window, "No matches", or fixture-only state.
9. Confirm the opened match highlight clears and badge count updates correctly.
10. Repeat steps 6-9 for the other real/dev match.
11. Regression check the opposite order: fresh incognito sign-in, Match back first, then Inbox back.
12. Regression check desktop Chrome: browser back from Chat and Match Detail should still return to the expected tab route.
13. If it still fails, capture the exact route sequence, URL before/after device back, whether the hash appears while detail is visible, whether rows return without Fruit/Discover, and any visible instrumentation logs.

## UAT Failure Notes To Capture

- Account used.
- Exact route sequence.
- URL before pressing Android back.
- URL after Android back.
- Whether `/matches#match-...` appears while Match Detail is visible.
- Whether the opened match highlight/badge stays cleared even if the white flash remains.
- Whether the empty state says "No matches", "No conversations", fixture-only, or something else.
- Whether rows return by themselves, and how long it takes.
- Whether the blank state is about 0.5 seconds or longer.
- Whether visiting Fruit/Discover restores rows.
- Whether the issue happens only on first attempt after sign-in or on repeated attempts.
- Any visible console output if Android Chrome remote debugging is available.

## If UAT Fails

- Use the newly added instrumentation to inspect canonical browser back, protected-route state, backend profile bootstrap, `refreshBackendMatches`, `likedIds` application, conversation application, and protected-route release timing.
- If the hash does not appear, verify that the running bundle is current and that the detail was opened by tapping a Match-tab card, not via Inbox avatar/Chat/Discover/Fruit.
- Verify hosted SQL state for the affected accounts before assuming an app-side failure.

## Reprioritized Next Project Tasks

1. Finish Supabase source-of-truth session bootstrap for inner-circle testing: profile, active matches, display profiles/photos, inbox summaries, thread snippets, unread/read state, and block/unmatch visibility should load before tabs render.
2. Move seen-match/highlight state from local-only storage to backend-backed per-user state or explicitly decide it may remain device-local for the first inner-circle build.
3. Continue backend source-of-truth cleanup for actions: like/pass/super-like, match creation, unmatch/block/report, message send/read should either write backend-first or use clearly bounded optimistic updates.
4. Keep mock/Fruit behavior as demo/test mode, but isolate it from Supabase signed-in startup state.
5. After bootstrap/source-of-truth is stable, proceed to remaining MVP readiness: safety/moderation polish, account deletion/support/legal surfaces, analytics/crash reporting decisions, then iOS TestFlight preparation.

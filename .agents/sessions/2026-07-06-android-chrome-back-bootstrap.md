# 2026-07-06 - Android Chrome Back / Supabase Bootstrap Handoff

## Summary

This session focused on Supabase signed-in startup readiness and Android Chrome device/swipe-back behavior in hosted web UAT. The work moved from tab-level display patches toward the production direction: protected app entry now waits for backend profile plus first match/thread hydration, and the project now has a standardized milestone tracker.

## Code Changes

- Added `backendMatchesHydrated` bootstrap state in `expo/providers/profile-provider.tsx`.
- Root/protected/sign-in flows now wait for backend profile hydration and initial backend match/thread hydration before releasing signed-in app tabs in Supabase mode.
- Added last-resolved profile fallback and provider-level transient-empty list guards for Matches and Inbox.
- Added `expo/hooks/use-transient-empty-list.ts`.
- Added Match/Inbox focus refresh protection and instrumentation for protected-route/backend bootstrap debugging.
- Added Match Detail canonical web back support through `useCanonicalBack`.
- Match-tab cards mark matches seen before navigation.
- `markMatchSeen` now updates refs synchronously, persists directly to storage, and returns a promise.
- Match-tab navigation awaits durable seen-match persistence before opening Match Detail.
- Match-tab web navigation adds a `/matches#match-...` hash sentinel before opening Match Detail so Android Chrome has a local history entry to consume.

## UAT State

Confirmed by human UAT:

- Desktop Chrome passes.
- Android Chrome Inbox -> real/dev conversation -> immediate device/swipe-back is stable.
- Inbox read/highlight/badge state remains stable in that flow.
- Android Chrome Match-first flow has passed in some attempts.

Still failing before the final seen-persistence patch:

- Fresh incognito sign-in as `t`.
- Open Inbox first, open an already-read real/dev conversation, immediate swipe-back: Inbox remains stable.
- Go to Match, all 3 matches are highlighted.
- Open a real/dev Match Detail, immediate swipe-back.
- Browser shows blank white refresh for about 0.5-1 second.
- It returns to Match tab with all 3 profiles highlighted and Match badge at 3.

Latest code now separates two acceptance signals:

- Whether the white flash still happens.
- Whether the opened real/dev match now stays unhighlighted and Match badge drops from 3 to 2 after the awaited seen-match storage write.

## Next UAT

1. Fresh Android Chrome incognito.
2. Sign in as `t`.
3. Go to Inbox.
4. Open an already-read real/dev conversation.
5. Immediate Android device/swipe-back.
6. Confirm Inbox rows/highlights/badge are unchanged and stable.
7. Go to Match.
8. Confirm whether all 3 matches are highlighted at start.
9. Tap one real/dev match.
10. Confirm whether URL shows `/matches#match-...` while Match Detail is visible.
11. Immediate Android device/swipe-back.
12. Confirm whether the white flash still happens.
13. Confirm whether the opened real/dev match highlight clears and Match badge drops from 3 to 2.

## Validation

Passed after the final code patch:

- `cd expo; bun run typecheck`
- `cd expo; bun run lint`
- `git diff --check`

## Important Notes

- If the white flash remains but the opened match stays unhighlighted and badge decrements, the remaining bug is isolated to web route/history rendering.
- If the highlight/badge still resets, the awaited storage write is not completing before page churn or the running bundle is stale.
- If `/matches#match-...` does not appear while Match Detail is visible from Match-tab card press, verify the ngrok bundle is current and that the profile was opened through the Match tab, not Inbox avatar, Chat, Discover, or Fruit.
- Do not add more hydration guards until the browser route/history behavior is verified.

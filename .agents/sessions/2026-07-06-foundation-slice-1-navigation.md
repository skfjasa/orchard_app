# Session: Foundation Slice 1 Navigation Cleanup

Date: 2026-07-06

## Goal

Implement Slice 1 from `docs/repo-audit-and-foundation-plan.md`: remove Match Detail web history/hash workarounds while preserving native Android hardware-back behavior.

## Changed

- `expo/hooks/use-canonical-back.ts`
  - Removed web `popstate` handling and web-specific options.
  - Kept Android `BackHandler` logic.
- `expo/app/(tabs)/matches.tsx`
  - Removed `window.history.pushState` and `/matches#match-...` hash sentinel before Match Detail navigation.
  - Kept `await markMatchSeen(profileId)` before `router.push(...)`.
- `expo/app/match/[id].tsx`
  - Removed web-specific `useCanonicalBack` options.
- `docs/milestone-tracker.md`, `docs/project-status.md`, `.agents/current.md`, and `.agents/next.md`
  - Updated to record Slice 1 as implemented and awaiting targeted UAT.

## Validation

- `cd expo; bun run typecheck`: passed.
- `cd expo; bun run lint`: passed.
- `git diff --check`: passed.

## UAT Needed

Use `docs/milestone-tracker.md` current UAT loop:

1. Fresh Android Chrome incognito sign-in as `t`.
2. Open Inbox conversation first, back to Inbox.
3. Open a real/dev Match Detail from Matches, then immediate Android device/swipe back.
4. Confirm no `/matches#match-...` sentinel is required.
5. Confirm rows remain visible and opened-match highlight/badge stays cleared.

## Next

If UAT passes, mark Slice 1 accepted and move to foundation Slice 2: provider facade contract / responsibility inventory.

If UAT fails, capture exact route sequence, URLs before/after back, row/highlight behavior, whether rows return by themselves, and visible instrumentation logs.

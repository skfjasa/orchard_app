# Current Agent State

## Objective

Continue converting Orchard into an iOS-first Supabase-backed MVP while preserving mock mode and the existing prototype UI.

## Branch And Commit

- Branch: `main`
- Latest local checkpoint: `f964503` - Advance Supabase fixture chat flows
- Local branch is ahead of `origin/main` by 1 commit.

## Recent Changes

- Added Supabase fixture-backed discovery via `createSupabaseDiscoveryService`.
- Added fixture UUID reverse mapping for hosted fixture rows.
- Hydrated active hosted fixture matches and text threads back into local `likedIds` and conversations.
- Added a chat persistence repair path: when local chat is active but no hosted match exists, record the backend like once and use the returned match id.
- Wired profile-tab unmatch to the hosted `unmatch_match` RPC after local UI update.
- Fixed profile-tab sign-out routing so it clears auth/profile state and returns to `/onboarding`.
- Recovered the original generated onboarding background, vendored it as `expo/assets/images/welcome-background.png`, and used it on welcome, sign-in, and pending-confirmation screens.
- Updated `docs/project-status.md`.

## Validation State

- `bun run typecheck`: passed.
- `bun run lint`: passed.
- `git diff --check`: passed.
- Hosted browser UAT passed for fixture discovery, fixture like/match, hosted text persistence, sign-out/sign-in thread hydration, and hosted unmatch.

## Current Risks / Blockers

- Full hosted onboarding/photo confirmation smoke test is still pending and may be blocked by Supabase email rate limits/custom SMTP setup.
- Arbitrary real-user backend discovery/profile display is not wired yet; current Supabase discovery maps hosted fixture UUIDs back to local mock profiles.
- Chat UI still preserves local simulated/photo behavior; only real text messages are persisted/hydrated from Supabase.

## Likely Relevant Files

- `expo/providers/profile-provider.tsx`
- `expo/services/supabase-discovery-service.ts`
- `expo/services/supabase-chat-service.ts`
- `expo/services/supabase-match-service.ts`
- `expo/services/supabase-swipe-service.ts`
- `expo/constants/mock-profile-ids.ts`
- `expo/app/(tabs)/profile.tsx`
- `expo/app/onboarding/index.tsx`
- `expo/app/onboarding/sign-in.tsx`
- `expo/app/onboarding/pending-confirmation.tsx`
- `docs/project-status.md`

## Read Only If Needed

- `docs/session-handoff.md`
- `docs/backend-migration-plan.md`
- `docs/supabase-schema.md`
- `.agents/handoff.md`

## Next Recommended Task

Run the hosted onboarding/profile-photo confirmation smoke test, or continue backend source-of-truth work for arbitrary real-user discovery/profile display if email confirmation remains blocked.

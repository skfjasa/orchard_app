# Current Agent State

## Objective

Continue converting Orchard into an iOS-first Supabase-backed MVP while preserving mock mode and the existing prototype UI.

## Branch And Commit

- Branch: `main`
- Latest implementation checkpoint: `00df6be` - Support backend profile discovery display
- Previous checkpoint: `438bafa` - Advance Supabase fixture chat flows
- Session-close handoff records the backend profile display checkpoint; branch should be clean and synced with `origin/main`.

## Recent Changes

- Added Supabase fixture-backed discovery via `createSupabaseDiscoveryService`.
- Added fixture UUID reverse mapping for hosted fixture rows.
- Hydrated active hosted fixture matches and text threads back into local `likedIds` and conversations.
- Added a chat persistence repair path: when local chat is active but no hosted match exists, record the backend like once and use the returned match id.
- Wired profile-tab unmatch to the hosted `unmatch_match` RPC after local UI update.
- Fixed profile-tab sign-out routing so it clears auth/profile state and returns to `/onboarding`.
- Recovered the original generated onboarding background, vendored it as `expo/assets/images/welcome-background.png`, and used it on welcome, sign-in, and pending-confirmation screens.
- Hosted onboarding/profile-photo confirmation smoke passed. Expected browser behavior: after the pending-confirmation page, opening the email link in a new tab creates a new authenticated app tab on Discover; the original pending-confirmation tab remains idle.
- Added arbitrary backend profile discovery/display support in Supabase mode: discovery loads real `profiles`, `profile_members`, and `profile_photos`, signs stored photos, remembers service-returned profiles, and uses remembered/backend match profiles in match detail, chat, matches, and inbox before falling back to fixtures.
- Updated `docs/project-status.md`.

## Validation State

- `bun run typecheck`: passed.
- `bun run lint`: passed.
- `git diff --check`: passed.
- Hosted browser UAT passed for fixture discovery, fixture like/match, hosted text persistence, sign-out/sign-in thread hydration, and hosted unmatch.
- Hosted browser UAT passed for onboarding/profile-photo confirmation and hydration.
- Browser UAT is still pending for arbitrary real-user backend discovery/profile display with at least two hosted non-fixture profiles.

## Current Risks / Blockers

- Arbitrary real-user backend discovery/profile display is implemented locally but still needs hosted browser UAT.
- Chat UI still preserves local simulated/photo behavior; only real text messages are persisted/hydrated from Supabase.
- Supabase Auth email sender/template branding still requires custom SMTP setup if branded emails are needed.

## Likely Relevant Files

- `expo/providers/profile-provider.tsx`
- `expo/services/supabase-discovery-service.ts`
- `expo/services/supabase-chat-service.ts`
- `expo/services/supabase-match-service.ts`
- `expo/services/supabase-swipe-service.ts`
- `expo/services/supabase-profile-service.ts`
- `expo/constants/mock-profile-ids.ts`
- `expo/app/(tabs)/profile.tsx`
- `expo/app/(tabs)/discover.tsx`
- `expo/app/(tabs)/matches.tsx`
- `expo/app/(tabs)/inbox.tsx`
- `expo/app/match/[id].tsx`
- `expo/app/chat/[id].tsx`
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

Browser-test arbitrary real-user backend discovery/profile display with at least two hosted non-fixture profiles. If that cannot be tested yet, continue the next backend source-of-truth slice for chat reads/inbox and message attachments.

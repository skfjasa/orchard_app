# Current Agent State

## Objective

Continue converting Orchard into an iOS-first Supabase-backed MVP while preserving mock mode and the existing prototype UI.

## Branch And Commit

- Branch: `main`
- Latest pushed implementation checkpoint: `f81b17e` - Stabilize match hydration and highlights
- Previous implementation checkpoint: `f283877` - Fix real profile match and photo UAT gaps

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
- User UAT confirmed real non-fixture backend profiles can appear in Discover and open detail screens.
- Current working fix changes Supabase likes/super-likes so real non-fixture profiles do not become local matches unless the Supabase swipe RPC returns `matched: true`; detail screens now show "Like sent" / "Super Like sent" for non-reciprocal likes.
- Current working fix also prunes stale local Supabase matches/conversations during backend match hydration, and Supabase chat sends append locally only after a backend active match/message insert succeeds.
- Current working migration `202607040001_profile_photo_visible_storage_reads.sql` lets eligible viewers sign visible profile photo storage objects, matching the existing `profile_photos` row visibility policy.
- Current working migration `202607040002_active_match_profile_reads.sql` lets active matched users read each other's profile/member/photo rows and sign matched profile photo objects after discovery/swipe state changes.
- Hosted UAT confirmed backend reciprocal matches/messages hydrate after sign-out/sign-in.
- Current working UI fix: Matches badge uses explicit new-match state and decrements when each matched profile detail is viewed; Inbox badge counts total unread messages; unread Inbox rows are highlighted with per-row count badges and clear when opened/read; Matches cards open profile detail; Inbox avatar opens profile detail; Chat header avatar/name opens profile detail.
- Latest UAT follow-up found hosted rows were present for dev profiles `t`, `tt`, and `test2` (3 active matches, 2 messages), so the empty Matches/Inbox symptom was app hydration/display-side. The current fix keeps backend matches visible even if auxiliary profile member/photo loading fails and highlights unopened new match cards in Matches.
- Follow-up visual issue: `/onboarding` background image no longer appears maximized across the whole viewing space compared with the pre-decoupling Rork rendering.

## Validation State

- `bun run typecheck`: passed.
- `bun run lint`: passed.
- `git diff --check`: passed.
- Hosted SQL check after three-way dev UAT showed 3 active matches and 2 messages persisted for `t`, `tt`, and `test2`.
- Hosted browser UAT passed for fixture discovery, fixture like/match, hosted text persistence, sign-out/sign-in thread hydration, and hosted unmatch.
- Hosted browser UAT passed for onboarding/profile-photo confirmation and hydration.
- Real-profile UAT found and the current working slice addresses: false auto-match on one-sided real likes, stale local-only A-side conversations from earlier UAT, misleading chat availability before reciprocal match, and visible profiles showing default/fallback photos instead of uploaded photos.
- `expo\node_modules\.bin\supabase db reset`: passed after storage policy migration.
- `expo\node_modules\.bin\supabase test db`: passed, 1 file / 42 tests.
- Hosted `orchard-dev` is aligned through `202607040002` after `supabase db push`; migration list confirms local/remote alignment. A follow-up dry-run check timed out once after the push, but migration list showed the migration applied.

## Current Risks / Blockers

- Latest real-profile UAT fixes are implemented, pushed, and ready for browser retest.
- Backend match/message rows are persisting for the three dev profiles, but app-side hydration/display needs browser retest after `f81b17e`.
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
- `supabase/migrations/202607040001_profile_photo_visible_storage_reads.sql`
- `supabase/migrations/202607040002_active_match_profile_reads.sql`
- `supabase/tests/database/202606200001_mvp_security.sql`
- `docs/project-status.md`

## Read Only If Needed

- `docs/session-handoff.md`
- `docs/backend-migration-plan.md`
- `docs/supabase-schema.md`
- `.agents/handoff.md`

## Next Recommended Task

Retest UI navigation, match hydration, new-match highlights, and Inbox badge behavior around the existing `t`/`tt`/`test2` hosted rows, then address the `/onboarding` background sizing regression.

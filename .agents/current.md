# Current Agent State

## Objective

Continue converting Orchard into an iOS-first Supabase-backed MVP while preserving mock mode and the existing prototype UI.

## Branch And Commit

- Branch: `main`
- Latest implementation checkpoint: Persist backend chat read state
- Previous pushed checkpoint: `58bf101` - Bank realtime UAT

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
- Account-switching follow-up found hosted rows still persisted for `t`, `tt`, and `test2` (3 active matches, 4 messages). Current fix awaits Supabase sign-out before routing, clears in-flight match hydration on session reset, and rejects match hydration if the Supabase client auth user does not match the profile being hydrated.
- Latest live-update follow-up found matches/messages could appear only after a swipe triggered provider movement. Backend match/thread hydration now refreshes immediately after sign-in, every 10 seconds while signed in, and whenever the app returns to active, so Matches/Inbox no longer depend on user actions to pull hosted state.
- Current UAT fix restores Fruit/testing behavior: Fruit mixes backend-discovered real/dev profiles with static Fruit fixtures, Fruit likes run through in-tab app UI, static Fruit fixtures auto-match locally for testing, and profile-detail one-sided likes use app overlays instead of browser alerts.
- Current UAT fix also persists read watermarks and seen-match ids per signed-in profile in local storage, so read Inbox rows and opened match highlights stay cleared across sign-out/sign-in until new backend activity arrives.
- Fixture/mock chat simulation now keeps local auto-replies for mock profiles even in Supabase mode, while real backend-only profiles stay backend-driven.
- Latest follow-up fix makes Fruit request the full backend testable pool, keeps backend profiles visible in Fruit even after prior swipes, preserves local-only Fruit fixture matches/conversations across backend refresh, and clears fixture unread counts when new mock replies arrive while the chat is already open.
- Current follow-up fix separates hosted mock fixture rows from real/dev backend profiles in Fruit, keeps local-only Fruit fixture new-match state during backend refresh, loads backend matches oldest-to-newest so new matches land at the bottom of Matches, and prevents fixture text sends from showing a duplicate local/backend echo.
- User UAT confirmed the Fruit real/dev visibility, Fruit fixture in-app match behavior, real/dev one-sided Fruit like behavior, highlighted match detail open, opened-match persistence, read Inbox persistence, fixture single-send/simulated-reply behavior, and match/inbox badge behavior now pass.
- Follow-up visual issue: `/onboarding` background image no longer appears maximized across the whole viewing space compared with the pre-decoupling Rork rendering.
- Current working fix gives the welcome, sign-in, and pending-confirmation onboarding roots explicit web viewport height and full-size background image dimensions while keeping the recovered local background asset and existing content intact.
- Current working cleanup removes the original Rork-era sign-in screen header override so the onboarding layout's headerless `sign-in` route applies and the blank white header strip above "Welcome back" disappears.
- User UAT confirmed the onboarding background sizing and sign-in header cleanup look correct.
- Current working backend hardening slice adds a Realtime service boundary, a mock no-op realtime adapter, Supabase match/message Realtime subscriptions, and migration `202607040003_enable_match_message_realtime.sql` to publish `public.matches` and `public.messages`.
- Backend match/thread hydration still runs immediately after sign-in, on app-active, and every 10 seconds as a fallback; Realtime now triggers a debounced refresh when active matches change or a message is inserted into a currently known active match.
- User UAT confirmed Realtime-triggered match/message refresh using `t` as profile A and both `tt` and `test2` as profile B accounts for matching and sending.
- Current working backend read-state slice adds `public.match_read_states` with RLS, extends `ChatService.getThread` with `readThrough`, implements Supabase `markRead`, and lets backend match/thread hydration prefer the hosted read watermark while retaining local watermarks as fallback/mock behavior.
- User UAT confirmed backend-backed read state: opening an incoming hosted message clears unread state, sign-out/sign-in keeps the conversation read, and a newer incoming message restores the unread badge/highlight.
- Current working read-path cleanup adds provider-level derived selectors for matched profiles, inbox rows, profile lookup, conversation lookup, active-match checks, and tab badge counts. Matches, Inbox, chat, match detail, and tab layout now consume those selectors instead of rebuilding raw `likedIds`/`conversations`/`knownProfiles` reads in each screen.
- User UAT confirmed the read-path selector cleanup with profile `t`.
- Follow-up issue: using the device/browser back button can inconsistently show missing conversations, reset badges, or make matches appear to disappear. Current working fix adds auth/profile hydration guards to the tab layout, chat route, and match-detail route so stale history entries cannot render protected app screens while the signed-in profile is missing or still loading.

## Validation State

- `bun run typecheck`: passed.
- `bun run lint`: passed.
- `git diff --check`: passed.
- Onboarding background sizing fix passed typecheck, lint, diff check, and browser visual UAT.
- Sign-in header cleanup passed typecheck, lint, diff check, and browser visual UAT.
- Hosted SQL check after three-way dev UAT showed 3 active matches and 2 messages persisted for `t`, `tt`, and `test2`.
- Hosted SQL check after account-switching UAT showed the same 3 active matches plus 4 messages persisted for `t`, `tt`, and `test2`.
- Backend match/thread refresh loop added after live-update UAT: immediate + 10-second interval + app-active refresh.
- Fruit profile wiring, local fixture auto-match, mock auto-reply restoration, per-user read watermarks, per-user seen-match persistence, Fruit real/dev visibility, local-only Fruit fixture match preservation, match chronological ordering, fixture duplicate-send prevention, and in-open-chat fixture read clearing passed browser UAT.
- Hosted browser UAT passed for fixture discovery, fixture like/match, hosted text persistence, sign-out/sign-in thread hydration, and hosted unmatch.
- Hosted browser UAT passed for onboarding/profile-photo confirmation and hydration.
- Real-profile UAT found and the current working slice addresses: false auto-match on one-sided real likes, stale local-only A-side conversations from earlier UAT, misleading chat availability before reciprocal match, and visible profiles showing default/fallback photos instead of uploaded photos.
- `expo\node_modules\.bin\supabase db reset`: passed after storage policy migration.
- `expo\node_modules\.bin\supabase test db`: passed, 1 file / 42 tests.
- Realtime migration `202607040003_enable_match_message_realtime.sql`: local `supabase db reset` passed and local `supabase test db` passed, 1 file / 42 tests.
- Read-state migration `202607040004_match_read_states.sql`: local `supabase db reset` passed and local `supabase test db` passed, 1 file / 45 tests.
- Hosted `orchard-dev` is aligned through `202607040004` after `supabase db push`; migration list confirms local/remote alignment. The Supabase CLI again printed a non-fatal pg-delta catalog-cache warning after the push.
- Hosted browser UAT passed for Realtime-triggered incoming match/message refresh with `t`/`tt` and `t`/`test2`.
- Read-path selector cleanup passed typecheck, lint, and diff check.
- Protected-route back-history guard passed typecheck, lint, and diff check.

## Current Risks / Blockers

- Chat UI still preserves local simulated/photo behavior; only real text messages are persisted/hydrated from Supabase.
- Remaining backend source-of-truth cleanup should continue behind service boundaries and preserve mock mode.
- Supabase Auth email sender/template branding still requires custom SMTP setup if branded emails are needed.

## Likely Relevant Files

- `expo/providers/profile-provider.tsx`
- `expo/services/supabase-discovery-service.ts`
- `expo/services/supabase-chat-service.ts`
- `expo/services/supabase-match-service.ts`
- `expo/services/realtime-service.ts`
- `expo/services/supabase-realtime-service.ts`
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
- `supabase/migrations/202607040003_enable_match_message_realtime.sql`
- `supabase/migrations/202607040004_match_read_states.sql`
- `supabase/tests/database/202606200001_mvp_security.sql`
- `docs/project-status.md`

## Read Only If Needed

- `docs/session-handoff.md`
- `docs/backend-migration-plan.md`
- `docs/supabase-schema.md`
- `.agents/handoff.md`

## Next Recommended Task

Smoke UAT the device/browser back-history guard: after navigating among Matches, Inbox, profile detail, and chat, use the device/browser back button and confirm protected app routes do not render missing matches, missing conversations, or reset badge state while profile hydration catches up.

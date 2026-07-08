# Project Status

Last updated: 2026-07-08

## Current Repo State

- Repo: `skfjasa/orchard_app`
- Handoff checkpoint: 2026-06-21 auth confirmation route fix, discovery service wiring, and safety DB/RLS test hardening
- App code: `expo/`
- Runtime: Expo React Native with Expo Router and TypeScript
- Package manager: Bun
- Backend: Supabase client, email/password auth wiring, hosted profile/member persistence, Supabase Storage-backed profile photo upload, hardened schema/RLS/RPC draft with single/couple profile member support, initial Supabase service adapters, backend/mock service factory, gated swipe persistence hook, and hosted `orchard-dev` project linked/applied through migration `202606200002`; discovery/matching/chat behavior is not fully backend source-of-truth yet
- Persistence: local `AsyncStorage`
- Checks: `bun run typecheck`, `bun run lint`, `expo\node_modules\.bin\supabase db reset`, and `expo\node_modules\.bin\supabase test db`
- CI: GitHub Actions workflow `.github/workflows/expo-checks.yml` runs `bun install --frozen-lockfile`, `bun run typecheck`, and `bun run lint` from `expo/` on pushes to `main` and pull requests. Manual workflow `.github/workflows/supabase-db-tests.yml` starts local Supabase, resets the database, and runs `supabase test db`.
- Branch: `main`
- MVP monetization: disabled
- Local Docker: Docker Desktop is operational after enabling firmware virtualization. `docker version` reports Docker Desktop with a Linux engine, and WSL default distribution is `docker-desktop`.
- Handoff procedure: global `handoff sync` / `session handoff` behavior is being recorded in global/workspace instructions and Orchard-specific docs.
- Active legacy-generator toolchain coupling has been removed: app scripts now call Expo CLI directly, Metro uses the default Expo config, app scheme/package identifiers are Orchard-specific, generator metadata has been removed, and onboarding backgrounds use bundled Orchard assets instead of externally hosted generated image URLs.
- Standardized milestone tracking now lives in `docs/milestone-tracker.md`; use it as the concise release/milestone checklist while this file remains the running narrative status log.
- Active foundation refactor plan now lives in `docs/repo-audit-and-foundation-plan.md`. It replaces the one-pass provider deletion idea with PR-sized extraction slices and preserves older audit context in `docs/architecture-history.md`.

## Latest Foundation Commits

- `5723aed` - Refresh handoff after fixture checkpoint
- `00df6be` - Support backend profile discovery display
- `438bafa` - Advance Supabase fixture chat flows
- `aa5dae7` - Stabilize onboarding and fixture match flow
- `ce27578` - update docs
- `1f0f211` - Track GitHub Actions Node warning
- `e4695be` - Record CI workflow validation
- `0bc2ffd` - Improve auth confirmation flow and add CI checks
- `a52ce0e` - Mark handoff commits pushed
- `06f0a9c` - Refresh handoff after auth resume work
- `19f3a05` - Resume onboarding after email confirmation
- `d840619` - Fix Supabase signup redirect handling
- `01952d5` - Record hosted storage verification
- `8cc71a0` - Refresh photo storage status docs
- `6100fc5` - Add Supabase profile photo storage
- `e87e9f0` - Wire Supabase auth and profile persistence
- `1be95cd` - Add Gemini project review
- `b9110df` - Record MVP decisions and handoff context
- `034e254` - Enforce active match for local sends
- `b56039c` - Guard chat behind active local matches
- `2834c55` - Add report reason details flow
- `e9bff32` - Configure legal and support links
- `5424577` - Add onboarding age and legal gate
- `e402633` - Add initial safety and legal surfaces
- `915bc88` - Verify local Supabase database tests
- `a29e3c4` - Harden Supabase MVP migration
- `2b73a97` - Document status report shortcut
- `3a39dbc` - Refresh session handoff context
- `f9859fa` - Gate swipe persistence through backend service factory
- `8d1c023` - Add backend/mock service factory
- `525df94` - Add Supabase swipe, match, and safety service adapters
- `9cf5b94` - Add core Supabase matching and safety RPC drafts
- `9422c3a` - Draft initial Supabase schema and RLS
- `c4a4efb` - Add auth/session provider foundation
- `a4f57ea` - Add env-gated Supabase client skeleton
- `3efd74a` - Update provider architecture status
- `4ad31ef` - Demo-enable monetizable features without MVP paywalls
- `b5aa1d0` - Extract local profile mutation helpers
- `4a214e6` - Extract local monetization helpers
- `b699432` - Extract local interaction helpers
- `cb19b2b` - Extract local profile storage service
- `95069ee` - Fix existing lint issues
- `53981d9` - Add mock service adapters
- `eeec50f` - Add service interface skeletons
- `13f7df9` - Document profile provider responsibilities
- `b39368e` - Add project operating layer

## What Is Done

- Project operating docs and repo audit exist.
- `.env.example` exists under `expo/`.
- Typecheck script exists.
- Service interfaces and mock adapters exist.
- The Discover deck now gets candidate profiles through `DiscoveryService` with explicit viewer/exclusion inputs instead of directly ranking `MOCK_PROFILES` in the screen.
- The Discover screen now shows an in-app match confirmation after local likes/super-likes create a prototype match, and the tab bar shows badge counts for new/unread local match conversations.
- Inbox list rendering now tolerates missing/older saved conversation message data instead of letting a malformed local conversation crash the tab.
- Dev fixture profiles are now supported as real Supabase backend rows marked with `profiles.is_test_fixture`; real users who like fixture profiles through the swipe RPC receive an immediate dev/test match, while fixture profiles do not need to run the app.
- `user_settings` rows are now created/backfilled from profile data at the database layer and also written during Supabase profile completion.
- `ProfileProvider` no longer owns direct `AsyncStorage` calls.
- Local swipe/chat/message simulation helpers are extracted.
- Local monetization calculations are extracted.
- Local profile mutation helpers are extracted.
- `docs/project-status.md` is the running status/context/plan tracker.
- Monetization is explicitly out of scope for the feedback MVP.
- Monetizable features should be demoable without payment walls when monetization is disabled.
- Existing and possible future monetization surfaces are tracked in `docs/monetization-candidates.md`.
- Supabase dependency and env-gated client skeleton exist.
- Auth/session provider foundation exists and defaults to mock mode when Supabase env vars are absent.
- Initial Supabase schema/RLS migration draft exists.
- Draft RPCs exist for reciprocal swipe matching, unmatch, and block behavior.
- Supabase service adapters exist for swipe, match, safety, discovery, profile, storage, Realtime, and chat behavior in varying degrees. Some source-of-truth cleanup remains, especially around backend-first actions and mock/Supabase separation.
- Backend/mock service factory exists and exposes per-service capabilities so partial Supabase support is explicit.
- `ProfileProvider` can now call the swipe service factory as a non-blocking persistence hook when Supabase mode has a real authenticated profile id. Local state remains the UI source of truth.
- Supabase hardening is tracked in `docs/supabase-hardening-plan.md`.
- The initial Supabase migration draft has been hardened with authenticated-only RLS policies, private eligibility helpers, column-scoped profile/photo grants, RPC-only report/account-deletion writes, actor eligibility checks for swipes/messages, and the missing account deletion `reason` column.
- The Supabase safety adapter now uses RPCs for report and account deletion requests so actor identity is derived server-side.
- Supabase CLI is installed as an Expo dev dependency (`supabase@2.107.0`), and local Supabase config exists at `supabase/config.toml`.
- Hosted Supabase dev project `orchard-dev` exists at project ref `cvvavwuksygahezzhmqp`.
- Initial pgTAP-style database/RLS tests exist at `supabase/tests/database/202606200001_mvp_security.sql` and pass locally.
- Docker Desktop was installed manually during the 2026-06-20 session and is now operational after firmware virtualization was enabled.
- Diagnostics captured after enabling virtualization on 2026-06-20: AMD Ryzen 5 5600X, `VirtualizationFirmwareEnabled: True`, `HypervisorPresent: True`, Docker Desktop server running Docker Engine 29.5.3 on Linux, WSL default distribution `docker-desktop`, WSL default version 2.
- The first database test run exposed pgTAP assertion argument mistakes, which were fixed in `supabase/tests/database/202606200001_mvp_security.sql`; the suite then passed 19/19.
- Initial in-app Safety & Legal surface exists at `expo/app/safety-legal.tsx`, linked from Profile.
- Profile detail and chat now expose report/block actions; chat also exposes unmatch and report-message actions. These use the existing safety service boundary and preserve mock mode.
- Report profile and report message actions now open a reason/details form before submitting through the safety service.
- Account deletion can be requested from the Safety & Legal screen; the local flow records the request through the safety service and signs out.
- Direct chat routes and local message/photo send helpers now require an active local match before showing or writing conversation content.
- Onboarding now includes a pre-profile age/legal gate for 18+ confirmation, MVP terms, privacy notice, and community standards acceptance. Acceptance is stored on the local prototype profile.
- Safety/legal links and support contact are env-configurable through `EXPO_PUBLIC_PRIVACY_POLICY_URL`, `EXPO_PUBLIC_TERMS_URL`, `EXPO_PUBLIC_COMMUNITY_STANDARDS_URL`, `EXPO_PUBLIC_SUPPORT_EMAIL`, `EXPO_PUBLIC_SUPPORT_URL`, and `EXPO_PUBLIC_ACCOUNT_DELETION_URL`.
- Historical MVP prototype gap assessment has been consolidated into `docs/milestone-tracker.md` and `docs/architecture-history.md`.
- Product/release decisions recorded: app name `Orchard`, iOS bundle ID `com.orchardapp.ios`, Supabase dev project `orchard-dev`, production project later `orchard-prod`, Supabase region East US (North Virginia) / `us-east-1`, and placeholder public legal/support URLs under `https://yourdomain.com`.
- Historical project review findings have been consolidated into `docs/architecture-history.md`.
- The Supabase migration now includes `profile_members` and requires `profile_photos.member_id` to reference a member on the same profile, resolving the review's blocking single/couple schema mismatch before hosted dev apply.
- After a local Supabase database reset to apply the edited migration, `expo\node_modules\.bin\supabase test db` passes: 1 file, 22 tests.
- The local Supabase CLI was linked to hosted `orchard-dev`, `supabase db push --dry-run` showed one pending migration, and `supabase db push` applied `202606190001_initial_mvp_schema.sql`.
- `supabase migration list` shows local and remote migration `202606190001` aligned.
- Supabase Dashboard verification confirmed the hosted Orchard tables exist, RLS is enabled on public Orchard tables, and `supabase_migrations.schema_migrations` contains `202606190001`.
- CLI post-apply dry-run verification was temporarily blocked by Supabase's remote auth circuit breaker after failed temporary-role auth attempts; dashboard verification completed the hosted setup check.
- Real Supabase email/password auth is now wired into sign-in and final onboarding completion when Supabase env vars are present.
- Supabase signup now passes an app redirect URL for confirmation emails. On web, it defaults to the current browser origin plus `/onboarding/sign-in`; `EXPO_PUBLIC_AUTH_REDIRECT_URL` can override it. The Supabase client detects auth sessions from web confirmation URLs.
- If hosted Supabase requires email confirmation and signup returns a user id without a session, the app now saves a pending onboarding profile locally without local credentials. After the confirmation link returns with a session, `ProfileProvider` resumes backend profile/member/photo persistence. Web-selected onboarding photos are stored as data URIs for this pending-confirmation path so they are not lost when the browser opens a new tab.
- The auth provider now explicitly processes Supabase confirmation callback URLs on web, including both hash-token and `?code=` callback formats, and routes authenticated users through the root loader while pending profile restoration completes instead of restarting onboarding.
- A dedicated pending-confirmation screen now appears after Supabase accepts signup but requires email confirmation, and Supabase email rate-limit / unconfirmed-email errors are mapped to user-readable messages.
- The sign-in screen now waits for profile/backend hydration after a confirmation callback before routing, shows a finalizing state while pending profile persistence runs, and the welcome screen's existing-account action uses normal navigation to reach sign-in.
- Successful Supabase email/password sign-in now stays on the sign-in screen while profile hydration runs instead of immediately routing through `/`, avoiding the stale no-profile redirect back to onboarding.
- The profile provider now resets backend profile hydration when a Supabase user/session changes, so manual email/password sign-in from the pending-confirmation page or existing-account path retries backend/pending profile restoration instead of immediately bouncing to the onboarding start.
- Pending onboarding profile restore can now recover when the local draft id does not exactly match the confirmed Supabase user id, as long as the saved draft owner email matches the signed-in Supabase email; the draft id is rewritten to the authenticated user id before persistence.
- Signed-in Supabase users with no Orchard profile are now routed into the prototype-aligned profile setup flow at account type, not the generic welcome/sign-in loop. Legal acceptance is enforced as a gate before basics when needed, then setup continues through the original account type/basics/identity/interests/preferences/photos path.
- For existing-auth profile setup, the basics step pre-fills the Supabase email and skips local username/password requirements because auth already exists.
- The final onboarding step now saves the full pending Orchard profile draft before Supabase signup sends an email confirmation, updates the pending draft with the returned Supabase user id, and no longer requires a password when completing profile setup for an already signed-in Supabase account.
- Supabase profile persistence now avoids mobile-client `upsert` for `profiles`, `profile_members`, and `profile_photos`; it uses owner-scoped insert with unique-conflict update fallback to match the hardened column grants/RLS policies.
- The sign-in screen includes a development-only local test data reset control that signs out, clears local prototype profile state, and clears pending onboarding state for cleaner auth smoke tests.
- Initial GitHub Actions CI now covers Expo dependency install, typecheck, and lint. A separate manual Supabase DB test workflow exists for migration/RLS checks.
- GitHub Actions validation on 2026-06-21:
  - `Expo Checks` passed on push for commit `0bc2ffd`.
  - Manual `Supabase DB Tests` run `27895063423` passed in 4m05s, including local Supabase start, database reset, and `supabase test db`.
  - Follow-up resolved locally: both workflows now use `actions/checkout@v6`, replacing the older `actions/checkout@v4` usage that produced the Node 20 warning.
- In Supabase mode, the root route requires an active Supabase session before entering the tab app.
- Final onboarding creates a Supabase auth user first and uses the Supabase user id as the local prototype profile id when a session is returned.
- Profile/account-deletion sign-out now clears both local prototype state and the Supabase auth session.
- A Supabase `ProfileService` now persists onboarding/profile rows to `profiles` and `profile_members`, and the provider can hydrate a signed-in user's local prototype profile from those backend rows.
- A Supabase `StorageService` now uploads selected local profile photos to the private `profile-photos` bucket, writes `profile_photos` rows with `member_id`, and hydrates signed photo URLs for the current profile.
- New local migration `202606200002_profile_photo_storage.sql` creates the private storage bucket, owner-scoped storage object policies, and the `profile_photos(profile_id, member_id, sort_order)` unique constraint needed for metadata upserts.
- After the storage migration, `expo\node_modules\.bin\supabase db reset` and `expo\node_modules\.bin\supabase test db` pass locally: 1 file, 25 tests.
- Safety/moderation database tests now cover report-message ownership checks, reported message id persistence, unmatch message blocking, blocked-profile discovery hiding in both directions, blocked-match message hiding, and direct account-deletion insert denial. Local `expo\node_modules\.bin\supabase test db` passes: 1 file, 35 tests.
- After wiring the Discover deck through `DiscoveryService`, local `bun run typecheck` and `bun run lint` pass from `expo/`.
- After adding local match confirmation, match/inbox tab badges, and Inbox row hardening, local `bun run typecheck` and `bun run lint` pass from `expo/`.
- After adding dev fixture profile support and default user settings, local `expo\node_modules\.bin\supabase db reset` passes, `expo\node_modules\.bin\supabase test db` passes with 38 tests, and hosted `orchard-dev` was migrated/seeded with 22 fixture profiles, 30 fixture members, and 22 fixture settings.
- Hosted `orchard-dev` verification after backfill reports 23 total profiles, 22 fixture profiles, and 23 `user_settings` rows.
- Post-decoupling verification on 2026-07-03: `bun run typecheck` passed, `bun run lint` passed, `git diff --check` passed, and `bun run start-web` served the app through Expo CLI at `http://localhost:8081`. The legacy-generator reference scan returned no matches. Browser UAT confirmed the app loads, sign-in works, Discover loads, fixture likes work through the visible UI, the match confirmation modal appears, Matches/Inbox badges update, Inbox opens cleanly, a conversation opens, in-screen chat back returns to Inbox, the three-dot safety menu opens, local text send works, local photo attach/send works, Cancel closes the safety menu, Report profile submits without crashing, Block profile returns to Inbox/removes the conversation, and Unmatch removes the conversation. Hosted SQL verification confirmed a fresh `swipes` row from the fixture-like test; `matches` rows exist for fixture matches, but no fresh match timestamp appeared for the retested pair, likely because an existing pair row suppresses rematch timestamps. Text/photo chat sends are still local-only and should not be expected in hosted `messages` yet.
- The chat route now avoids an Expo Router web maximum-update loop by rendering its own in-screen header/actions instead of setting native stack options from the route. Chat read marking now avoids no-op persistence writes, preventing a second TanStack Query update loop when returning from chat.
- The Supabase safety adapter now maps seeded mock fixture ids to backend profile UUIDs for Report profile and Block profile RPC calls, matching the existing swipe adapter behavior. Block was retested against a sacrificial fixture conversation and passed.
- Rematch timestamp/state semantics were fixed in migration `202607030001_rematch_active_match_history.sql`: inactive match history is preserved, only one active match per user pair is allowed, and a later rematch creates a fresh active match row with a fresh `created_at`. The migration was applied to hosted `orchard-dev`; follow-up dry run reports the remote database is up to date and migration list shows local/remote aligned through `202607030001`.
- After the rematch migration, local `expo\node_modules\.bin\supabase db reset` passed and local `expo\node_modules\.bin\supabase test db` passed: 1 file, 41 tests.
- Supabase-mode discovery now uses a `createSupabaseDiscoveryService` adapter for hosted fixture eligibility: the backend/RLS decides which seeded fixture profile ids are discoverable, then the adapter maps those fixture UUIDs back to existing local mock profile objects so current Discover, match detail, chat, and mock-mode UI behavior remain stable.
- Supabase discovery can now return arbitrary real backend profiles as app `Profile` objects by loading `profiles`, `profile_members`, and `profile_photos` through RLS and signing discovered photo URLs. Seeded fixture profiles still map back to the richer local mock cards.
- Discovery remembers service-returned profiles in `ProfileProvider`, and match detail, chat, matches, and inbox screens now look up remembered backend profiles before falling back to `MOCK_PROFILES`.
- Supabase match listing now attaches the other profile where RLS allows it, so hosted real-user matches can hydrate profile data into local match/thread state after sign-in.
- Real-profile UAT confirmed non-fixture hosted profiles can appear in Discover and open detail screens, but exposed three backend-source-of-truth gaps: one-sided likes were still creating local match/chat UI, sign-out/sign-in did not restore those false local matches/messages because no backend reciprocal match existed, and other users' uploaded photos fell back to the default image.
- Supabase-mode likes and super-likes now wait for the `create_swipe` RPC result before creating local active match/chat state. One-sided real-profile likes are recorded as swipes only; only `matched: true` activates local match UI. Fixture auto-match behavior remains supported through the RPC.
- Supabase match hydration now prunes stale local `likedIds` and conversations that are not backed by hosted active matches, so old local-only one-sided UAT conversations disappear after fresh sign-in/hydration. Supabase chat sends append locally only after an active backend match/message insert succeeds.
- Match detail now shows "Like sent" / "Super Like sent" for non-reciprocal real-profile likes and only offers chat when a real match exists.
- Migration `202607040001_profile_photo_visible_storage_reads.sql` adds a storage object select policy so eligible viewers can sign visible profile photo objects. This aligns private Storage access with the existing `profile_photos_select_visible_or_own` row policy and fixes real profiles rendering fallback photos in discovery/matches/inbox.
- Migration `202607040002_active_match_profile_reads.sql` lets active matched users read each other's profile/member/photo rows and sign matched profile photo objects after discovery/swipe state changes, so match hydration can resolve the other profile from backend state.
- Hosted `orchard-dev` has been migrated through `202607040002`; migration list shows local/remote aligned. The Supabase CLI printed a non-fatal pg-delta catalog-cache warning after both hosted pushes, and one follow-up dry-run check timed out after `202607040002`.
- After the active-match profile read migration, local `expo\node_modules\.bin\supabase db reset` passed and local `expo\node_modules\.bin\supabase test db` passed: 1 file, 42 tests.
- Hosted UAT confirmed backend reciprocal matches and messages now hydrate after sign-out/sign-in.
- Matches tab badge now uses explicit new-match state from newly created local/backend match activations instead of unread conversation count, and decrements when each matched profile detail is viewed. Inbox badge counts total unread hydrated incoming messages; unread conversation rows are highlighted with a per-row badge and clear that row's unread count when the chat is opened/read.
- Matches grid cards now open profile detail first instead of jumping directly to chat. Inbox rows expose profile detail via the avatar area while preserving chat open from the message preview area. Chat headers now open the matched profile detail from the avatar/name area.
- Matches grid cards now highlight unopened new matches so the Matches tab badge can be tied to specific profiles. Backend match hydration now keeps active matches visible with a fallback profile instead of dropping the match if auxiliary profile member/photo loading fails.
- Hosted SQL check after the three-way dev UAT showed the backend rows existed as expected for `t`, `tt`, and `test2`: 3 active matches and 2 messages. The empty Matches/Inbox symptom was therefore app hydration/display-side, not backend write-side.
- Account-switching UAT then showed `t` hydrating while later `tt`/`test2` sign-ins were empty, but hosted SQL still showed 3 active matches and 4 messages. Profile sign-out now awaits Supabase auth sign-out before routing, match hydration clears in-flight guards on session reset, and Supabase match listing rejects session/profile mismatches instead of caching an empty hydration pass.
- Live-update UAT showed backend state could appear after making a swipe, meaning the UI was still too dependent on action-triggered provider movement. Backend match/thread hydration now refreshes immediately after sign-in, every 10 seconds while signed in, and whenever the app returns to active; true Supabase Realtime subscriptions remain a later hardening step.
- Realtime hardening now adds a service boundary and Supabase adapter for match/message changes. The app subscribes to `public.matches` for the signed-in profile and `public.messages` for currently active backend match ids, then debounces `refreshBackendMatches`; the existing immediate/app-active/10-second refresh loop remains as a fallback. Migration `202607040003_enable_match_message_realtime.sql` publishes `public.matches` and `public.messages` to `supabase_realtime`; hosted `orchard-dev` is aligned through `202607040003`.
- Hosted browser UAT confirmed Realtime-triggered match/message refresh using `t` as the waiting profile and both `tt` and `test2` as the matching/sending profiles.
- Backend read state now persists per-user per-match watermarks in `public.match_read_states`, protected by active-match RLS. Supabase chat threads return hosted `readThrough`, `ChatService.markRead` upserts hosted read state, and provider hydration prefers hosted read state while keeping local watermarks as fallback/mock behavior. Migration `202607040004_match_read_states.sql` is applied to hosted `orchard-dev`; local DB reset and pgTAP pass with 45 tests.
- Browser UAT confirmed backend-backed read state: opening an incoming hosted message clears unread state, sign-out/sign-in keeps the conversation read, and a newer incoming message restores the unread badge/highlight.
- Match, Inbox, chat, match detail, and tab layout read paths now consume provider-level selectors for matched profiles, inbox rows, profile lookup, conversation lookup, active-match checks, and tab badge counts instead of rebuilding raw `likedIds`/`conversations`/`knownProfiles` reads in each screen. Typecheck, lint, and diff check pass.
- User UAT confirmed the read-path selector cleanup with profile `t`.
- Follow-up back-history hardening now uses a shared `ProtectedRoute` wrapper for signed-in-only surfaces: tabs, chat, match detail, edit profile, paywall, report, and safety/legal. Stale device/browser back entries therefore cannot render protected app screens while the signed-in profile is missing or still loading. Chat also uses a canonical Android hardware-back hook so device back matches the in-app chat back action and returns to Inbox.
- Follow-up badge stability fix prevents Realtime/10-second backend refreshes from reintroducing stale Match or Inbox badge state after the user has opened a match/conversation. Backend refresh application now consults current `seenMatchIds` and `readWatermarks`, and conversation unread counts are recalculated from the latest read watermark even when backend messages are unchanged.
- Fruit now excludes already matched backend real/dev profiles while keeping unmatched real/dev profiles available for testing. Inbox rows now call `markRead` before navigating into Chat, preventing rapid device/browser back from briefly showing the old unread badge before the Chat read effect runs.
- Backend real/dev match cards no longer use or cache generic fallback profiles in the common lookup path. Backend match hydration rejects incomplete backend profile objects such as generic "Orchard user" rows, preserves real remembered profile objects when available through an explicit display-profile snapshot, persists complete known display profiles in AsyncStorage for last-known-good rendering under weak network, does not clear remembered match profiles on same-user Supabase token refresh, queues a follow-up refresh if Matches/Inbox focus or realtime refresh lands while another refresh is in flight, and Matches/Inbox trigger backend match/profile refresh on focus. Match detail receives an explicit `from` origin from Matches, Inbox, Discover, Fruit, and Chat, opens as a normal stack screen rather than a root modal, then uses stack-aware `dismissTo` for canonical Android hardware-back behavior. Backend match hydration also repairs missing real/dev display profiles through the Supabase discovery path Fruit uses, and skips partial match refresh application when a complete real/dev profile still cannot be resolved. Follow-up `00f3075` fixed a sign-in maximum-update-depth loop caused by saving the known-profile display cache through a TanStack mutation inside auth/session reset effects.
- Latest UAT: sign-in loop is fixed. Device/browser back from Matches into profile detail is mostly stable. Inbox -> real/dev conversation -> device/browser back still intermittently drops real/dev conversations and matches, especially under weak mobile reception, until Fruit/Discover restores display state. Follow-up cache-retention fix preserves complete known-profile display rows across transient Supabase `userId` gaps and same-account sign-out/sign-in, while still clearing the cache on a real account switch. Human UAT confirmed this passes on desktop Chrome, but Android Chrome still failed because device back is delivered as browser history/back instead of native Android `BackHandler`. Follow-up web canonical-back fix extends `useCanonicalBack` to web `popstate` with a focused history sentinel so browser back routes through the same canonical `dismissTo` target used by in-app back. Human UAT then confirmed repeated Android Chrome device-back flows pass across Matches and Inbox. One first-attempt Matches -> profile -> immediate Android back case briefly rendered "No matches" before all matches returned after about 0.5-1 second; an initial screen-level transient-empty guard did not fix it because tabs can remount after the list is already empty. Follow-up refines `useTransientEmptyList` and applies it at the provider selector level for `matchedProfiles` and `inboxItems`; the hook now returns the last non-empty list synchronously on the first empty render instead of waiting for an effect tick. The deeper product-readiness issue is that Supabase mode was still releasing app screens from local/mock state before initial backend match/thread/profile-display hydration completed. Current production-direction fix adds `backendMatchesHydrated`, waits for initial backend match/thread hydration in root/protected/sign-in flows after profile hydration, and bridges cached same-user profiles into backend match bootstrap. This moves the work toward the intended source-of-truth startup model for inner-circle testing. Local typecheck, lint, and diff check pass; targeted Android Chrome bootstrap UAT is still needed.
- Follow-up UAT after the bootstrap gate still failed on first Android Chrome swipe-back: instead of showing "No matches", the browser briefly went blank white and returned with all three matches highlighted; the opened match did not clear highlight/badge. Current diagnostic slice adds instrumentation for canonical browser back, protected-route gate state, backend match bootstrap start/load/apply/release, and backend bootstrap resets. Matches cards now call `markMatchSeen` before navigating to detail, so immediate back cannot outrun the detail-screen seen effect. Typecheck, lint, and diff check pass.
- Latest order-dependent UAT narrowed the issue further: fresh sign-in followed by Match tab first passes, and fresh sign-in followed by Inbox conversation back first also passes, but then opening Match Detail in that same Android Chrome session repeatedly causes a blank white ~0.5-1 second reload/state gap. The URL stays on `/matches` while Match Detail is visible and rows return by themselves, so this is stale browser history behind an in-memory detail screen rather than missing backend rows. Current follow-up re-enables web `popstate` normalization only for Match Detail, uses `router.replace` to the canonical tab destination, adds a Match-tab-only web hash sentinel (`/matches#match-...`) before opening detail, and awaits direct seen-match storage persistence before navigation so transient page churn should not restore the opened match highlight/badge; Chat/Inbox remains unchanged because that path passes. Typecheck, lint, and diff check pass.
- GitHub Actions workflow cleanup updates `Expo Checks` and `Supabase DB Tests` from `actions/checkout@v4` to `actions/checkout@v6`, resolving the tracked checkout Node 20 warning follow-up.
- Fruit tab UAT exposed that static Fruit fixtures did not auto-match, real/dev backend profiles did not appear there, and one-sided Fruit/profile-detail likes used browser alerts. Fruit now mixes backend-discovered real/dev profiles with static Fruit fixtures, static Fruit fixtures auto-match locally for testing, and one-sided like feedback uses app overlays.
- Read-state UAT exposed that already-read backend messages became unread again after sign-out/sign-in. The app now persists per-user read watermarks locally and counts unread backend messages only after the saved read point. New-match seen state is also persisted per user so opened match highlights stay cleared across sessions.
- Fixture chat UAT exposed that Supabase-mode fixture messages skipped local simulated replies. Mock/fixture profiles now keep local simulated replies while real backend-only profiles stay backend-driven.
- Follow-up Fruit UAT found real/dev profiles still missing from Fruit after prior swipes, local-only Fruit fixture matches not adding Match badge/highlight state, and fixture replies received while a chat was open leaving unread badge state behind. Fruit now requests the full backend testable pool, keeps backend profiles visible there after prior swipes, preserves local-only Fruit fixture match/conversation state across backend refresh, and re-clears an open chat when new fixture messages arrive.
- A second Fruit follow-up showed hosted mock fixture rows were crowding real/dev profiles out of Fruit, local-only Fruit new-match state could still be overwritten by stale backend refresh closures, new matches were not consistently ordered at the bottom, and hosted fixture text sends could display duplicate local/backend echoes. Fruit now filters hosted mock fixture rows out of its backend slice, backend refresh preserves local-only match/new/conversation state from current state, Supabase matches hydrate oldest-to-newest, and fixture sends suppress duplicate backend echo appends.
- Browser UAT confirmed the latest Fruit, match badge/highlight, fixture message, read-state persistence, match detail entry, and one-sided real/dev like behaviors pass. These items are now banked as completed unless a new regression appears.
- Follow-up visual issue noted: the `/onboarding` background image no longer appears maximized across the whole viewing space compared with the pre-decoupling Rork rendering.
- The welcome, sign-in, and pending-confirmation onboarding screens now size their root views to the web viewport and give the recovered local background image explicit full-size dimensions. Typecheck, lint, diff check, and browser visual UAT passed.
- The sign-in screen no longer overrides the onboarding layout with its original generated `headerShown: true` setting, so the route-level `headerShown: false` removes the blank white header strip above "Welcome back". Typecheck, lint, diff check, and browser visual UAT passed.
- Backend match/thread hydration now runs after a signed-in Supabase profile is hydrated. Active hosted fixture matches are mapped back into local `likedIds` and conversations, and hosted text messages are merged into existing local conversations by message id without wiping local simulated/photo messages.
- Backend chat persistence has started behind the service boundary: Supabase mode now uses `createSupabaseChatService`, and `ProfileProvider.sendMessage` non-blockingly persists outbound text messages to the hosted `messages` table when a matching active backend match exists. Visible chat state, simulated replies, read receipts, deletes, and photo messages remain local/mock for now.
- Chat persistence now repairs one likely hosted UAT drift case: if local chat is allowed from `likedIds` but no active Supabase match is found, `ProfileProvider` records the backend like once through the swipe service and uses the returned fixture auto-match id before sending the text message. This preserves mock/local UI behavior and lets stale local fixture matches become backend-backed before message insert.
- Unmatch now removes the local conversation immediately and also attempts the hosted `unmatch_match` RPC in Supabase mode after resolving the active backend match id.
- Hosted browser UAT after the backend discovery/match/chat slice passed: fixture discovery loaded, fixture like/match worked, a unique text message persisted to hosted `public.messages`, sign-out/sign-in restored the hosted message through match/thread hydration, and unmatch marked the hosted match inactive.
- Mobile web UAT now launches through `bun run uat-web-tunnel`, which starts Expo web and a standalone ngrok v3 tunnel. Follow-up UAT found browser back from Chat changed the URL to `/inbox` without changing the rendered screen, and Match Detail back changed the URL to `/matches` but showed a white reload/loading gap. The canonical-back hook now handles focused web `popstate` events by replacing to the route's canonical destination instead of relying only on native Android hardware back.
- Human UAT after the web canonical-back patch: Android Chat and desktop Chat still pass. Desktop Match Detail passes. Android Match Detail no longer shows the white browser reload; it returns through an app-background loading step during early repeated backs and then stops showing that loader after warmup. Treat this as accepted for Slice 1 unless the loader becomes multi-second, frequent after warmup, or loses rows/highlight state.
- Real/dev tester reported forgot-password did not work. The sign-in screen previously showed only a placeholder alert. Forgot-password now calls Supabase `resetPasswordForEmail` with the same auth redirect URL strategy as signup, the auth provider detects recovery callbacks, and `/onboarding/sign-in` shows an in-app new-password form that calls `supabase.auth.updateUser({ password })`.
- Foundation Slice 2 freezes the current `useProfile()` compatibility facade in `expo/providers/profile-provider-contract.ts` and annotates `ProfileProvider` against it. `docs/profile-provider-map.md` now categorizes each field/action as auth/profile bootstrap, server state, client preference state, local mock/demo state, prototype monetization state, or UI selector/facade, with first migration consumers identified for Matches/Inbox, Match Detail, and Chat.
- Foundation Slice 3 moves local read/seen preferences into `expo/store/use-preferences-store.ts` while preserving existing storage keys and provider wrappers. `ProfileProvider.markRead` and `ProfileProvider.markMatchSeen` remain screen-facing compatibility APIs, and Supabase `match_read_states` behavior remains in the provider for now.
- Foundation Slice 4 moves local/demo swipe interaction arrays into `expo/store/use-interaction-store.ts` while preserving existing storage keys. `ProfileProvider` still exposes `likedIds`, `passedIds`, `superLikedIds`, and wrapper actions, and Supabase reciprocal-match decisions remain behind the existing swipe/match services.
- Foundation Slice 5 introduces query-backed server-state hooks under `expo/hooks/api/` for matches, chat threads, and discovery. Discover and Fruit now read discovery through `useDiscoveryProfilesQuery`, and `ProfileProvider.refreshBackendMatches` uses `useMatchesQuery().refetch()` while preserving the existing hydration algorithm, Realtime/polling fallback, and mock mode behavior.
- Foundation Slice 6 route read-model migration is implemented. `expo/hooks/use-matches-read-model.ts`, `use-inbox-read-model.ts`, `use-match-detail-read-model.ts`, `use-chat-thread-read-model.ts`, `use-discover-read-model.ts`, `use-fruit-read-model.ts`, `use-edit-profile-read-model.ts`, `use-paywall-read-model.ts`, `use-report-read-model.ts`, `use-safety-legal-read-model.ts`, `use-tab-badge-read-model.ts`, `use-profile-tab-read-model.ts`, `use-onboarding-completion-read-model.ts`, `use-sign-in-profile-read-model.ts`, and `use-app-bootstrap-read-model.ts` now wrap route/provider reads and actions. App routes/components no longer import `useProfile()` directly; provider access is confined to focused hooks.
- Provider-internal cleanup has started after Slice 6. `expo/services/profile-provider-selectors.ts` now owns pure compatibility selector calculations for conversation lookup, active-match checks, matched profiles, inbox rows, and unread message counts. `ProfileProvider` still owns side-effectful profile lookup/cache repair, transient-empty guards, and the compatibility facade.
- Prototype monetization state now lives behind `expo/store/use-monetization-store.ts` while preserving existing AsyncStorage keys and compatibility wrappers. `ProfileProvider` still exposes `purchase`, `subscribe`, `cancelSubscription`, boost state, match-slot counts, super-like balance/recharge, and subscription state.
- Local chat UI state now lives behind `expo/store/use-chat-ui-store.ts`. `ProfileProvider` still exposes `drafts`, `setDraft`, and `typingProfileIds`; conversation state and persistence now live in the persisted conversations hook.
- Pure backend conversation merge/read-through helpers now live in `expo/services/local-interaction-service.ts`; `ProfileProvider` still owns conversation state, persistence writes, backend chat hydration orchestration, and simulated reply/photo side effects.
- Local conversation state and AsyncStorage persistence now live behind `expo/hooks/use-persisted-conversations.ts`. `ProfileProvider` still exposes `conversations` through the compatibility facade and still coordinates backend chat hydration, backend sends/read receipts, and local simulated reply/photo side effects.
- Local chat simulation timing now lives behind `expo/services/local-chat-simulation-service.ts`. `ProfileProvider` still owns the conversation mutation callbacks for simulated replies and photo approvals.
- Repeated backend match-pair lookup now lives behind `expo/services/match-record-utils.ts`. `ProfileProvider` still owns backend chat hydration and unmatch side effects.
- Backend chat send/read action orchestration now lives behind `expo/services/backend-chat-action-service.ts`. `ProfileProvider` still owns local visible conversation updates, stale local-match cleanup when the backend has no active match, unmatch side effects, and local simulated reply/photo mutation callbacks.
- Supabase discovery now excludes hosted test fixture rows by default through an explicit `includeTestFixtures` discovery filter. Discover and Fruit both leave hosted fixtures out of backend discovery, while Fruit continues to use its local `FRUIT_PROFILES` fixture pool for demo/test behavior.
- Profile-tab sign-out now clears profile/auth state before routing to `/onboarding`, preventing the user from landing on Discover with no profile/data loaded.
- Remaining observed behavior to decide/fix later: after sign-out/sign-in, only hosted messages are restored; local fixture greeting/simulated messages are intentionally not persisted to hosted chat yet.
- The original generated onboarding background was recovered from the previous remote URL, vendored as `expo/assets/images/welcome-background.png`, and the welcome, sign-in, and pending-confirmation screens now use the local bundled asset instead of the app icon background or a remote Rork URL.
- Hosted onboarding/profile-photo confirmation smoke passed: after reaching the pending-confirmation page, opening email in a new tab and following the Supabase confirmation link opened another tab on Discover; the created profile's name, email, and selected photo hydrated correctly from the Profile tab while the original pending-confirmation tab remained idle.
- After the auth confirmation route fix, local `bun run typecheck` and `bun run lint` pass from `expo/`.
- The storage migration `202606200002_profile_photo_storage.sql` has been pushed to hosted `orchard-dev`; follow-up dry run reports the remote database is up to date. Hosted onboarding/profile-photo confirmation with a selected local photo passed in browser UAT on 2026-07-03.
- Hosted SQL verification on 2026-06-20 confirmed `202606200002` is recorded in `supabase_migrations.schema_migrations`, the `profile-photos` bucket is private, four owner-scoped storage object policies exist, and `profile_photos_profile_member_sort_unique` exists.
- A hosted anon-client smoke test attempted to create a fresh test auth user and was blocked by Supabase's email rate limit before a session was returned. Retest after the rate limit clears or with an existing confirmed dev account.
- A browser funnel test reached `/onboarding/photos`, sent a Supabase confirmation email, and exposed two hosted auth setup gaps: the redirect URL was still pointing at `http://localhost:3000`, and emails still used default Supabase Auth branding. App-side redirect handling has been patched; hosted Supabase Auth redirect allow-list, Site URL, and email templates/sender still need Dashboard review.
- User updated Supabase Auth URL Configuration redirect entries for the browser preview. Supabase Dashboard currently requires SMTP configuration before auth email templates can be customized; SMTP fields are still blank except project auth secrets.
- Project review recommendations remain relevant: avoid a broad `ProfileProvider` rewrite, keep moving behavior behind services, and add CI/database automation after the auth/profile path has a little more coverage. The July 2026 amended plan makes this explicit: keep `ProfileProvider` as a compatibility facade, remove web navigation hacks first, then extract preferences, interactions, and backend server state in separate slices.
- Session-close handoff records the UAT tunnel, navigation back, forgot-password recovery checkpoint, and provider extraction checkpoint. Latest implementation checkpoint: `2d942f7` - Extract backend match lookup helper.

## Current Task

Provider-internal cleanup after Slice 6 has moved pure compatibility selectors, prototype monetization state, local chat UI state, local conversation state/persistence, local chat simulation timing, backend match-pair lookup, backend chat send/read action orchestration, Supabase discovery fixture filtering, and pure backend conversation merge/read-through helpers out of `ProfileProvider` while preserving route hooks, facade members, storage keys, and visible behavior.

## Next Planned Tasks

1. Human UAT forgot-password flow on hosted Supabase/ngrok when practical: request reset email, open link, set new password, sign in with the new password, and confirm the old password no longer works.
2. Continue provider-internal cleanup after Slice 6: move the next small state domain, likely remaining local simulated conversation mutation callbacks, fixture match repair paths, or unmatch action orchestration, out of `ProfileProvider` behind clearer services without changing visible UI.
3. Continue Supabase source-of-truth session bootstrap for inner-circle testing: profile, active matches, display profiles/photos, inbox summaries, thread snippets, unread/read state, and block/unmatch visibility should load before tabs render.
4. Monitor Android Match Detail's brief app-background loading step; optimize only if it is multi-second, frequent after warmup, or loses rows/highlight state.
5. Decide whether seen-match/highlight state remains local-only for inner-circle testing or moves to backend-backed per-user state.
6. Continue backend source-of-truth cleanup for actions: like/pass/super-like, match creation, unmatch/block/report, message send/read should either write backend-first or use clearly bounded optimistic updates.
7. Keep mock/Fruit behavior as demo/test mode, but isolate it from Supabase signed-in startup state.
8. Decide whether to ingest fixture profile images into Supabase Storage for backend-backed discovery; the current dev fixtures intentionally omit `profile_photos` because mock image URLs are remote assets, not storage object paths.
9. Decide whether to make Supabase DB tests automatic for Supabase migration pull requests.
10. Closer to TestFlight: create Apple Developer Program account and finish release-readiness setup.

## Human Decisions Needed

- Apple Developer account creation.
- Real domain for public legal/support URLs before productionization.
- Supabase Auth email sender/template branding for Orchard requires custom SMTP setup.

## Status Tracking Rule

Update this file whenever a commit materially changes project status, next tasks, or known blockers.

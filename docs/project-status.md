# Project Status

Last updated: 2026-07-03

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
- Supabase service adapters exist for swipe, match, and safety behavior. Swipe persistence is lightly wired into the provider as a gated, non-blocking hook; match and safety adapters are not wired into UI/provider flows yet.
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
- MVP prototype gap assessment is recorded in `docs/mvp-prototype-gap-assessment.md`.
- Product/release decisions recorded: app name `Orchard`, iOS bundle ID `com.orchardapp.ios`, Supabase dev project `orchard-dev`, production project later `orchard-prod`, Supabase region East US (North Virginia) / `us-east-1`, and placeholder public legal/support URLs under `https://yourdomain.com`.
- Project review recorded in `docs/20260620_project_review.md`.
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
  - Follow-up: GitHub Actions warns that `actions/checkout@v4` targets Node 20 and is being forced to Node 24; upgrade checkout usage when a Node-24-native action version is available.
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
- Follow-up visual issue noted: the `/onboarding` background image no longer appears maximized across the whole viewing space compared with the pre-decoupling Rork rendering.
- Backend match/thread hydration now runs after a signed-in Supabase profile is hydrated. Active hosted fixture matches are mapped back into local `likedIds` and conversations, and hosted text messages are merged into existing local conversations by message id without wiping local simulated/photo messages.
- Backend chat persistence has started behind the service boundary: Supabase mode now uses `createSupabaseChatService`, and `ProfileProvider.sendMessage` non-blockingly persists outbound text messages to the hosted `messages` table when a matching active backend match exists. Visible chat state, simulated replies, read receipts, deletes, and photo messages remain local/mock for now.
- Chat persistence now repairs one likely hosted UAT drift case: if local chat is allowed from `likedIds` but no active Supabase match is found, `ProfileProvider` records the backend like once through the swipe service and uses the returned fixture auto-match id before sending the text message. This preserves mock/local UI behavior and lets stale local fixture matches become backend-backed before message insert.
- Unmatch now removes the local conversation immediately and also attempts the hosted `unmatch_match` RPC in Supabase mode after resolving the active backend match id.
- Hosted browser UAT after the backend discovery/match/chat slice passed: fixture discovery loaded, fixture like/match worked, a unique text message persisted to hosted `public.messages`, sign-out/sign-in restored the hosted message through match/thread hydration, and unmatch marked the hosted match inactive.
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
- Project review recommendations remain relevant: avoid a broad `ProfileProvider` rewrite, keep moving behavior behind services, and add CI/database automation after the auth/profile path has a little more coverage.
- Session-close handoff records the backend profile display checkpoint. Latest implementation checkpoint: `00df6be` - Support backend profile discovery display. Local `main` should be clean and synced with `origin/main`.

## Current Task

Retest the real non-fixture profile UAT fix slice after fresh sign-in/hydration: stale local-only conversations should be pruned, one-sided real likes should stay pending, uploaded profile photos should render for eligible viewers, and reciprocal real likes should create backend-backed Matches/Inbox/Chat state.

## Next Planned Tasks

1. Browser-retest arbitrary real-user backend discovery/profile display with at least two hosted non-fixture profiles.
2. Create Apple Developer Program account.
3. Decide whether to ingest fixture profile images into Supabase Storage for backend-backed discovery; the current dev fixtures intentionally omit `profile_photos` because mock image URLs are remote assets, not storage object paths.
4. Decide whether to make Supabase DB tests automatic for Supabase migration pull requests.
5. Continue reducing local/mock screen reads by routing match detail, inbox, and matches screens through service boundaries where practical.
6. Track and resolve the GitHub Actions Node 20 deprecation warning from `actions/checkout@v4`.

## Human Decisions Needed

- Apple Developer account creation.
- Real domain for public legal/support URLs before productionization.
- Supabase Auth email sender/template branding for Orchard requires custom SMTP setup.

## Status Tracking Rule

Update this file whenever a commit materially changes project status, next tasks, or known blockers.

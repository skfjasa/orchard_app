# Orchard Closed-Beta Milestone Tracker

Last updated: 2026-07-08

This is the single canonical milestone, roadmap, checklist, blocker, and feedback-loop document for getting Orchard to a closed beta with close friends and inner-circle testers.

Use this file to answer:

- Where are we?
- What is the next milestone?
- What blocks the next milestone?
- What UAT feedback was accepted or still needs work?
- What has been completed?
- What human decisions are needed?

Do not maintain separate active milestone, backlog, launch-plan, release-checklist, or MVP-gap docs. Older planning docs are historical only and should point here.

Supporting docs:

- Active foundation refactor plan: [Repo Audit & Foundation Refactor Plan](repo-audit-and-foundation-plan.md)
- Historical audit lineage: [Architecture Audit History](architecture-history.md)
- Running narrative status log: [Project Status](project-status.md)
- Current schema/reference: [Supabase Schema Draft](supabase-schema.md)

## Status Keys

- `[x]` Done or accepted.
- `[~]` In progress or partially accepted.
- `[ ]` Not started.
- `[!]` Blocked by human decision, account setup, or external dependency.

Owner key:

- `[C]` Codex can execute without a new human decision, assuming normal repo access.
- `[U]` Human UAT is required to accept or reject the work.
- `[H]` Human action, account setup, credential access, policy choice, or product decision is required.
- `[C+U]` Codex can implement or prepare, then human UAT must accept it.
- `[C+H]` Codex can prepare options or scaffolding, but a human decision/action is required before completion.

## Product Goal

Orchard is an iOS-first dating app MVP for polyamorous / ENM users. The beta should validate whether structured relationship context improves dating outcomes: relationship structure, partnered status, dating mode, boundaries, looking-for intent, and compatibility expectations should be clear before chat.

This should not become a generic swipe clone.

## Closed-Beta Target

Target audience:

- Small trusted close-friends / inner-circle group.
- Initial testing can use mobile web/ngrok or hosted preview while iOS TestFlight work is prepared.
- TestFlight is the iOS distribution target once Apple/EAS/App Store Connect prerequisites are available.

Closed-beta user outcome:

1. Tester can create or sign into a real account.
2. Tester can complete a structured profile and upload photos.
3. Tester can discover eligible profiles.
4. Tester can like/pass and match only on reciprocal likes.
5. Tester can chat only with active matches.
6. Tester can report, block, unmatch, access support/legal surfaces, and request account deletion.
7. App remains stable across sign-out/sign-in, weak mobile network, and Android Chrome/browser back testing used during pre-TestFlight validation.
8. Feedback can be captured through an approved channel.

## Current Priority

Current milestone: **M4 - Supabase source-of-truth app session**.

Immediate engineering state:

- Foundation Slice 1 from [Repo Audit & Foundation Refactor Plan](repo-audit-and-foundation-plan.md) is implemented and passed automated checks. Targeted desktop Chrome and Android Chrome UAT now passes for Chat and Match Detail back navigation, with one residual Android Match Detail app-background loading step observed during early repeated backs.

Immediate acceptance target:

- Supabase sign-in waits for backend profile, active matches, display profiles/photos, inbox/thread summaries, and read state before protected app tabs render.
- Android Chrome device/browser back from Match Detail and Chat does not briefly show empty Matches/Inbox states.
- Mock/Fruit/demo mode still works when Supabase env vars are absent or when explicitly testing fixture behavior.

## Current UAT Loop

Purpose:

- Validate source-of-truth bootstrap and route/back stability before expanding the beta surface.

Primary UAT setup:

1. Use hosted Supabase mode.
2. Use test account `t` unless a task specifies another account.
3. Use `tt` and/or `test2` as reciprocal match/message counterparts when needed.
4. Launch mobile web UAT with `bun run uat-web-tunnel` from `expo/` and use the ngrok HTTPS forwarding URL.
5. Start from a fresh Android Chrome incognito tab for mobile web UAT.

Expected behavior after Slice 1:

- After sign-in, protected tabs wait on loader/finalizing state until backend profile and first match/thread hydration complete.
- Matches and Inbox do not briefly render true empty states when hosted active rows exist.
- Match Detail opened from Matches uses Expo Router navigation without a Match-tab hash sentinel.
- Android device/swipe/browser back returns to Matches with rows visible, no blank white browser window, and no reset of already-cleared match highlights. A brief app-background loader may appear on early Android Match Detail backs while backend/bootstrap state is warm.
- Chat opened from Inbox returns to Inbox with rows visible and read state stable.

Primary UAT checklist:

1. Sign in as `t`.
2. Confirm the app waits long enough to hydrate backend state before tabs render.
3. Open Matches and confirm expected rows appear on first render.
4. Open Inbox and confirm expected conversation rows appear on first render.
5. Open Inbox first, open one real/dev conversation, then immediately use Android device back or swipe-back.
6. Confirm Inbox returns normally and keeps all expected rows visible.
7. Without signing out or resetting incognito, open Matches, tap one real/dev match, then immediately use Android device back or swipe-back.
8. Confirm the URL is managed by Expo Router without relying on `/matches#match-...`.
9. Confirm Matches returns with all expected rows visible, no blank white browser window, no "No matches", and no fixture-only state.
10. Confirm the opened match highlight clears and badge count updates correctly.
11. Repeat for the other real/dev match.
12. Regression-check the opposite order: fresh incognito sign-in, Match Detail back first, then Inbox conversation back.
13. Regression-check desktop Chrome browser back from Chat and Match Detail.

If UAT fails, capture:

- Account used.
- Exact route sequence.
- URL before pressing Android back.
- URL after Android back.
- Whether any hash sentinel appears while Match Detail is visible; after Slice 1 it should not.
- Whether the opened match highlight/badge stays cleared.
- Whether the empty state says "No matches", "No conversations", fixture-only, or something else.
- Whether rows return by themselves, and how long it takes.
- Whether visiting Fruit/Discover restores rows.
- Whether the issue happens only on first attempt after sign-in or on repeated attempts.
- Any visible console output if Android Chrome remote debugging is available.

Feedback loop rule:

- Accepted UAT results should update the relevant milestone Done/Remaining bullets.
- Failed UAT should add or refine a Remaining bullet and keep the next task concrete.
- Human decisions should move into the Human Decisions Register.
- Material status changes should also update `docs/project-status.md`, `.agents/current.md`, and `.agents/next.md`.

## Milestone Map

| ID | Milestone | Status | Exit Criteria |
| --- | --- | --- | --- |
| M0 | Operating layer and repo continuity | [x] | Repo rules, handoffs, setup docs, status docs, and validation commands are documented. |
| M1 | App foundation and adapter boundaries | [~] | UI remains stable while profile/discovery/swipe/match/chat/safety/storage behaviors are behind service boundaries. |
| M2 | Supabase backend foundation | [x] | Supabase dev project, migrations, RLS tests, auth client, service factory, and mock fallback exist. |
| M3 | Real auth, onboarding, profile storage, photos | [~] | Supabase users can sign up/sign in, complete profile setup, upload photos, and hydrate their profile from backend reliably. |
| M4 | Supabase source-of-truth app session | [~] | Signed-in Supabase app entry is backend-hydrated before tabs render; local state is fallback/cache, not first visible source of truth. |
| M5 | Discovery, swipes, reciprocal matches | [~] | Eligible backend discovery, like/pass persistence, reciprocal match creation, block/invisible/suspended filtering, and no false local matches. |
| M6 | Active-match chat | [~] | Text chat is backend-backed, read state persists, Realtime/polling updates work, and chat is impossible without an active match. |
| M7 | Safety, moderation, privacy, account deletion | [~] | Report/block/unmatch/account deletion/support/legal flows work in backend-backed mode and satisfy beta/TestFlight expectations. |
| M8 | Inner-circle beta readiness | [ ] | A small trusted tester group can use Orchard with seeded/demo data, stable auth/session behavior, safety flows, and feedback capture. |
| M9 | Analytics, crash reporting, QA hardening | [ ] | Privacy-safe analytics/crash reporting decisions are implemented or explicitly deferred, and repeatable QA exists. |
| M10 | iOS TestFlight release | [!] | Apple Developer/App Store Connect/EAS/build metadata are ready and a TestFlight build can be submitted. |
| M11 | Android later | [ ] | Android package/build/store work starts only after iOS MVP is stable. |

## M0 - Operating Layer And Repo Continuity

Status: `[x]`

Done:

- [x] [C] Repo-level `AGENTS.md` exists with Orchard-specific rules.
- [x] [C] Lightweight handoff files exist at `.agents/current.md` and `.agents/next.md`.
- [x] [C] `status report` and `handoff sync` workflows are documented.
- [x] [C] Core setup/status docs exist.
- [x] [C] Validation commands are standardized: `bun run typecheck`, `bun run lint`, `git diff --check`.
- [x] [C] This file is the canonical milestone/checklist/closed-beta source of truth.

Remaining:

- [ ] [C] Keep this tracker, `.agents/current.md`, `.agents/next.md`, and `docs/project-status.md` in sync when milestone status changes.
- [ ] [C] Keep `docs/repo-audit-and-foundation-plan.md` aligned with the current provider extraction strategy when architecture decisions change.

## M1 - App Foundation And Adapter Boundaries

Status: `[~]`

Done:

- [x] [C] Expo Router app structure exists.
- [x] [C] Prototype UI is preserved.
- [x] [C] Service interfaces and mock adapters exist.
- [x] [C] Supabase adapters exist for several backend domains.
- [x] [C] Backend/mock service factory exists.
- [x] [C] Read-path selectors exist for matched profiles, inbox rows, profile lookup, conversations, active-match checks, and tab badges.
- [x] [C] Amended foundation refactor plan exists and avoids one-pass `ProfileProvider` deletion.
- [x] [C] Route/provider boundary migration is complete: app routes/components consume focused hooks instead of importing `useProfile()` directly.
- [x] [C] Provider-internal selector cleanup has started with pure selector helpers in `expo/services/profile-provider-selectors.ts`.
- [x] [C] Prototype monetization state now lives in `expo/store/use-monetization-store.ts` while preserving demo/paywall behavior.
- [x] [C] Local chat UI state for drafts and simulated typing IDs now lives in `expo/store/use-chat-ui-store.ts`.
- [x] [C] Pure backend conversation merge/read-through helpers now live in `expo/services/local-interaction-service.ts`.
- [x] [C] Local conversation state and AsyncStorage persistence now live in `expo/hooks/use-persisted-conversations.ts`.
- [x] [C] Local chat simulation timing helpers now live in `expo/services/local-chat-simulation-service.ts`.
- [x] [C] Local chat text/photo action orchestration now lives in `expo/services/local-chat-action-service.ts`.
- [x] [C] Local match activation and stale-match cleanup now live in `expo/services/local-match-action-service.ts`.
- [x] [C] Local block cleanup now lives in `expo/services/local-safety-action-service.ts`.
- [x] [C] Repeated backend match-pair lookup now lives in `expo/services/match-record-utils.ts`.
- [x] [C] Backend chat send/read action orchestration now lives in `expo/services/backend-chat-action-service.ts`.
- [x] [C] Backend unmatch action orchestration now lives in `expo/services/backend-match-action-service.ts`.
- [x] [C] Backend match/thread hydration planning now lives in `expo/services/backend-match-hydration-service.ts`.
- [x] [C] Backend match/thread hydration application calculations now live in `expo/services/backend-match-hydration-application-service.ts`.
- [x] [C] Backend match hydration ready-plan application now lives in `expo/services/backend-match-hydration-application-service.ts`.
- [x] [C] Backend profile complete-onboarding and update action calls now live in `expo/services/backend-profile-action-service.ts`.
- [x] [C] Backend profile bootstrap loading and pending onboarding recovery now live in `expo/services/backend-profile-bootstrap-service.ts`.
- [x] [C] Backend swipe persistence calls now live in `expo/services/backend-swipe-action-service.ts`.
- [x] [C] Report, block, and account-deletion safety service calls now live in `expo/services/safety-action-service.ts`.
- [x] [C] Profile provider sign-out reset bookkeeping now lives in `expo/services/profile-provider-reset-service.ts`.
- [x] [C] Backend bootstrap reset bookkeeping now lives in `expo/services/profile-provider-reset-service.ts`.
- [x] [C] Backend display-profile completeness and selection helpers now live in `expo/services/backend-profile-display-service.ts`.
- [x] [C] Supabase discovery now excludes hosted test fixture rows by default; Fruit keeps its local fixture pool explicit instead of mixing hosted mock rows into backend discovery.

Remaining:

- [x] [C] Slice 1: remove Match Detail web history/hash hacks while preserving native Android `BackHandler`.
- [x] [C] Slice 2: update/freeze the `ProfileProvider` facade contract and responsibility inventory.
- [x] [C] Slice 3: extract local preferences such as read watermarks and seen-match ids.
- [x] [C] Slice 4: extract local/demo interaction state such as likes/passes/super-likes while keeping Supabase active matches backend-driven.
- [x] [C] Slice 5: introduce query-backed backend server-state hooks for matches, chat threads, and discovery.
- [x] [C] Slice 6: migrate screens domain-by-domain without changing visible UI.
  - [x] [C] Matches read path now uses `useMatchesReadModel`.
  - [x] [C] Inbox read path now uses `useInboxReadModel`.
  - [x] [C] Match Detail read path and seen-state calls now use `useMatchDetailReadModel`.
  - [x] [C] Chat thread/read/send path now uses `useChatThreadReadModel`.
  - [x] [C] Discover/Fruit discovery and local fixture behavior now use focused read-model hooks.
  - [x] [C] Profile/safety/paywall/onboarding calls.
    - [x] [C] Edit Profile, Paywall, Report, and Safety & Legal now use focused read-model hooks.
    - [x] [C] Profile tab, onboarding photos/sign-in, tab badges, root redirect, and ProtectedRoute/bootstrap gates now use focused read-model hooks.
- [x] [C] Slice 5b: Hand over background polling and cache invalidation to React Query (remove manual setInterval/AppState from ProfileProvider and extract Realtime invalidation).
- [ ] [C] Continue isolating remaining provider-owned application paths, especially backend-first action cleanup and display-profile cache ownership.

Exit criteria:

- Screens remain UI-focused.
- Backend/mock behavior is chosen through service boundaries.
- Mock mode remains reliable.
- `ProfileProvider` is either small and facade-like, or retired only after consumers migrate.

## M2 - Supabase Backend Foundation

Status: `[x]`

Done:

- [x] [C] Env-gated Supabase client exists.
- [x] [C] Supabase Auth foundation exists.
- [x] [H+C] Hosted `orchard-dev` exists.
- [x] [C] Initial schema/RLS/RPC migrations exist.
- [x] [C] Local Supabase tests pass.
- [x] [C] Hosted migrations are applied through `202607040004`.
- [x] [C] Realtime publication migration exists for matches/messages.
- [x] [C] Backend read-state migration exists.
- [x] [C] GitHub Actions run Expo checks; manual Supabase DB test workflow exists.

Remaining:

- [ ] [H] Decide whether Supabase DB tests should run automatically on migration PRs.
- [ ] [H+C] Create production Supabase project later: `orchard-prod`.
- [ ] [C] Keep `docs/supabase-schema.md` current after schema/RLS migrations.

Exit criteria:

- Dev backend is stable enough for inner-circle testing and has reproducible migrations/tests.

## M3 - Real Auth, Onboarding, Profile Storage, Photos

Status: `[~]`

Done:

- [x] [C] Email/password signup and sign-in are wired.
- [x] [C] Forgot-password recovery is wired for hosted Supabase accounts: reset email, recovery callback detection, and in-app password update.
- [x] [C+U] Hosted email confirmation can resume onboarding/profile persistence.
- [x] [C] Pending confirmation screen exists.
- [x] [C] Profile/member rows persist to Supabase.
- [x] [C+U] Supabase Storage-backed profile photo upload exists.
- [x] [C] Profile photo storage policies and active-match photo read policies exist.
- [x] [C+U] Onboarding background/sign-in header visual regressions were fixed and UAT-confirmed.

Remaining:

- [ ] [U] UAT full sign-up/sign-in/profile/photo flow on target mobile browser and later iOS device.
- [ ] [C+U] Confirm no profile hydration loops or stale local profile state on repeated sign-out/sign-in.
- [ ] [H] Decide if branded auth emails are needed for inner-circle testing.
- [!] [H] Custom SMTP is required before Supabase Auth email branding can be customized.

Exit criteria:

- A tester can create/confirm/sign into an account and reliably land on a backend-hydrated profile with photos.

## M4 - Supabase Source-Of-Truth App Session

Status: `[~]`

Done:

- [x] [C] Backend match/thread hydration exists.
- [x] [C] Backend profile display cache exists.
- [x] [C+U] Read watermarks hydrate from backend.
- [x] [C+U] Realtime/polling refresh paths exist.
- [x] [C] Protected routes wait for profile hydration.
- [x] [C+U] Repeated Android Chrome browser-back flows across Matches and Inbox passed after earlier fixes.
- [x] [C] `backendMatchesHydrated` bootstrap gate has been added so Supabase tabs wait for initial match/thread hydration after profile hydration.
- [x] [C] Bootstrap/back instrumentation has been added for Android Chrome UAT diagnostics.
- [x] [C] Matches cards mark a match as seen before navigating to detail, so immediate back cannot outrun the detail-screen seen effect.
- [x] [C+U] Focused UAT confirmed Android Chat, desktop Chat, desktop Match Detail, and Android Match Detail back navigation return to canonical views without white browser reload, stale detail screen, hash sentinel, or empty/fixture-only state.

Remaining:

- [x] [C] Implement foundation Slice 1 navigation cleanup and remove Match-tab hash sentinel / Match Detail web `popstate` workaround as active strategy.
- [x] [U] UAT Android Chrome order-dependent browser-back behavior: Inbox conversation back first, then Match Detail back in the same session.
- [ ] [C+U] Monitor Android Match Detail's brief app-background loading step; optimize only if it is multi-second, frequent after warmup, or loses rows/highlight state.
- [ ] [C+U] Ensure first app entry does not render empty Matches/Inbox before backend state is ready.
- [ ] [C+U] Confirm bootstrap does not deadlock for users with zero matches.
- [ ] [C+U] Confirm bootstrap does not block mock mode.
- [ ] [C+U] Confirm profile switch/sign-out/sign-in resets bootstrap state correctly.
- [ ] [H] Decide whether seen-match/highlight state must move from local storage to backend for inner-circle testing.

Exit criteria:

- Supabase signed-in users enter tabs only after backend session state is ready or a deliberate empty backend state is known.
- Local cache can improve speed but does not define the first visible truth.

## M5 - Discovery, Swipes, Reciprocal Matches

Status: `[~]`

Done:

- [x] [C] Supabase discovery service exists.
- [x] [C+U] Backend real/dev profiles can appear in Discover and open detail screens.
- [x] [C] Fixture profiles can support dev/test auto-match flows.
- [x] [C+U] One-sided real-profile likes no longer create local active matches.
- [x] [C+U] Reciprocal backend matches hydrate after sign-out/sign-in.
- [x] [C+U] Already matched backend real/dev profiles are excluded from Fruit.

Remaining:

- [ ] [C] Make backend discovery the clear source of truth for Supabase mode.
- [ ] [C+U] Confirm blocked/invisible/suspended users are excluded in hosted UAT.
- [ ] [C+U] Confirm pass/like/super-like state persists and affects discovery consistently.
- [ ] [H] Decide whether fixture profile images should be ingested into Supabase Storage.
- [x] [C] Keep Fruit/mock profiles explicitly separated from real Supabase discovery.

Exit criteria:

- Supabase discovery/matching behavior matches database state and cannot create local-only false matches.

## M6 - Active-Match Chat

Status: `[~]`

Done:

- [x] [C] Backend text message send exists for active Supabase matches.
- [x] [C] Backend thread hydration exists.
- [x] [C+U] Read state persists in `match_read_states`.
- [x] [C+U] Realtime-triggered match/message refresh works in hosted UAT.
- [x] [C] Chat route is guarded by active-match checks.

Remaining:

- [ ] [C] Make text chat backend-first for Supabase mode.
- [ ] [H] Decide what to do with local simulated replies and photo-request behavior in Supabase mode.
- [ ] [C+U] Confirm message send failures do not create misleading local sent state.
- [ ] [C+U] Confirm unmatch/block immediately prevents further message visibility and sending.
- [ ] [C] Confirm private messages are never sent to analytics/logging.

Exit criteria:

- Active matched users can chat reliably; unmatched/blocked/non-matches cannot read or send messages.

## M7 - Safety, Moderation, Privacy, Account Deletion

Status: `[~]`

Done:

- [x] [C] Age gate exists.
- [x] [C] Terms/privacy/community standards access exists through env-configurable URLs.
- [x] [C] Support/contact access exists through env-configurable URL/email.
- [x] [C] Report profile/report message/block/unmatch/account deletion surfaces exist.
- [x] [C] Safety RPCs/RLS tests exist for key server-side restrictions.
- [x] [C] Account deletion request flow exists.
- [x] [C] Service-role keys are not shipped in the mobile app.

Remaining:

- [ ] [U] Hosted UAT report profile, report message, block, unmatch, and account deletion request with real accounts.
- [ ] [C] Document Supabase Studio moderation workflow for inner-circle testing.
- [ ] [C+U] Confirm blocked users disappear from discovery, matches, and chat in hosted mode.
- [ ] [C+U] Confirm suspended/invisible users do not appear in discovery.
- [ ] [C] Confirm no private messages, raw profile text, or PII are sent to analytics/logging.
- [ ] [C] Confirm seed fixtures contain no real user data and no explicit sexual demo content.
- [!] [H] Real public legal/support/account deletion URLs are still needed before production/TestFlight polish.

Exit criteria:

- Safety flows are backend-persistent and enforce visibility/message restrictions server-side.

## M8 - Inner-Circle Beta Readiness

Status: `[ ]`

Goal:

- A small trusted group can use Orchard on iOS or mobile web/ngrok with real accounts, profile photos, discovery, reciprocal matches, chat, safety flows, and a feedback channel.

Remaining:

- [ ] [C+U] Complete M4 session bootstrap.
- [ ] [C+U] Complete enough M5/M6/M7 hosted UAT to trust real tester flows.
- [ ] [C+H] Prepare seeded/demo accounts and tester instructions.
- [ ] [H] Decide feedback channel and support process.
- [ ] [H] Decide whether analytics/crash reporting are required before inner-circle testing.
- [ ] [C+H] Confirm privacy posture for test data and fixtures.
- [ ] [C+H] Confirm whether mobile web/ngrok is acceptable for the first inner-circle pass before TestFlight.

Exit criteria:

- Human tester can onboard, discover, match, chat, report/block/unmatch, and request account deletion without agent intervention.

## M9 - Analytics, Crash Reporting, QA Hardening

Status: `[ ]`

Remaining:

- [ ] [H] Decide PostHog, Sentry, both, or neither for inner-circle testing.
- [ ] [C] Add env-gated analytics/crash setup if approved.
- [ ] [C] Track privacy-safe funnel/safety events only.
- [ ] [C] Do not capture private messages, raw profile text, or PII.
- [ ] [C] Create repeatable UAT checklist for auth, onboarding, discovery, matching, chat, safety, and sign-out/sign-in.
- [ ] [H] Decide whether to automate more E2E/browser smoke checks.
- [ ] [C] Add or confirm app-level error boundary strategy before broader tester release.

Exit criteria:

- Failures are observable enough for a closed beta without violating privacy expectations.

## M10 - iOS TestFlight Release

Status: `[!]`

Blocked/human decisions:

- [!] [H] Apple Developer Program account.
- [!] [H] App Store Connect app setup.
- [!] [H] Real domain/public URLs for privacy, terms, community standards, support, and account deletion.

Remaining:

- [ ] [C] Add or verify `eas.json`.
- [ ] [C] Configure EAS build profiles.
- [ ] [C+H] Verify app name, bundle id, version/build number.
- [ ] [C+H] Review icon, splash, and permission strings.
- [ ] [C+H] Prepare beta app description.
- [ ] [C+H] Prepare reviewer notes.
- [ ] [C+H] Prepare demo account or seeded beta data.
- [ ] [C+H] Produce iOS build.
- [ ] [H] Upload to TestFlight.

Exit criteria:

- Orchard can be installed by TestFlight testers and satisfies basic Apple beta review expectations.

## M11 - Android Later

Status: `[ ]`

Remaining:

- [ ] [H] Decide production package name.
- [ ] [C+H] Review adaptive icon and Android permissions.
- [ ] [C] Configure Android EAS build/AAB.
- [ ] [C+H] Prepare Play Console internal testing docs.

Exit criteria:

- Android build path exists after iOS MVP is stable.

## Human Decisions Register

- [!] [H] Apple Developer Program account creation.
- [!] [H] App Store Connect app setup.
- [!] [H] Real public domain and legal/support/deletion URLs.
- [!] [H] Supabase Auth custom SMTP/email branding for Orchard.
- [ ] [H] Backend-backed seen-match/highlight state for inner-circle testing versus local-only seen state.
- [ ] [H] Analytics/crash reporting stack and timing.
- [ ] [H] Fixture image ingestion into Supabase Storage.
- [ ] [H] Automatic Supabase DB tests in CI for migration PRs.
- [ ] [H] Feedback channel and support process for inner-circle testers.
- [ ] [H] Whether mobile web/ngrok is acceptable for first inner-circle testing before TestFlight.

## Deferred / Out Of Scope For Closed Beta

- Real purchases, App Store subscriptions, RevenueCat, or paid-service dependencies.
- Boost/super-like upsells or artificial match limits.
- Advanced ranking or ML matching.
- Video profiles.
- Group chat.
- Public App Store launch polish.
- Android production launch.

## Maintenance Rule

Update this tracker whenever:

- A milestone changes status.
- A task is completed or newly discovered.
- UAT feedback is accepted or rejected.
- A blocker is resolved or introduced.
- A milestone exit criterion changes.
- A human decision is made.

`docs/project-status.md` should remain the narrative status log. This file is the canonical checklist and milestone source of truth.

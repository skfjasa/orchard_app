# Orchard Milestone Tracker

Last updated: 2026-07-06

This is the durable checklist for Orchard release planning. Use it to answer "where are we?", "what is next?", and "what blocks the next milestone?" without reconstructing status from session handoffs.

Status key:

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

## Current Priority

Current milestone: **M4 - Supabase source-of-truth session bootstrap for inner-circle testing**.

Immediate acceptance target:

- Supabase sign-in waits for backend profile, active matches, display profiles/photos, inbox/thread summaries, and read state before protected app tabs render.
- Android Chrome device/browser back from Match Detail and Chat does not briefly show empty Matches/Inbox states.
- Mock/Fruit/demo mode still works when Supabase env vars are absent or when explicitly testing fixture behavior.

## Current UAT Guide

Purpose: validate the Supabase backend match/thread bootstrap gate and Android Chrome back behavior before continuing broader source-of-truth work.

Expected behavior:

- After signing into Supabase mode, the app may stay on a loader/finalizing state briefly.
- Protected tabs should not render until backend profile and first match/thread hydration have completed.
- On first tab entry, Matches should not briefly say "No matches" when hosted active matches exist.
- On first tab entry, Inbox should not briefly say "No conversations" when hosted conversations exist.
- Android Chrome device back or swipe-back from Match Detail should return to Matches with all expected rows visible.
- Android Chrome device back or swipe-back from Chat should return to Inbox with all expected rows visible.
- Match highlight/badge changes should apply after viewing a match detail.
- Match highlight/badge should clear on Matches card press before navigation, so an immediate back gesture should not outrun the detail-screen seen effect.
- A brand-new incognito session may show active matches as unseen again because seen-match/highlight state is still local-only unless we decide to move it backend-side.
- Latest known failure before this patch: after fresh sign-in, Inbox conversation back can pass first, but then Match Detail back in the same Android Chrome session repeatedly shows a blank white ~0.5-1 second browser reload/state gap. The URL stays on `/matches` while Match Detail is visible and rows return by themselves. Earlier attempts also restored all match highlights/badge count after the flash; Match-tab navigation now awaits durable seen-match persistence before opening detail.

Primary UAT checklist:

1. Open a fresh Android Chrome incognito tab with the current ngrok/web URL.
2. Sign in as `t`.
3. Confirm the app waits on loader/finalizing long enough to hydrate backend state, then enters the app.
4. Open Matches and confirm expected rows appear on first render: fixture match plus real/dev matches for `tt` and `test2`, if hosted data still matches the current test fixture state.
5. Open Inbox and confirm expected conversation rows appear on first render: fixture conversation plus real/dev hosted conversations, if hosted data still matches the current test fixture state.
6. From Matches, open a real/dev profile and immediately use Android device back or swipe-back.
7. Confirm Matches does not briefly render "No matches" or fixture-only state.
8. Confirm the opened real/dev match no longer has the new-match highlight and the badge count updates.
9. Repeat steps 6-8 for the other real/dev match.
10. From Inbox, open a real/dev conversation and immediately use Android device back or swipe-back.
11. Confirm Inbox does not briefly render "No conversations" and all expected conversation rows remain visible.
12. Repeat step 10-11 for the other real/dev conversation.
13. Run the order-dependent regression: fresh incognito sign-in, Inbox conversation back first, then without resetting the session open Match Detail and use Android device/swipe back.
14. Confirm the URL shows `/matches#match-...` while Match Detail is visible from the Match tab.
15. Confirm Android device/swipe back removes the hash, does not show a blank white browser window, and does not reset all match highlights.
16. Regression-check the opposite order: fresh incognito sign-in, Match Detail back first, then Inbox conversation back.
17. Regression-check desktop Chrome: browser back from Chat and Match Detail should return to the expected tab route without empty tab states.

If UAT fails, capture:

- Account used.
- Exact route sequence.
- URL before pressing Android back.
- URL after Android back.
- Whether the empty state says "No matches", "No conversations", fixture-only, or something else.
- Whether rows return by themselves, and how long it takes.
- Whether visiting Fruit/Discover restores rows.
- Whether the issue happens only on first attempt after sign-in or on repeated attempts.
- Any visible console output if Android Chrome remote debugging is available.

If UAT fails, next Codex action:

- Use the newly added instrumentation to inspect canonical browser back, protected-route state, backend profile bootstrap, `refreshBackendMatches`, `likedIds` application, conversation application, and protected-route release timing.
- Verify hosted SQL state for the affected accounts before assuming an app-side failure.

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
| M7 | Safety, moderation, privacy, account deletion | [~] | Report/block/unmatch/account deletion/support/legal flows work in backend-backed mode and satisfy TestFlight expectations. |
| M8 | Inner-circle beta readiness | [ ] | A small trusted tester group can use Orchard on iOS with seeded/demo data, stable auth/session behavior, safety flows, and feedback capture. |
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

Remaining:

- [ ] [C] Keep `docs/milestone-tracker.md`, `.agents/current.md`, `.agents/next.md`, and `docs/project-status.md` in sync when milestone status changes.

## M1 - App Foundation And Adapter Boundaries

Status: `[~]`

Done:

- [x] [C] Expo Router app structure exists.
- [x] [C] Prototype UI is preserved.
- [x] [C] Service interfaces and mock adapters exist.
- [x] [C] Supabase adapters exist for several backend domains.
- [x] [C] Backend/mock service factory exists.
- [x] [C] Read-path selectors exist for matched profiles, inbox rows, profile lookup, conversations, active-match checks, and tab badges.

Remaining:

- [ ] [C] Continue reducing `ProfileProvider` responsibility without a bulk rewrite.
- [ ] [C] Keep screens consuming provider/service selectors instead of rebuilding raw local state.
- [ ] [C] Isolate mock/Fruit behavior from Supabase signed-in runtime state.

Exit criteria:

- Screens remain UI-focused.
- Backend/mock behavior is chosen through service boundaries.
- Mock mode remains reliable.

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

Exit criteria:

- Dev backend is stable enough for inner-circle testing and has reproducible migrations/tests.

## M3 - Real Auth, Onboarding, Profile Storage, Photos

Status: `[~]`

Done:

- [x] [C] Email/password signup and sign-in are wired.
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
- [x] [C+U] Android Chrome browser-back handling uses canonical app routes.
- [x] [C] `backendMatchesHydrated` bootstrap gate has been added so Supabase tabs wait for initial match/thread hydration after profile hydration.
- [x] [C] Bootstrap/back instrumentation has been added for Android Chrome UAT diagnostics.
- [x] [C] Matches cards mark a match as seen before navigating to detail, so immediate back cannot outrun the detail-screen seen effect.
- [x] [C] Match Detail now opts into web `popstate` normalization and uses `router.replace` to the canonical tab destination; Match-tab cards add a web-only `/matches#match-...` sentinel and await direct seen-match storage persistence before opening detail. Chat remains unchanged because Inbox/Chat back currently passes.

Remaining:

- [ ] [U] UAT Android Chrome order-dependent browser-back behavior: Inbox conversation back first, then Match Detail back in the same session.
- [ ] [C+U] Ensure first app entry does not render empty Matches/Inbox before backend state is ready.
- [ ] [C+U] Confirm bootstrap does not deadlock for users with zero matches.
- [ ] [C+U] Confirm bootstrap does not block mock mode.
- [ ] [C+U] Confirm profile switch/sign-out/sign-in resets bootstrap state correctly.
- [ ] [C] Instrument bootstrap sequence if UAT still shows transient empty state.
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
- [ ] [C] Keep Fruit/mock profiles explicitly separated from real Supabase discovery.

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

Remaining:

- [ ] [U] Hosted UAT report profile, report message, block, unmatch, and account deletion request with real accounts.
- [ ] [C] Document Supabase Studio moderation workflow for inner-circle testing.
- [ ] [C+U] Confirm blocked users disappear from discovery, matches, and chat in hosted mode.
- [ ] [C+U] Confirm suspended/invisible users do not appear in discovery.
- [!] [H] Real public legal/support/account deletion URLs are still needed before production/TestFlight polish.

Exit criteria:

- Safety flows are backend-persistent and enforce visibility/message restrictions server-side.

## M8 - Inner-Circle Beta Readiness

Status: `[ ]`

Goal:

- A small trusted group can use Orchard on iOS or mobile web/ngrok with real accounts, profile photos, discovery, reciprocal matches, chat, and safety flows.

Remaining:

- [ ] [C+U] Complete M4 session bootstrap.
- [ ] [C+U] Complete enough M5/M6/M7 hosted UAT to trust real tester flows.
- [ ] [C+H] Prepare seeded/demo accounts and tester instructions.
- [ ] [H] Decide feedback channel and support process.
- [ ] [H] Decide whether analytics/crash reporting are required before inner-circle testing.
- [ ] [C+H] Confirm privacy posture for test data and fixtures.

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
- [!] [H] Real public domain and legal/support/deletion URLs.
- [!] [H] Supabase Auth custom SMTP/email branding for Orchard.
- [ ] [H] Backend-backed seen-match/highlight state for inner-circle testing versus local-only seen state.
- [ ] [H] Analytics/crash reporting stack and timing.
- [ ] [H] Fixture image ingestion into Supabase Storage.
- [ ] [H] Automatic Supabase DB tests in CI for migration PRs.

## Maintenance Rule

Update this tracker whenever:

- A milestone changes status.
- A task is completed or newly discovered.
- A blocker is resolved or introduced.
- A milestone exit criterion changes.

`docs/project-status.md` should remain the narrative status log. This file should remain the concise milestone checklist.

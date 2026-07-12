# Next Task

Continue safely through the milestone list from `docs/milestone-tracker.md`.

Recommended next non-UAT task:

1. Corrected backlog item 1 is complete at `bcd6961` with Bun-native application tests, one pure-service test, and an application-test step in regular Expo CI.
2. Corrected backlog item 3 is implemented at `280b601` with automated checks passed and targeted hosted UAT pending.
3. Corrected backlog item 4 is implemented at `ddac497` with full reset, 67 pgTAP cases, and database lint passing; hosted preflight/apply/UAT remain pending.
4. Corrected backlog item 5 is implemented at `96c25bc` with 35 Bun tests, 75 pgTAP cases, typecheck, lint, database lint, and diff check passing; human UAT remains pending.
5. Item 2 remains unimplemented. Do not begin item 6 without explicit selection.
6. Run the documented read-only hosted photo-path preflight before any item 4 hosted apply. If it returns unexplained rows, stop for human remediation.
7. Run item 3, item 4, and item 5 targeted UAT when human accounts/sessions are available; otherwise wait for explicit instruction before another audit slice.
8. Keep every change PR-sized and preserve mock/demo behavior, storage compatibility, and the current UI.
9. Avoid a broad `ProfileProvider` rewrite.
10. Avoid changing Supabase-mode fixture simulated replies/photo-request behavior until the M6 product decision is made.
11. Keep hosted UAT items open unless a human/device test is actually run.

Avoid changing Supabase-mode fixture simulated replies/photo behavior until the product decision in M6 is made.

## Startup Context

Read these first:

- `AGENTS.md`
- `.agents/current.md`
- `.agents/next.md`
- `docs/milestone-tracker.md`
- `docs/project-status.md`

Read if relevant:

- `docs/supabase-schema.md`
- `docs/supabase-hardening-plan.md`
- `docs/supabase-moderation-workflow.md`
- `docs/profile-provider-map.md`
- `docs/repo-audit-and-foundation-plan.md`
- `docs/2026-07-10-repository-audit-gpt-5.6-sol-ultra.md`

## Latest Completed Work

- Latest code checkpoint is `96c25bc` - Make onboarding completion two-phase.
- Corrected backlog item 5 separates incomplete preparation, idempotent member/settings/photo persistence, and scoped finalization. Completed profile conflicts are returned authoritatively, incomplete rows resume through pending onboarding or the existing setup entry, and protected routes reject incomplete server rows.
- `expo/services/supabase-service-response.test.ts` proves Bun can run TypeScript application tests against a pure service, covering both configured-client success and missing-configuration failure responses.
- Regular Expo CI now runs `bun test` after its existing frozen-lockfile install. The manual Supabase DB workflow remains dispatch-only and unchanged.
- Corrected backlog item 3 removes chat-triggered swipe repair. Backend chat lookup now returns `match_not_found` for missing/inactive matches without calling swipes, the provider preserves bounded stale target cleanup, and valid sends remain backend-first.
- Focused tests cover no-swipe missing/inactive paths, cleanup isolation, successful send/echo behavior, lookup and RLS failure distinction, mock skip behavior, and unchanged explicit swipe behavior.
- Corrected backlog item 4 adds local migration `202607110001`, fail-fast hosted-data diagnostics, constraint-level photo path ownership, hardened metadata write policies, and 22 focused pgTAP assertions while preserving existing storage visibility/write policies.
- `docs/2026-07-10-repository-audit-gpt-5.6-sol-ultra.md` contains the original audit plus an authoritative adversarial section that corrects mixed/overstated findings and provides an 18-slice `[C]`/`[C+U]` backlog.
- Part 4 React Query/auth/error-boundary stabilization is implemented:
  - Profile and conversation persistence callbacks no longer depend on unstable React Query mutation result objects.
  - `AuthProvider` processes `Linking.getInitialURL()` so cold-start password-reset/email-confirmation callbacks can restore sessions.
  - Tab and onboarding route groups now have local retry error boundaries.
- Local purchase/subscription result application now lives in `expo/services/local-monetization-service.ts`; provider facade actions delegate store updates while preserving demo behavior.
- Local seen-match state/ref application for `markMatchSeen` now delegates to `expo/services/local-interaction-service.ts`.
- Backend pass-swipe persistence now calls `recordBackendSwipe` directly through `expo/services/backend-swipe-action-service.ts` instead of a provider-owned wrapper.
- Matches/Inbox focus refresh no longer depends on a provider `refreshBackendMatches` facade; focused read-model hooks invalidate the React Query matches key directly.
- No production analytics calls or private message-body logging were found, but the 2026-07-10 audit supersedes the prior broader privacy claim because diagnostics still expose a raw sign-in identifier, stable ids, and a selected-photo URI.
- Super-like recharge timing calculation now lives in `expo/services/local-monetization-service.ts`; `ProfileProvider` keeps only the effect that applies the store reset.
- Partner-link local profile mutations now share one provider-local persistence helper instead of repeating the same wrapper across invite/resend/accept/remove.
- M6 source audit confirmed Supabase text-send failures do not create a misleading local sent message; remaining acceptance is hosted failure-path UAT and possible visible retry/error UX.
- Server-side message policies correctly deny direct read/send while a match is inactive, but the 2026-07-10 audit found that stale chat sending can create a new like and active rematch.
- M6 source audit confirmed real/non-fixture Supabase text chat is backend-first; fixture simulated replies/photo-request behavior remains pending product decision.
- Supabase-mode Discover now relies on backend discovery/swipe state for query exclusions instead of local liked/passed ids; mock mode still uses local exclusions.
- Draft tester instructions, beta description, and App Store reviewer-note scaffolding now live in `docs/beta-release-notes.md` with placeholders only.
- TestFlight app metadata/icon/splash/permission-string audit is recorded; `expo/app.json` requests no camera permission, but adversarial Expo introspection still emitted Android camera permission, so native permission minimization remains open.
- Root Expo Router error boundary added in `expo/app/_layout.tsx`.
- EAS build configuration added in `expo/eas.json`.
- Hosted filtering source audit recorded; code/RLS coverage is done and hosted UAT remains.
- Repeatable full-flow UAT checklist added to `docs/milestone-tracker.md`.
- Supabase Studio moderation workflow documented in `docs/supabase-moderation-workflow.md`.
- Fixture profile copy restored after over-broad neutralization; human-like fake profile language is intentionally preserved.
- Privacy/logging audit recorded.
- Local read/seen preference calculations extracted from `ProfileProvider`.

## Latest Validation

- `expo\node_modules\.bin\supabase db reset`: passed through migration `202607110001` and seed.
- `expo\node_modules\.bin\supabase test db`: passed, 1 file and 75 pgTAP cases.
- `expo\node_modules\.bin\supabase db lint --level warning`: passed with no schema errors.
- `cd expo; bun test`: passed after item 5 (35 tests, 72 assertions).
- `cd expo; bun run typecheck`: passed after item 5.
- `cd expo; bun run lint`: passed after item 5.
- `git diff --check`: passed after item 5 with only existing LF-to-CRLF warnings.
- `cd expo; bun run typecheck`: passed after chat swipe-repair removal.
- `cd expo; bun run lint`: passed after chat swipe-repair removal.
- `git diff --check`: passed after chat swipe-repair removal, with only LF-to-CRLF working-copy warnings.
- `cd expo; bun test`: passed for the minimal application test harness (1 test, 2 assertions).
- `cd expo; bun run typecheck`: passed after the harness.
- `cd expo; bun run lint`: passed after the harness.
- `git diff --check`: passed after the harness, with only LF-to-CRLF working-copy warnings.
- `cd expo; bun run typecheck`: passed during the 2026-07-10 read-only audit.
- `cd expo; bun run lint`: passed during the 2026-07-10 read-only audit.
- Current GitHub Expo Checks for `dfac3c2`: passed.
- The latest July Supabase migrations were not rerun during the audit; the database workflow remains manual-only.
- `cd expo; bun run typecheck`: passed after Part 4 stabilization.
- `cd expo; bun run lint`: passed after Part 4 stabilization.
- `git diff --check`: passed after Part 4 stabilization and status doc updates.
- `cd expo; bun run typecheck`: passed after monetization result application cleanup.
- `cd expo; bun run lint`: passed after monetization result application cleanup.
- `git diff --check`: passed after monetization result application cleanup.
- `cd expo; bun run typecheck`: passed after local seen-match action cleanup.
- `cd expo; bun run lint`: passed after local seen-match action cleanup.
- `git diff --check`: passed after local seen-match action cleanup.
- `cd expo; bun run typecheck`: passed after backend pass-swipe wrapper cleanup.
- `cd expo; bun run lint`: passed after backend pass-swipe wrapper cleanup.
- `git diff --check`: passed after backend pass-swipe wrapper cleanup.
- `cd expo; bun run typecheck`: passed after M5 discovery change.
- `cd expo; bun run lint`: passed after M5 discovery change.
- `git diff --check`: passed after M5 discovery change.
- `expo/app.json` parsed after permission-string config.
- `git diff --check`: passed after final docs-only sync `bd7c53a`; typecheck/lint were not rerun because no runtime code changed.

## UAT Still Needed

- Forgot-password hosted flow.
- Full sign-up/sign-in/profile/photo flow on target mobile browser and later iOS device.
- M4 bootstrap edge cases: zero matches, mock mode, sign-out/sign-in/profile switch.
- M5/M6/M7 hosted real-account flows: discovery filtering, pass/like persistence, chat failure behavior, block/unmatch/report/account deletion.
- Corrected item 5 immediate-session, confirmation-required, failure/retry, incomplete-relaunch, completed-profile, and mock regression UAT.
- Corrected item 2 remains open; item 3 remains awaiting UAT; item 4 remains awaiting hosted preflight/apply/UAT; do not begin item 6 without explicit instruction.

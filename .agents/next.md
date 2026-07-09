# Next Task

Continue safely through the milestone list from `docs/milestone-tracker.md`.

Recommended next non-UAT task:

1. Continue non-human M1 provider/facade cleanup.
2. Inspect residual `ProfileProvider` state/action wrappers and extract only a small, behavior-preserving helper if it reduces provider ownership.
3. Avoid changing Supabase-mode fixture simulated replies/photo-request behavior until the M6 product decision is made.
4. Keep hosted UAT items open unless a human/device test is actually run.

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

## Latest Completed Work

- M6 source audit confirmed Supabase text-send failures do not create a misleading local sent message; remaining acceptance is hosted failure-path UAT and possible visible retry/error UX.
- M6 source audit confirmed unmatch/block remove local conversation visibility and server-side message policies deny read/send once a match is inactive; hosted UAT remains.
- M6 source audit confirmed real/non-fixture Supabase text chat is backend-first; fixture simulated replies/photo-request behavior remains pending product decision.
- Supabase-mode Discover now relies on backend discovery/swipe state for query exclusions instead of local liked/passed ids; mock mode still uses local exclusions.
- Draft tester instructions, beta description, and App Store reviewer-note scaffolding now live in `docs/beta-release-notes.md` with placeholders only.
- TestFlight app metadata/icon/splash/permission-string audit is recorded; `expo/app.json` has explicit photo-library and microphone permission strings and blocks camera permission.
- Root Expo Router error boundary added in `expo/app/_layout.tsx`.
- EAS build configuration added in `expo/eas.json`.
- Hosted filtering source audit recorded; code/RLS coverage is done and hosted UAT remains.
- Repeatable full-flow UAT checklist added to `docs/milestone-tracker.md`.
- Supabase Studio moderation workflow documented in `docs/supabase-moderation-workflow.md`.
- Fixture profile copy restored after over-broad neutralization; human-like fake profile language is intentionally preserved.
- Privacy/logging audit recorded.
- Local read/seen preference calculations extracted from `ProfileProvider`.

## Latest Validation

- `cd expo; bun run typecheck`: passed after M5 discovery change.
- `cd expo; bun run lint`: passed after M5 discovery change.
- `git diff --check`: passed after M5 discovery change.
- `expo/app.json` parsed after permission-string config.

## UAT Still Needed

- Forgot-password hosted flow.
- Full sign-up/sign-in/profile/photo flow on target mobile browser and later iOS device.
- M4 bootstrap edge cases: zero matches, mock mode, sign-out/sign-in/profile switch.
- M5/M6/M7 hosted real-account flows: discovery filtering, pass/like persistence, chat failure behavior, block/unmatch/report/account deletion.

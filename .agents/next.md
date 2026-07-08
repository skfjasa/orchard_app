# Next Task

Continue safely through the milestone list from `docs/milestone-tracker.md`.

Recommended next non-UAT task:

1. Continue TestFlight/beta preparation that does not require Apple credentials.
2. Good candidates: app metadata/icon/splash/permission-string review notes or tester instruction scaffolding with placeholders for human-owned account details.
3. Keep M5/M6 source-of-truth cleanup available, but avoid chat fixture/photo behavior changes until the product decision is made.

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

- Root Expo Router error boundary added in `expo/app/_layout.tsx`.
- EAS build configuration added in `expo/eas.json`.
- Hosted filtering source audit recorded; code/RLS coverage is done and hosted UAT remains.
- Repeatable full-flow UAT checklist added to `docs/milestone-tracker.md`.
- Supabase Studio moderation workflow documented in `docs/supabase-moderation-workflow.md`.
- Fixture profile copy restored after over-broad neutralization; human-like fake profile language is intentionally preserved.
- Privacy/logging audit recorded.
- Local read/seen preference calculations extracted from `ProfileProvider`.

## Latest Validation

- `cd expo; bun run typecheck`: passed.
- `cd expo; bun run lint`: passed.
- `git diff --check`: passed.

## UAT Still Needed

- Forgot-password hosted flow.
- Full sign-up/sign-in/profile/photo flow on target mobile browser and later iOS device.
- M4 bootstrap edge cases: zero matches, mock mode, sign-out/sign-in/profile switch.
- M5/M6/M7 hosted real-account flows: discovery filtering, pass/like persistence, chat failure behavior, block/unmatch/report/account deletion.

# Recommended Codex Skills

Do not install these automatically. This document defines project-specific Skills that can be created later.

## 1. `repo-audit`

When to use:

- After Rork changes.
- After repo restructuring.
- After generated-code changes.

Checks:

- Stack
- Screens
- Mocks
- Routing
- State providers
- Scripts
- Deployment blockers

Expected output:

- Structured repository audit.
- Current risks and blockers.

Must not do:

- Modify files.
- Install dependencies.

## 2. `dependency-review`

When to use:

- Before adding packages.
- Before adding services.

Checks:

- Cost
- Maintenance health
- Expo compatibility
- iOS/Android compatibility
- Security implications
- Whether current dependencies already solve the problem

Expected output:

- Add/avoid recommendation.
- Tradeoffs.
- Safer alternatives.

Must not do:

- Install packages automatically.
- Add paid services without human approval.

## 3. `provider-extraction`

When to use:

- Before changing `expo/providers/profile-provider.tsx`.

Checks:

- Current provider responsibilities.
- Behavior to preserve.
- Small extraction points.
- Mock/demo compatibility.

Expected output:

- Incremental extraction plan.
- Files to change.
- Manual test steps.

Must not do:

- One-shot provider rewrite.
- Break existing local swipe/chat/profile behavior.

## 4. `supabase-rls-review`

When to use:

- Migrations.
- Auth changes.
- Storage changes.
- Swipes/matches/chat changes.
- Blocks/reports changes.

Checks:

- RLS policies.
- Least privilege.
- No service-role key in app.
- Match/chat authorization.
- Block enforcement.
- Report creation permissions.

Expected output:

- Security review findings.
- Required policy changes.
- Residual risks.

Must not do:

- Apply production DB changes without human approval.
- Expose secrets.

## 5. `dating-safety-review`

When to use:

- Profile changes.
- Discovery changes.
- Swipe/match/chat changes.
- Report/block/unmatch/account deletion changes.

Checks:

- Report profile.
- Report message.
- Block user.
- Unmatch.
- Delete account.
- Blocked-user exclusion.
- Suspended-user exclusion.
- Active-match-only chat.

Expected output:

- Safety regression checklist.
- Missing MVP safety items.
- Manual QA steps.

Must not do:

- Treat safety as optional.
- Add analytics with PII/private messages.

## 6. `expo-mobile-build`

When to use:

- EAS changes.
- iOS config changes.
- Android config changes.
- TestFlight work.
- App config changes.

Checks:

- Bundle ID.
- Android package name.
- Icon.
- Splash.
- Permission strings.
- Build profiles.
- Env vars.
- Reviewer notes.

Expected output:

- Build readiness checklist.
- Commands run.
- Remaining release blockers.

Must not do:

- Upload or submit builds without human approval.
- Commit signing credentials.

## 7. `analytics-events`

When to use:

- PostHog, Firebase, or other analytics instrumentation.

Checks:

- Event names.
- Required properties.
- No profile text.
- No private messages.
- No PII.
- Graceful disabled mode.

Expected output:

- Event schema.
- Privacy review.
- QA steps.

Must not do:

- Send PII.
- Make analytics required for app startup.

## 8. `seed-beta-demo`

When to use:

- Demo profiles.
- Reviewer account.
- Beta seed data.

Checks:

- No real PII.
- No explicit sexual content.
- Reviewer-safe content.
- Clear fake/test data labeling.

Expected output:

- Seed data plan.
- Reviewer/demo account notes.
- Safety caveats.

Must not do:

- Use real user data.
- Add explicit sexual demo content.

# Orchard Beta Release Notes

Last updated: 2026-07-08

This is a release-prep reference for inner-circle beta and TestFlight setup. Keep the canonical milestone/task state in `docs/milestone-tracker.md`.

## Current Distribution State

- Preferred target: iOS TestFlight after Apple Developer and App Store Connect prerequisites are available.
- Interim target: hosted mobile web or ngrok preview if approved for the first inner-circle pass.
- Current app config: app name `Orchard`, version `1.0.0`, iOS bundle id `com.orchardapp.ios`.
- Real public URLs for privacy, terms, community standards, support, and account deletion are still required before TestFlight polish.

## Beta Description Draft

Orchard is a dating app prototype for polyamorous and ethically non-monogamous people. This beta focuses on structured relationship context before chat: relationship structure, partnered status, dating mode, boundaries, intent, compatibility expectations, reciprocal matches, and basic safety flows.

Testers should expect an early MVP with seeded/demo data, limited moderation tooling, and active iteration. The goal of this beta is to validate account setup, profile creation, discovery, matching, chat, reporting, blocking, unmatching, account deletion requests, and feedback capture before broader release.

## Tester Instructions Draft

Before testing:

- Use only test data. Do not enter sensitive personal details, real private messages, or private photos.
- Confirm you are using the current test build or hosted URL: `[TESTFLIGHT INVITE OR HOSTED URL]`.
- Send feedback and screenshots to: `[FEEDBACK CHANNEL OR SUPPORT CONTACT]`.
- If using seeded accounts, use only the credentials provided privately outside the repo.

Suggested test path:

1. Create an account or sign in with a provided test account.
2. Complete onboarding with test profile details and photos.
3. Browse discovery and verify that cards, profile detail, and navigation behave normally.
4. Like/pass profiles and confirm reciprocal matches appear only when expected.
5. Send text chat messages and try a photo request with non-sensitive test images only.
6. Use report, block, unmatch, and account deletion request flows.
7. Sign out and sign back in to confirm session/profile state restores correctly.
8. Record the device, browser/build, account used, exact steps, expected result, actual result, and screenshots if a bug occurs.

Known beta limits:

- Some moderation actions are reviewed through Supabase Studio until a dedicated admin surface exists.
- Analytics/crash reporting has not been selected yet.
- Local mock/demo behavior is intentionally preserved and may differ from hosted Supabase behavior.
- TestFlight availability depends on Apple Developer/App Store Connect setup.

## App Review Notes Draft

Purpose:

Orchard is an early closed beta dating app for polyamorous and ethically non-monogamous users. The beta validates structured relationship-context matching, reciprocal matches, active-match-only chat, and basic safety flows.

Login:

- Demo or seeded test account details will be provided privately in App Store Connect review notes.
- Do not commit reviewer credentials to the repo.

Features to review:

- Email sign-up/sign-in and profile onboarding.
- Profile photos and voice prompt recording.
- Discovery, like/pass actions, reciprocal matches, and match detail.
- Active-match chat, photo request handling, report, block, unmatch, support, and account deletion request flows.

Safety and privacy notes:

- Users must be 18+.
- The app should expose privacy, terms, community standards, support/contact, and account deletion access before TestFlight polish.
- Private messages, raw profile text, photos, and personally identifying details should not be captured in analytics.
- Service-role keys and private credentials must never ship in the app.


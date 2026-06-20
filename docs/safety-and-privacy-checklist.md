# Safety And Privacy Checklist

This checklist is mandatory for the TestFlight MVP.

## User Safety

- [x] 18+ gate exists.
- [x] Report profile works in local/mock flow.
- [x] Report message works in local/mock flow.
- [x] Block user works in local/mock flow.
- [x] Unmatch works in local/mock flow.
- [x] Account deletion is accessible in app.
- [x] Support/contact is accessible through env-configurable link/email.
- [x] Community standards are accessible through in-app copy and env-configurable link.

## Visibility And Access Rules

- [ ] Blocked users are excluded from discovery.
- [ ] Blocked users are excluded from matches.
- [x] Blocked users are excluded from local chat after block removes the local conversation.
- [ ] Suspended users are hidden from discovery.
- [ ] Invisible users are hidden from discovery.
- [x] Chat is limited to active local matches.
- [x] Unmatched users cannot continue local chat.

## Legal / Policy

- [x] Privacy policy is accessible through env-configurable placeholder URL.
- [x] Terms are accessible through env-configurable placeholder URL.
- [x] Community standards are accessible through in-app copy and env-configurable placeholder URL.
- [x] Account deletion process is documented for MVP handoff.
- [x] Support process is documented with placeholder email/URL.

## Data And Analytics

- [x] No service-role keys in app.
- [ ] No private messages in analytics.
- [ ] No raw profile text in analytics.
- [x] No unnecessary exact location collection for the intended MVP; current local mock coordinates still need backend privacy review before production use.
- [ ] No real user data in seed fixtures.
- [ ] No explicit sexual demo content for reviewer/test data.

## Backend Enforcement

- [x] RLS draft/tests cover users updating only their own profiles.
- [x] RLS draft/tests cover non-match chat restrictions.
- [x] RLS draft/tests cover non-match message restrictions.
- [x] RLS draft/tests cover server-side block enforcement.
- [x] RLS draft/tests cover reports created by authenticated users.
- [x] Service role is never exposed to the mobile app.

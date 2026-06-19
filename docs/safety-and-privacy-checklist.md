# Safety And Privacy Checklist

This checklist is mandatory for the TestFlight MVP.

## User Safety

- [ ] 18+ gate exists.
- [ ] Report profile works.
- [ ] Report message works.
- [ ] Block user works.
- [ ] Unmatch works.
- [ ] Account deletion is accessible in app.
- [ ] Support/contact is accessible.
- [ ] Community standards are accessible.

## Visibility And Access Rules

- [ ] Blocked users are excluded from discovery.
- [ ] Blocked users are excluded from matches.
- [ ] Blocked users are excluded from chat.
- [ ] Suspended users are hidden from discovery.
- [ ] Invisible users are hidden from discovery.
- [ ] Chat is limited to active matches.
- [ ] Unmatched users cannot continue chat.

## Legal / Policy

- [ ] Privacy policy is accessible.
- [ ] Terms are accessible.
- [ ] Community standards are accessible.
- [ ] Account deletion process is documented.
- [ ] Support process is documented.

## Data And Analytics

- [ ] No service-role keys in app.
- [ ] No private messages in analytics.
- [ ] No raw profile text in analytics.
- [ ] No unnecessary exact location collection.
- [ ] No real user data in seed fixtures.
- [ ] No explicit sexual demo content for reviewer/test data.

## Backend Enforcement

- [ ] RLS prevents users from updating other users' profiles.
- [ ] RLS prevents non-match chat reads.
- [ ] RLS prevents non-match message sends.
- [ ] Blocks are enforced server-side.
- [ ] Reports can be created by authenticated users.
- [ ] Service role is never exposed to the mobile app.

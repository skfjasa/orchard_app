# Monetization Candidates

Monetization is out of scope for the feedback MVP. The MVP should demonstrate that the app works for poly/ENM dating discovery, matching, profile context, and chat without asking testers to evaluate paid flows.

This does not delete monetization ideas. Existing prototype monetization surfaces and future candidates should be flagged so they are easy to revisit later.

## Current Rule

- User-facing monetization is disabled for MVP.
- Monetizable features should be demoable without a paywall when monetization is disabled.
- Treat monetization as an entitlement/purchase layer around features, not as hard-coded feature availability.
- Do not add payment providers, subscriptions, purchase SDKs, or paid-service dependencies without human approval.
- Safety-critical features must not be paid-only.
- Core MVP feedback loops must remain free for testers.

## Code Flag

Use `expo/constants/features.ts`:

- `MVP_MONETIZATION_ENABLED`
- `MVP_SUPER_LIKES_ENABLED`
- `MONETIZATION_CANDIDATES`

When a feature is potentially monetizable, add it to `MONETIZATION_CANDIDATES` even if it is not enabled or implemented yet.
Use `demoEnabled` to distinguish a feature that is available in the feedback MVP from a feature that is actually monetized.

The intended future pattern is:

- Feature flag controls whether a product feature exists in the app.
- Entitlement state controls whether the current user has access.
- Purchase/paywall state controls how a user obtains an entitlement.
- Demo/beta mode can grant entitlements without payment.

Do not bake payment checks directly into core matching, chat, profile, safety, or onboarding logic.

## Existing Prototype Candidates

- Match slots
- Profile boosts
- Super Likes
- Plus / Pro subscriptions
- See who liked you

## Future Candidate Ideas

- Advanced relationship-context filters
- Profile insights
- Advanced verification
- Events or community features
- Priority placement, if it does not undermine trust or safety

## Not For MVP

- Real purchases
- App Store subscriptions
- RevenueCat or similar tooling
- Boosts/super-like upsells
- Artificial swipe or match limits

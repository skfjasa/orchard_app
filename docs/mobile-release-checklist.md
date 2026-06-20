# Mobile Release Checklist

## iOS First

Required accounts and setup:

- Apple Developer Program required; account still needs to be created.
- App Store Connect app required.
- Expo account required if using EAS.
- Current iOS bundle ID decision: `com.orchardapp.ios`.

App config:

- App name confirmed: Orchard.
- Bundle ID confirmed: `com.orchardapp.ios`.
- Version/build number set.
- Icon reviewed.
- Splash reviewed.
- Permission strings reviewed.
- `eas.json` added.
- EAS build profiles configured if Expo path is used.

Legal and safety URLs:

- Privacy Policy URL placeholder: `https://yourdomain.com/privacy`.
- Terms URL placeholder: `https://yourdomain.com/terms`.
- Account deletion URL placeholder: `https://yourdomain.com/delete`.
- Support URL/email placeholders: `https://yourdomain.com/support`, `support@yourdomain.com`.
- Community standards link placeholder: `https://yourdomain.com/community`.

Beta review:

- Demo account or seeded demo data.
- Reviewer notes.
- TestFlight beta description.
- External TestFlight review expectations.
- Report/block/unmatch/account deletion behavior documented.
- Simulated paywall/super-like/boost behavior hidden or explained.

Build:

- `bun install` succeeds from `expo/`.
- `bun run lint` succeeds or known issues are documented.
- EAS iOS build succeeds.
- TestFlight upload succeeds.

## Android Later

Required accounts and setup:

- Google Play Console required.
- Decide production package name.

App config:

- Adaptive icon reviewed.
- Android permissions reviewed.
- AAB build configured.

Release process:

- Internal testing track prepared.
- Data safety form prepared.
- Account deletion expectations addressed.
- Android build path documented after iOS MVP is stable.

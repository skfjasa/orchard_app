# Mobile Release Checklist

## iOS First

Required accounts and setup:

- Apple Developer Program required.
- App Store Connect app required.
- Expo account required if using EAS.
- Decide whether to replace current Rork bundle ID: `app.rork.h12kndiz6neur3chkh3q1`.

App config:

- App name confirmed.
- Bundle ID confirmed.
- Version/build number set.
- Icon reviewed.
- Splash reviewed.
- Permission strings reviewed.
- `eas.json` added.
- EAS build profiles configured if Expo path is used.

Legal and safety URLs:

- Privacy Policy URL.
- Terms URL.
- Account deletion URL or support process.
- Support URL/email.
- Community standards link.

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

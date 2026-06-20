# MVP Prototype Gap Assessment

Last updated: 2026-06-20

## Current Read

Orchard is close to a local clickable MVP prototype, but not yet a real multi-user MVP.

## Distance Estimate

- Local demo prototype: close, roughly 1-3 focused days of QA/polish.
- Real working MVP prototype with backend: roughly 2-4 focused weeks after the Supabase project exists and decisions stay unblocked.
- TestFlight-ready beta: roughly 4-6+ weeks depending on Apple Developer setup, hosted backend setup, public legal pages, EAS build work, and QA.

## What Works Today

- Onboarding exists, including required 18+ and MVP legal/community standards acceptance.
- Local profile creation persists to AsyncStorage.
- Mock discovery, local likes/passes, local match/conversation creation, and local chat work.
- Direct chat routes and local send helpers require an active local match.
- Report profile, report message, block, unmatch, account deletion request, and Safety & Legal entry points exist.
- Report flows include reason selection and optional details.
- Legal/support links are env-configurable.
- Supabase client/auth foundation, hardened schema/RLS/RPC draft, service adapters, local Supabase config, and database/RLS tests exist.
- Local Supabase database tests pass.

## Main Gaps

- Real Supabase Auth is not wired into onboarding/sign-in as the production identity flow.
- Onboarding/profile data is not persisted to Supabase as source of truth.
- Profile photos are not uploaded to Supabase Storage.
- Discovery still uses local mock profiles instead of backend eligibility queries.
- Swipe/match/chat source of truth is still local/mock.
- Safety actions have UI and service boundaries but depend on auth/profile persistence before they are truly backend-persistent in runtime.
- Hosted Supabase dev project has not been created/applied yet.
- EAS/TestFlight setup does not exist yet.
- Public legal/support pages use placeholder URLs until a real domain exists.

## Recorded Decisions

- App name: Orchard.
- iOS bundle ID: `com.orchardapp.ios`.
- Apple Developer account: needs to be created.
- Supabase dev project: `orchard-dev`.
- Supabase production project later: `orchard-prod`.
- Supabase region: East US (North Virginia) / `us-east-1`.
- Placeholder Privacy Policy URL: `https://yourdomain.com/privacy`.
- Placeholder Terms URL: `https://yourdomain.com/terms`.
- Placeholder Community Standards URL: `https://yourdomain.com/community`.
- Placeholder support email: `support@yourdomain.com`.
- Placeholder Support URL: `https://yourdomain.com/support`.
- Placeholder Account Deletion URL: `https://yourdomain.com/delete`.
- Account deletion MVP process: user requests deletion in app, request is stored, admin reviews/completes deletion in Supabase, and deletion/anonymization follows the policy.

## Next Recommended Path

1. Create Apple Developer Program account.
2. Create Supabase project `orchard-dev` in East US / `us-east-1`.
3. Apply and verify the hardened Supabase migration in `orchard-dev`.
4. Wire real Supabase Auth into onboarding/sign-in.
5. Persist onboarding/profile rows to Supabase.
6. Add Supabase Storage bucket/policies and upload profile photos.
7. Replace discovery with eligible backend profile queries.
8. Replace local swipe/match/chat source of truth gradually after auth/profile persistence works.
9. Add EAS build config and TestFlight metadata once backend and public legal placeholders are acceptable.

# Backend Migration Plan

## 1. Current State

The current app is a local/mock Rork prototype.

- `ProfileProvider` owns too much local behavior.
- Persistence is local via AsyncStorage.
- Discovery uses mock profiles.
- Swipes create local matches/conversations.
- Chat is local and simulated.
- Paywall, boosts, subscriptions, and Super Likes are simulated.
- No production backend is wired as the source of truth.
- Supabase JS dependency and env-gated client skeleton exist.
- Auth/session provider foundation exists.
- Supabase email/password auth is wired into sign-in and final onboarding completion when Supabase env vars are present.
- Initial Supabase schema migration draft exists and has been hardened before dev-project apply.
- Initial Supabase service adapters exist for swipes, matches, and safety flows.
- Backend/mock service factory exists with explicit per-service capabilities.
- Swipe persistence has a gated, non-blocking provider hook for Supabase mode only when the local profile id matches the authenticated user id.
- Safety service report and account deletion calls use RPCs so the database derives actor identity from `auth.uid()`.
- Initial database/RLS tests exist and pass against the local Supabase database.
- Docker Desktop is operational after enabling firmware virtualization.
- Hosted dev project decision: create `orchard-dev` in East US (North Virginia) / `us-east-1`; later production project should be `orchard-prod`.
- Hosted dev project `orchard-dev` exists and the local CLI is linked to project ref `cvvavwuksygahezzhmqp`.
- The migration now includes `profile_members` and requires profile photos to reference a member on the same profile, matching the app's single/couple `Profile.people[]` shape before hosted apply. Local database/RLS tests pass against this shape.
- The initial migration was pushed to hosted `orchard-dev`; migration history shows `202606190001` on both local and remote. Supabase Dashboard verification confirmed the hosted tables exist and RLS is enabled on public Orchard tables. CLI dry-run verification was temporarily blocked by Supabase auth throttling, but dashboard verification completed the hosted setup check.
- Real Supabase auth flow exists for email/password sign-in and account creation, and onboarding/profile rows persist to `profiles` and `profile_members`.
- Supabase Storage-backed upload for selected local onboarding profile photos exists. It writes private bucket objects, `profile_photos.member_id` metadata rows, and signed URLs during current-profile hydration. The storage migration has been pushed to hosted `orchard-dev`; app smoke testing with a selected photo is still pending.
- Reciprocal matching source of truth and chat backend are not fully wired yet.
- The project review's `ProfileProvider` concern should be handled incrementally by continuing to move behavior behind service adapters; avoid a one-pass provider rewrite.

## 2. Migration Principle

Do not rewrite the provider all at once.

Migration should:

- Introduce interfaces/adapters.
- Move one behavior at a time.
- Preserve mock implementation and add backend implementation side-by-side.
- Use env vars to choose backend vs mock mode.
- Keep UI behavior stable while data sources change.
- Avoid direct Supabase calls inside screens where a service boundary is practical.

## 3. Suggested Services / Adapters

Initial TypeScript service interfaces now exist under `expo/services/`. In-memory mock adapters also exist under `expo/mocks/adapters/`. The backend/mock service factory is lightly wired for gated non-blocking swipe persistence; most runtime behavior is still local/mock.

- `ProfileService`: profile CRUD, onboarding completion, visibility.
- `DiscoveryService`: eligible profile queries.
- `SwipeService`: like/pass persistence.
- `MatchService`: reciprocal match creation and match list.
- `ChatService`: messages, active-match-only chat, realtime/polling.
- `SafetyService`: block, report, unmatch, account deletion request.
- `StorageService`: profile photo upload and retrieval.
- `AnalyticsService`: optional privacy-safe event tracking.

## 4. Suggested Future Folders

```text
expo/lib/supabase.ts
expo/services/profile-service.ts
expo/services/discovery-service.ts
expo/services/swipe-service.ts
expo/services/match-service.ts
expo/services/chat-service.ts
expo/services/safety-service.ts
expo/services/storage-service.ts
expo/services/analytics-service.ts
expo/mocks/adapters/
supabase/migrations/
```

Prefer `supabase/migrations/` at the repo root unless later repo conventions make `expo/supabase/migrations/` cleaner.

## 5. Initial Schema Concept

Initial migration draft:

- `supabase/migrations/202606190001_initial_mvp_schema.sql`

Hardening plan:

- `docs/supabase-hardening-plan.md`

Initial tables:

- `profiles`
- `profile_members`
- `profile_photos`
- `swipes`
- `matches`
- `messages`
- `blocks`
- `reports`
- `user_settings`
- `account_deletion_requests`

## 6. RLS / Security Priorities

- Users can read eligible visible profiles only.
- Users can update only their own profile.
- Users can update only user-owned profile columns from the mobile client.
- Users can only create swipes as themselves through the swipe RPC.
- Mutual matches must be created without duplicate rows.
- Users can only read messages for active matches they belong to.
- Users can only send messages into active matches they belong to.
- Blocks must be respected server-side.
- Reports and account deletion requests must derive actor identity server-side.
- Suspended users are hidden from discovery.
- Suspended users cannot swipe or message.
- Invisible users are hidden from discovery.
- Service role never ships to the app.

## 7. Suggested Migration Order

1. Add env-gated Supabase client with mock fallback. Done.
2. Add service interfaces while existing provider still owns behavior. Done.
3. Draft initial Supabase schema, RLS, and core matching/safety RPCs. Done.
4. Move mock profile/discovery access behind adapters.
5. Add real auth/session provider. Done; email/password sign-in and account creation are wired.
6. Add Supabase swipe, match, and safety service adapters. Done; swipe persistence and safety entry points are lightly wired, while match/chat source-of-truth work remains.
7. Add backend/mock service factory. Done.
8. Add gated swipe persistence hook through service factory. Done; local state remains source of truth.
9. Harden initial schema, RLS, grants, and safety RPC boundaries before dev apply. Done.
10. Add database/RLS tests for the hardened migration. Done; tests pass locally.
11. Enable firmware virtualization, start Docker Desktop, run `expo\node_modules\.bin\supabase start`, and run `expo\node_modules\.bin\supabase test db`. Done.
12. Fix the profile schema to support single/couple member records before hosted apply. Done and tested locally.
13. Persist onboarding/profile to backend by mapping `Profile.people[]` to `profile_members`. Done.
14. Add photo upload through `StorageService`, writing `profile_photos.member_id`. Done locally and pushed to hosted `orchard-dev`; smoke-test onboarding with a selected photo.
15. Add CI for lint, typecheck, and database tests after DB command reliability is confirmed.
16. Replace swipe persistence as source of truth.
17. Add reciprocal match creation.
18. Replace local chat with match-scoped backend messages.
19. Add safety service and enforce block/report/unmatch/account deletion flows.

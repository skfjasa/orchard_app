# Backend Migration Plan

## 1. Current State

The current app is a local/mock Rork prototype.

- `ProfileProvider` owns too much local behavior.
- Persistence is local via AsyncStorage.
- Discovery uses mock profiles.
- Swipes create local matches/conversations.
- Chat is local and simulated.
- Paywall, boosts, subscriptions, and Super Likes are simulated.
- No backend exists.
- No Supabase client exists.
- No migrations exist.
- No real auth, storage, reciprocal matching, or chat backend exists.

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

Initial TypeScript service interfaces now exist under `expo/services/`. They are contracts only; no runtime code uses them yet.

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

Initial tables:

- `profiles`
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
- Users can only create swipes as themselves.
- Mutual matches must be created without duplicate rows.
- Users can only read messages for active matches they belong to.
- Users can only send messages into active matches they belong to.
- Blocks must be respected server-side.
- Reports can be created by authenticated users.
- Suspended users are hidden from discovery.
- Invisible users are hidden from discovery.
- Service role never ships to the app.

## 7. Suggested Migration Order

1. Add env-gated Supabase client with mock fallback.
2. Add service interfaces while existing provider still owns behavior.
3. Move mock profile/discovery access behind adapters.
4. Add real auth/session provider.
5. Persist onboarding/profile to backend.
6. Add photo upload through `StorageService`.
7. Replace swipe persistence.
8. Add reciprocal match creation.
9. Replace local chat with match-scoped backend messages.
10. Add safety service and enforce block/report/unmatch/account deletion flows.

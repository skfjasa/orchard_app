# Profile Provider Responsibility Map

> Current-use note: this map is historical/contextual and should be read with `docs/repo-audit-and-foundation-plan.md`. It remains useful for understanding extraction risks, but several backend and Realtime details below are stale. Do not use this file as an instruction to rewrite or delete `ProfileProvider` in one pass.

Source file: `expo/providers/profile-provider.tsx`

Purpose: document the current provider before extracting services/adapters. This is a map of existing behavior, not a request to rewrite the provider.

## Current Role

`ProfileProvider` is the central app-state provider for the prototype. It still owns UI-facing local state and coordinates persistence, but the first service boundaries have been extracted.

Current persistence is local through `AsyncStorage` via `expo/services/local-profile-storage.ts` and React Query mutations. Supabase swipe persistence can run as a gated, non-blocking hook when Supabase mode has a matching authenticated profile id, but backend data is not the UI source of truth.

## Storage Keys

- `duet.profile.v1`: current user profile
- `duet.conversations.v1`: local conversations
- `duet.likes.v1`: liked profile IDs
- `duet.passes.v1`: passed profile IDs
- `duet.superLikes.v1`: super-liked profile IDs
- `duet.extraSlots.v1`: purchased/earned extra match slots
- `duet.boostedUntil.v1`: local boost expiration timestamp
- `duet.superLikeBalance.v1`: remaining Super Likes
- `duet.superLikeLastUse.v1`: last Super Like usage timestamp
- `duet.subscription.v1`: local subscription state

## State Owned

- `profile`
- `conversations`
- `likedIds`
- `passedIds`
- `superLikedIds`
- `extraSlots`
- `boostedUntil`
- `superLikeBalance`
- `superLikeLastUseAt`
- `subscription`
- `hydrated`
- `drafts`
- `typingProfileIds`

The provider still owns React state for these values. Storage and several local mutation helpers now live in service modules.

## Derived State

- `totalSlots`
- `slotsUsed`
- `slotsRemaining`
- `isAtMatchLimit`
- `isBoosted`
- `superLikeRechargeAt`

When `MVP_MONETIZATION_ENABLED` is `false`, match slots are effectively unlimited for demo use.

## Public Actions

Profile lifecycle:

- `completeOnboarding`
- `updateProfile`
- `signOut`

Discovery and matching:

- `likeProfile`
- `superLikeProfile`
- `passProfile`
- `unmatch`

Chat:

- `sendMessage`
- `deleteMessage`
- `sendPhoto`
- `respondToPhoto`
- `markRead`
- `setDraft`

Monetization/prototype counters:

- `purchase`
- `subscribe`
- `cancelSubscription`

Partner-link prototype behavior:

- `invitePartner`
- `resendPartnerInvite`
- `acceptPartnerLink`
- `removePartnerLink`

## Current Local Behaviors

### Hydration

`loadStoredProfileState` in `expo/services/local-profile-storage.ts` reads all local AsyncStorage keys and initializes provider state. Load failure resets state to local defaults.

### Profile Lifecycle

Onboarding stores a `Profile` object locally. Updating a profile patches the local profile object through `applyProfilePatch` and persists it. Signing out clears local profile, conversation, swipe, monetization, and subscription state.

### Likes And Matches

`likeProfile` checks local match slot limits only when monetization is enabled. If allowed, it adds the profile ID to `likedIds` and immediately creates a local conversation with a synthetic greeting from `MOCK_PROFILES` through `ensureGreetingConversation`.

When Supabase mode is active and the local profile id matches the authenticated Supabase user id, `likeProfile` also sends a non-blocking `swipes.recordSwipe` call through the backend/mock service factory.

This is not true reciprocal matching as the app source of truth yet. Local state still drives UI behavior; backend migration must eventually replace this with persisted swipes and mutual-match creation.

### Super Likes

`superLikeProfile` checks slot limits and local Super Like balance only when monetization is enabled. In the feedback MVP, Super Likes are demoable without paywall or balance blocking. It records a super-like ID, adds a like, and immediately creates a local conversation with a synthetic greeting.

When Supabase mode is active and the local profile id matches the authenticated Supabase user id, Super Likes are persisted as backend `like` decisions while preserving local Super Like UI semantics.

### Passes

`passProfile` records a local passed profile ID. When Supabase mode is active and the local profile id matches the authenticated Supabase user id, passes are also sent as non-blocking backend swipe persistence.

### Unmatch

`unmatch` removes the profile ID from local likes and removes the local conversation for that profile.

### Chat

`sendMessage` appends a local outgoing message through `appendOutgoingTextMessage`. It then schedules a fake auto-reply using `setTimeout` and `appendIncomingTextReply`.

`sendPhoto` creates a local pending photo message through `appendOutgoingPhotoRequest`, then simulates approval after a timeout.

No chat authorization, backend persistence, realtime, or moderation exists.

### Monetization

`purchase`, `subscribe`, and `cancelSubscription` mutate local counters only through helper calculations in `expo/services/local-monetization-service.ts`. No App Store, Google Play, RevenueCat, or payment backend exists.

Monetization is disabled for the feedback MVP through `expo/constants/features.ts`. Monetizable prototype features should remain demoable where useful and are tracked in `docs/monetization-candidates.md`.

### Partner Links

Partner invite/link behavior is local profile metadata through helpers in `expo/services/local-profile-mutation-service.ts`. Invite links/codes are generated locally and are not backed by email, auth, or a real account-linking backend.

## Extraction Risks

- The provider still combines multiple domains in one context.
- Screens depend directly on provider actions and local state names.
- Local match creation is still coupled to mock profiles and conversations.
- Chat simulation still depends on `MOCK_PROFILES`.
- Local React state updates and persistence calls are still coupled in provider callbacks.
- Most provider actions are not yet backed by the service interfaces under `expo/services/`; swipe persistence is the first lightly wired service-factory hook.

## Recommended Extraction Order

1. Add read-only service interfaces and keep existing behavior. Done.
2. Extract storage/hydration helpers without changing keys or behavior. Done.
3. Extract local interaction helpers while preserving mock behavior. Done.
4. Extract local monetization/demo calculations and disable MVP paywalls. Done.
5. Extract local profile mutation helpers. Done.
6. Reassess remaining provider responsibilities. Current step.
7. Add Supabase client skeleton behind environment-gated mock mode. Done.
8. Add auth/session provider foundation. Done; onboarding/sign-in flow is wired for Supabase email/password auth.
9. Add backend/mock service factory and gated swipe persistence hook. Done.
10. Replace swipe/match/chat behavior with service-backed mock/Supabase adapters incrementally.
11. Extract safety actions once block/report/unmatch UI flows are ready to wire.

## Future Service Boundaries

Initial interface skeletons exist under `expo/services/`, with in-memory mock adapters under `expo/mocks/adapters/`. The backend/mock service factory now supports Supabase-backed profile storage, discovery, swipes, matches, chat text, Realtime refresh, storage, and safety paths in varying degrees. Local/mock behavior remains intentionally available and several source-of-truth cleanup steps are still tracked in `docs/milestone-tracker.md`.

Runtime local helper modules now exist:

- `expo/services/local-profile-storage.ts`
- `expo/services/local-interaction-service.ts`
- `expo/services/local-monetization-service.ts`
- `expo/services/local-profile-mutation-service.ts`

- `ProfileService`: profile lifecycle and settings.
- `AuthProvider`: auth/session state and future Supabase auth operations.
- `DiscoveryService`: eligible profile listing.
- `SwipeService`: like/pass/super-like actions.
- `MatchService`: match creation and match list.
- `ChatService`: messages, photo messages, read state.
- `SafetyService`: block, report, unmatch, account deletion.
- `StorageService`: profile/chat media upload.
- `AnalyticsService`: privacy-safe event tracking.

## Non-Goals For First Extraction

- Do not replace AsyncStorage immediately.
- Do not add Supabase directly inside screens.
- Do not remove mock profiles before backend discovery exists.
- Do not rewrite the provider in one pass.
- Do not change user-visible behavior unless the task explicitly calls for it.

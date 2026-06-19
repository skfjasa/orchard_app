# Profile Provider Responsibility Map

Source file: `expo/providers/profile-provider.tsx`

Purpose: document the current provider before extracting services/adapters. This is a map of existing behavior, not a request to rewrite the provider.

## Current Role

`ProfileProvider` is the central app-state provider for the Rork prototype. It owns local persistence, profile lifecycle, swipe state, local match creation, simulated chat, monetization counters, subscriptions, and partner-link invitations.

Current persistence is local through AsyncStorage and React Query mutations. No backend is involved.

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

## Derived State

- `totalSlots`
- `slotsUsed`
- `slotsRemaining`
- `isAtMatchLimit`
- `isBoosted`
- `superLikeRechargeAt`

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

`loadAll` reads all local AsyncStorage keys and initializes provider state. Load failure resets state to local defaults.

### Profile Lifecycle

Onboarding stores a `Profile` object locally. Updating a profile patches the local profile object and persists it. Signing out clears local profile, conversation, swipe, monetization, and subscription state.

### Likes And Matches

`likeProfile` checks local match slot limits. If allowed, it adds the profile ID to `likedIds` and immediately creates a local conversation with a synthetic greeting from `MOCK_PROFILES`.

This is not true reciprocal matching. Backend migration must replace this with persisted swipes and mutual-match creation.

### Super Likes

`superLikeProfile` checks slot limits and local Super Like balance. If allowed, it decrements the balance, records a super-like ID, adds a like, and immediately creates a local conversation with a synthetic greeting.

### Passes

`passProfile` records a local passed profile ID.

### Unmatch

`unmatch` removes the profile ID from local likes and removes the local conversation for that profile.

### Chat

`sendMessage` appends a local outgoing message. It then schedules a fake auto-reply using `setTimeout`.

`sendPhoto` creates a local pending photo message, then simulates approval after a timeout.

No chat authorization, backend persistence, realtime, or moderation exists.

### Monetization

`purchase`, `subscribe`, and `cancelSubscription` mutate local counters only. No App Store, Google Play, RevenueCat, or payment backend exists.

### Partner Links

Partner invite/link behavior is local profile metadata. Invite links/codes are generated locally and are not backed by email, auth, or a real account-linking backend.

## Extraction Risks

- The provider combines multiple domains in one context.
- Screens depend directly on provider actions and local state names.
- Local match creation is coupled to mock profiles and conversations.
- Chat simulation is coupled to `MOCK_PROFILES`.
- Monetization counters are mixed with core matching limits.
- AsyncStorage mutations are scattered across many local callbacks.

## Recommended Extraction Order

1. Add read-only service interfaces and keep existing behavior.
2. Extract storage/hydration helpers without changing keys or behavior.
3. Extract mock profile lookup and discovery helpers.
4. Extract swipe/match actions behind a `SwipeService` / `MatchService` interface.
5. Extract chat actions behind a `ChatService` interface while preserving local fake replies in mock mode.
6. Extract safety actions once block/report/unmatch backend concepts exist.
7. Extract monetization/demo counters or hide them for beta.
8. Add Supabase-backed implementations behind the same interfaces.

## Future Service Boundaries

Initial interface skeletons exist under `expo/services/`; they are not wired into runtime behavior yet.

- `ProfileService`: profile lifecycle and settings.
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

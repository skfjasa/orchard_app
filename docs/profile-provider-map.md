# Profile Provider Responsibility Map

> Current-use note: this map is the Slice 2 contract snapshot for staged provider extraction. Keep it aligned with `expo/providers/profile-provider-contract.ts` and `docs/repo-audit-and-foundation-plan.md`. It is not an instruction to rewrite or delete `ProfileProvider` in one pass.

Source file: `expo/providers/profile-provider.tsx`
Contract file: `expo/providers/profile-provider-contract.ts`

Purpose: document the current provider before extracting services/adapters. This is a map of existing behavior, not a request to rewrite the provider.

## Frozen Facade Contract

`useProfile()` is now treated as a compatibility facade. Screens may continue to consume this contract while internals are extracted, but new work should prefer focused domain hooks once they exist.

Categories:

- Auth/profile bootstrap: current profile and readiness gates needed before protected app tabs render.
- Server state: Supabase-backed or backend-derived state that should eventually move to query hooks.
- Client preference state: per-user local preferences that can move to small persisted stores.
- Local mock/demo state: prototype state that keeps mock/Fruit/demo behavior available.
- Prototype monetization state: non-production monetization counters and demo actions.
- UI selector/facade: read selectors that shield screens from raw provider internals.

| Contract member | Category | Notes / future owner |
| --- | --- | --- |
| `profile` | Auth/profile bootstrap | Current user profile facade. Long-term owner: auth/profile bootstrap hook plus profile service/query. |
| `hydrated` | Auth/profile bootstrap | Local storage hydration gate. Keep until storage is split. |
| `backendProfileHydrated` | Auth/profile bootstrap | Supabase profile bootstrap gate. |
| `backendMatchesHydrated` | Auth/profile bootstrap / server state | Initial backend match/thread/profile-display gate. |
| `isLoading` | Auth/profile bootstrap | Storage query loading facade. |
| `knownProfiles` | Server state / UI selector | Display-profile cache for backend and mock profiles. Future query/display-profile cache owner. |
| `conversations` | Local mock/demo state / server state | Mixed local and hydrated backend thread state; should split by mock/backend ownership. |
| `likedIds` | Local mock/demo state | Compatibility array; not a long-term Supabase active-match source of truth. |
| `passedIds` | Local mock/demo state | Candidate for local interaction store. |
| `superLikedIds` | Local mock/demo state / prototype monetization state | Candidate for local interaction store. |
| `newMatchIds` | Client preference state | Candidate for seen-match/preference store or backend-backed decision. |
| `matchedProfiles` | UI selector/facade | Selector consumed by Matches; first consumer group to migrate. |
| `inboxItems` | UI selector/facade | Selector consumed by Inbox; first consumer group to migrate. |
| `newMatchCount` | UI selector/facade | Tab badge selector. |
| `unreadMessageCount` | UI selector/facade | Tab badge selector. |
| `getProfileById` | UI selector/facade | Used by Chat/Match Detail; migrate behind profile lookup hook. |
| `getConversation` | UI selector/facade | Used by Chat; migrate behind chat-thread hook. |
| `hasActiveMatch` | UI selector/facade / server state | Compatibility guard; future owner should use active match source of truth. |
| `refreshBackendMatches` | Server state | Future owner: query invalidation/refetch hooks. |
| `rememberProfiles` | Server state / UI selector | Display-cache helper; should shrink as backend profile query ownership improves. |
| `completeOnboarding` | Auth/profile bootstrap | Profile creation facade over local/mock and Supabase profile service. |
| `updateProfile` | Auth/profile bootstrap | Profile mutation facade. |
| `signOut` | Auth/profile bootstrap | Clears local provider state and Supabase session via auth provider. |
| `likeProfile` | Local mock/demo state / server state | Compatibility action; backend reciprocal match must remain service-owned. |
| `superLikeProfile` | Local mock/demo state / prototype monetization state / server state | Compatibility action with demo semantics. |
| `passProfile` | Local mock/demo state / server state | Candidate for local interaction store plus swipe service. |
| `unmatch` | Server state / local mock/demo state | Should become backend-first for Supabase mode while preserving mock behavior. |
| `reportProfile` | Server state | Safety service facade. |
| `blockProfile` | Server state | Safety service facade plus local state cleanup. |
| `requestAccountDeletion` | Server state | Safety service facade plus sign-out. |
| `sendMessage` | Server state / local mock/demo state | Mixed backend text send and local fixture replies; future chat hook/service owner. |
| `deleteMessage` | Local mock/demo state | Local-only behavior today. |
| `sendPhoto` | Local mock/demo state | Local simulated photo request behavior today. |
| `respondToPhoto` | Local mock/demo state | Local simulated photo approval behavior today. |
| `markRead` | Client preference state / server state | Candidate for preference store wrapper while preserving Supabase `match_read_states`. |
| `drafts` / `setDraft` | Client preference state | Candidate for local UI draft store. |
| `typingProfileIds` | Local mock/demo state | Simulated typing state. |
| `totalSlots`, `slotsUsed`, `slotsRemaining`, `isAtMatchLimit` | Prototype monetization state | Demo/paywall calculations; disabled for feedback MVP. |
| `extraSlots`, `boostedUntil`, `isBoosted` | Prototype monetization state | Local demo counters. |
| `superLikeBalance`, `superLikeLastUseAt`, `superLikeRechargeAt` | Prototype monetization state | Local demo counters. |
| `subscription` | Prototype monetization state | Local demo subscription state. |
| `purchase`, `subscribe`, `cancelSubscription` | Prototype monetization state | Local demo actions; no paid service integration. |
| `invitePartner`, `resendPartnerInvite`, `acceptPartnerLink`, `removePartnerLink` | Local mock/demo state | Local partner-link prototype behavior. |

First consumers to migrate after this contract freeze:

1. Matches and Inbox read selectors: `matchedProfiles`, `inboxItems`, `newMatchCount`, `unreadMessageCount`.
2. Match Detail profile lookup and seen state: `getProfileById`, `markMatchSeen`, `hasActiveMatch`.
3. Chat thread/read state: `getConversation`, `sendMessage`, `markRead`, `drafts`, `setDraft`.

## Extracted Preference Store

Slice 3 moved local read/seen preference ownership behind `expo/store/use-preferences-store.ts` while preserving the provider facade.

State now owned by the preference store:

- `readWatermarks`
- `seenMatchIds`

Preserved behavior:

- Existing AsyncStorage keys are reused: `duet.readWatermarks.v1` and `duet.seenMatches.v1`.
- `ProfileProvider.markRead` remains the compatibility wrapper for screens and still writes Supabase `match_read_states` when available.
- `ProfileProvider.markMatchSeen` remains the compatibility wrapper for screens.
- Provider selectors still expose `newMatchIds`, `matchedProfiles`, `inboxItems`, and badge counts.

Not moved in Slice 3:

- Supabase `match_read_states` behavior.
- Product decision about whether seen-match/highlight state becomes backend-backed.
- Chat drafts or typing state.

## Extracted Interaction Store

Slice 4 moved local/demo swipe interaction arrays behind `expo/store/use-interaction-store.ts` while preserving the provider facade.

State now owned by the interaction store:

- `likedIds`
- `passedIds`
- `superLikedIds`

Preserved behavior:

- Existing AsyncStorage keys are reused: `duet.likes.v1`, `duet.passes.v1`, and `duet.superLikes.v1`.
- `ProfileProvider` still exposes the arrays and wrapper actions consumed by Discover, Fruit, Match Detail, Chat, Matches, and Inbox.
- Mock/Fruit fixture likes and super-likes can still activate local matches.
- Supabase-mode real/backend likes and super-likes still require the existing swipe service to return `matched: true` before local active match UI is activated.
- Backend match hydration can still merge active backend match IDs into the compatibility `likedIds` facade.

Not moved in Slice 4:

- Backend match hydration and Realtime/polling refresh behavior.
- Swipe/match service ownership of reciprocal-match decisions.
- Conversation state or chat send/read behavior.
- Product decision about long-term backend ownership for any local-only fixture markers.

## Query-Backed Server-State Hooks

Slice 5 introduced query-backed API hooks under `expo/hooks/api/`:

- `query-keys.ts`
- `use-matches.ts`
- `use-chat-thread.ts`
- `use-discovery.ts`

Preserved behavior:

- Hooks wrap existing `appServices` methods instead of calling Supabase directly from screens.
- Query keys include backend mode and relevant profile/match/filter inputs.
- `Discover` and `Fruit` use `useDiscoveryProfilesQuery` for discovery reads while preserving local deck/grid state and existing UI behavior.
- `ProfileProvider.refreshBackendMatches` uses `useMatchesQuery().refetch()` for match listing while keeping the current match/thread merge algorithm, Realtime refresh, and polling fallback intact.

Not moved in Slice 5:

- Per-match chat thread hydration inside the provider loop.
- Realtime invalidation through query keys.
- Matches/Inbox/Chat route consumers.
- Full provider retirement or route migration.

## Screen Migration Progress

Slice 6 has started with route read-model migration for Matches, Inbox, Match Detail, Chat, Discover, and Fruit.

Implemented:

- `expo/hooks/use-matches-read-model.ts` wraps the Matches tab's read-model needs: visible matches, new-match detection, focus refresh, and `markMatchSeen`.
- `expo/app/(tabs)/matches.tsx` consumes `useMatchesReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-inbox-read-model.ts` wraps the Inbox tab's read-model needs: visible inbox rows, typing state, couple mirror display, focus refresh, and `markRead`.
- `expo/app/(tabs)/inbox.tsx` consumes `useInboxReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-match-detail-read-model.ts` wraps Match Detail profile lookup, active-match state, super-like state, seen-state calls, and existing action wrappers.
- `expo/app/match/[id].tsx` consumes `useMatchDetailReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-chat-thread-read-model.ts` wraps Chat profile/thread lookup, active-match guard state, typing/draft state, read marking, local send/delete/photo actions, and safety actions.
- `expo/app/chat/[id].tsx` consumes `useChatThreadReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-discover-read-model.ts` wraps the Discover deck's discovery query, remembered display profiles, exclusion inputs, monetization counters, and swipe actions.
- `expo/app/(tabs)/discover.tsx` consumes `useDiscoverReadModel` instead of importing `useProfile()` or `useDiscoveryProfilesQuery` directly.
- `expo/hooks/use-fruit-read-model.ts` wraps Fruit's backend non-fixture discovery, local fixture pool, scoring, remembered display profiles, and like/boost actions.
- `expo/app/(tabs)/fruit.tsx` consumes `useFruitReadModel` instead of importing `useProfile()` or `useDiscoveryProfilesQuery` directly.

Preserved behavior:

- Existing Matches layout, empty state, card rendering, new-match highlight, focus refresh, transient-empty guard, and `markMatchSeen` before navigation.
- Existing Inbox layout, empty state, row rendering, typing preview, unread badges, focus refresh, transient-empty guard, profile-link navigation, and `markRead` before Chat navigation.
- Existing Match Detail layout, canonical back behavior, seen-state effect, profile sections, like/pass/super-like actions, block/report controls, and chat entry behavior.
- Existing Chat layout, canonical back behavior, active-match guard, read-marking effect, draft restore/update behavior, text/photo send behavior, message long-press actions, photo approval controls, and safety menu behavior.
- Existing Discover deck layout, swipe animations, haptics, match confirmation, paywall routing, super-like burst, profile-detail navigation, and discovered-profile remembering.
- Existing Fruit grid layout, backend non-fixture priority, local fixture availability, fixture exclusion rules, like-sent/match overlays, boost action, and profile-detail navigation.

Not moved yet:

- Profile/safety/paywall/onboarding calls.
- Provider ownership of Matches selectors.

## Current Role

`ProfileProvider` is the central app-state provider for the prototype. It still owns UI-facing local state and coordinates persistence, but the first service boundaries have been extracted.

Current persistence is local through `AsyncStorage` via `expo/services/local-profile-storage.ts`, focused Zustand stores, and remaining React Query mutations. Supabase swipe persistence can run as a gated, non-blocking hook when Supabase mode has a matching authenticated profile id, but backend data is not yet fully query-owned.

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
- `extraSlots`
- `boostedUntil`
- `superLikeBalance`
- `superLikeLastUseAt`
- `subscription`
- `hydrated`
- `drafts`
- `typingProfileIds`

The provider still owns React state for these values. Storage and several local mutation helpers now live in service modules and focused stores. `likedIds`, `passedIds`, and `superLikedIds` are owned by `use-interaction-store.ts`; `readWatermarks` and `seenMatchIds` are owned by `use-preferences-store.ts`.

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

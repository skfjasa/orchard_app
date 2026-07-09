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
- Prototype monetization facade: non-production monetization counters and demo actions now backed by a focused store.
- UI selector/facade: read selectors that shield screens from raw provider internals.

| Contract member | Category | Notes / future owner |
| --- | --- | --- |
| `profile` | Auth/profile bootstrap | Current user profile facade. Long-term owner: auth/profile bootstrap hook plus profile service/query. |
| `hydrated` | Auth/profile bootstrap | Local storage hydration gate. Keep until storage is split. |
| `backendProfileHydrated` | Auth/profile bootstrap | Supabase profile bootstrap gate. |
| `backendMatchesHydrated` | Auth/profile bootstrap / server state | Initial backend match/thread/profile-display gate. |
| `isLoading` | Auth/profile bootstrap | Storage query loading facade. |
| `knownProfiles` | Server state / UI selector | Display-profile cache for backend and mock profiles. Future query/display-profile cache owner. |
| `conversations` | Local mock/demo state / server state | Owned by the persisted conversations hook; backend/thread orchestration still runs through the provider. |
| `likedIds` | Local mock/demo state | Compatibility array; not a long-term Supabase active-match source of truth. |
| `passedIds` | Local mock/demo state | Candidate for local interaction store. |
| `superLikedIds` | Local mock/demo state / prototype monetization facade | Owned by the local interaction store; still participates in demo Super Like behavior. |
| `newMatchIds` | Client preference state | Candidate for seen-match/preference store or backend-backed decision. |
| `matchedProfiles` | UI selector/facade | Selector consumed by Matches; first consumer group to migrate. |
| `inboxItems` | UI selector/facade | Selector consumed by Inbox; first consumer group to migrate. |
| `newMatchCount` | UI selector/facade | Tab badge selector. |
| `unreadMessageCount` | UI selector/facade | Tab badge selector. |
| `getProfileById` | UI selector/facade | Used by Chat/Match Detail; migrate behind profile lookup hook. |
| `getConversation` | UI selector/facade | Used by Chat; migrate behind chat-thread hook. |
| `hasActiveMatch` | UI selector/facade / server state | Compatibility guard; future owner should use active match source of truth. |
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
| `markRead` | Client preference state / server state | Compatibility wrapper; local watermark calculation is service-owned while Supabase `match_read_states` writes remain coordinated through the backend chat boundary. |
| `drafts` / `setDraft` | Client preference state | Owned by the chat UI store. |
| `typingProfileIds` | Local mock/demo state | Owned by the chat UI store; currently empty unless future simulated typing behavior sets it. |
| `totalSlots`, `slotsUsed`, `slotsRemaining`, `isAtMatchLimit` | Prototype monetization facade | Demo/paywall calculations; disabled for feedback MVP. |
| `extraSlots`, `boostedUntil`, `isBoosted` | Prototype monetization facade | Store-backed local demo counters. |
| `superLikeBalance`, `superLikeLastUseAt`, `superLikeRechargeAt` | Prototype monetization facade | Store-backed local demo counters. |
| `subscription` | Prototype monetization facade | Store-backed local demo subscription state. |
| `purchase`, `subscribe`, `cancelSubscription` | Prototype monetization facade | Local demo actions; no paid service integration. |
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
- `ProfileProvider.markRead` remains the compatibility wrapper for screens and still writes Supabase `match_read_states` when available; local watermark calculation is service-owned.
- `ProfileProvider.markMatchSeen` remains the compatibility wrapper for screens; persisted seen-match calculation is service-owned.
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
- Matches and Inbox focus refresh now invalidates the React Query matches key through `useRefreshMatchesOnFocus`; `ProfileProvider` no longer exposes a manual match-refresh facade method.

Not moved in Slice 5:

- Per-match chat thread hydration inside the provider loop.
- Realtime invalidation through query keys.
- Matches/Inbox/Chat route consumers.
- Full provider retirement or route migration.

## Screen Migration Progress

Slice 6 route read-model migration now covers all current app route/component `useProfile()` consumers.

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
- `expo/hooks/use-edit-profile-read-model.ts` wraps Edit Profile's current profile and update action.
- `expo/app/edit-profile.tsx` consumes `useEditProfileReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-paywall-read-model.ts` wraps Paywall demo purchase/subscription counters and actions.
- `expo/app/paywall.tsx` consumes `usePaywallReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-report-read-model.ts` wraps Report submission.
- `expo/app/report.tsx` consumes `useReportReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-safety-legal-read-model.ts` wraps account deletion request submission.
- `expo/app/safety-legal.tsx` consumes `useSafetyLegalReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-tab-badge-read-model.ts` wraps tab badge counts.
- `expo/app/(tabs)/_layout.tsx` consumes `useTabBadgeReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-profile-tab-read-model.ts` wraps Profile tab profile, sign-out, monetization, and partner-link actions.
- `expo/app/(tabs)/profile.tsx` consumes `useProfileTabReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-onboarding-completion-read-model.ts` wraps final onboarding profile completion.
- `expo/app/onboarding/photos.tsx` consumes `useOnboardingCompletionReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-sign-in-profile-read-model.ts` wraps sign-in profile/bootstrap readiness.
- `expo/app/onboarding/sign-in.tsx` consumes `useSignInProfileReadModel` instead of importing `useProfile()` directly.
- `expo/hooks/use-app-bootstrap-read-model.ts` wraps root/protected-route auth/profile bootstrap readiness.
- `expo/app/index.tsx` and `expo/components/navigation/ProtectedRoute.tsx` consume `useAppBootstrapReadModel` instead of importing `useProfile()` directly.

Preserved behavior:

- Existing Matches layout, empty state, card rendering, new-match highlight, focus refresh, transient-empty guard, and `markMatchSeen` before navigation.
- Existing Inbox layout, empty state, row rendering, typing preview, unread badges, focus refresh, transient-empty guard, profile-link navigation, and `markRead` before Chat navigation.
- Existing Match Detail layout, canonical back behavior, seen-state effect, profile sections, like/pass/super-like actions, block/report controls, and chat entry behavior.
- Existing Chat layout, canonical back behavior, active-match guard, read-marking effect, draft restore/update behavior, text/photo send behavior, message long-press actions, photo approval controls, and safety menu behavior.
- Existing Discover deck layout, swipe animations, haptics, match confirmation, paywall routing, super-like burst, profile-detail navigation, and discovered-profile remembering.
- Existing Fruit grid layout, backend non-fixture priority, local fixture availability, fixture exclusion rules, like-sent/match overlays, boost action, and profile-detail navigation.
- Existing Edit Profile save behavior, Paywall demo purchase/subscription behavior, Report submission behavior, and Safety & Legal account-deletion request behavior.
- Existing tab badge behavior, Profile tab sign-out/partner-link/monetization behavior, onboarding completion behavior, sign-in readiness behavior, root redirect behavior, and ProtectedRoute bootstrap gates.

Not moved yet:

- Provider ownership of conversation arrays, message mutation helpers, backend chat hydration, and simulated replies/photo approvals.
- Provider ownership of profile state application and backend match/thread hydration coordination.

## Provider Selector Extraction

Post-Slice 6 provider-internal cleanup has started.

Implemented:

- `expo/services/profile-provider-selectors.ts` owns pure compatibility selector calculations for profile conversations, active-match checks, matched profiles, inbox rows, and unread message counts.
- `expo/services/local-interaction-service.ts` owns pure local/backend conversation merge helpers for backend message hydration, read-through timestamp lookup, local read-watermark application, and seen-match preference application.
- `expo/providers/profile-provider.tsx` still owns side-effectful profile lookup/cache repair, transient-empty guards, and the compatibility facade, but no longer embeds the pure matched-profile/inbox/badge calculation bodies inline.

Preserved behavior:

- Existing `getProfileById`, `getConversation`, `hasActiveMatch`, `matchedProfiles`, `inboxItems`, `newMatchCount`, and `unreadMessageCount` facade members.
- Existing incomplete-backend-profile filtering and last-resolved profile caching.
- Existing `useTransientEmptyList` protection for Matches and Inbox.

## Extracted Monetization Store

Post-Slice 6 provider-internal cleanup moved prototype monetization state behind `expo/store/use-monetization-store.ts`.

State now owned by the monetization store:

- `extraSlots`
- `boostedUntil`
- `superLikeBalance`
- `superLikeLastUseAt`
- `subscription`

Preserved behavior:

- Existing AsyncStorage keys are reused: `duet.extraSlots.v1`, `duet.boostedUntil.v1`, `duet.superLikeBalance.v1`, `duet.superLikeLastUse.v1`, and `duet.subscription.v1`.
- `ProfileProvider.purchase`, `subscribe`, and `cancelSubscription` remain compatibility wrappers.
- Purchase/subscription result application now lives in `expo/services/local-monetization-service.ts`; the provider facade only logs the action, computes the local result, and delegates store updates.
- Demo paywall, boost, match-slot, super-like refill, subscription, and auto-recharge behavior is unchanged.

## Extracted Chat UI Store

Post-Slice 6 provider-internal cleanup moved local chat UI state behind `expo/store/use-chat-ui-store.ts`.

State now owned by the chat UI store:

- `drafts`
- `typingProfileIds`

Preserved behavior:

- `ProfileProvider.setDraft` remains the compatibility wrapper exposed to focused chat read-model hooks.
- Chat draft text remains in memory only, matching the prior provider `useState` behavior.
- `typingProfileIds` remains available through the provider facade for Inbox and Chat read models, but no runtime code currently sets simulated typing IDs.

Not moved:

- Backend chat thread hydration and message merge behavior.
- Local simulated replies, photo requests, and photo approvals.

Provider-internal cleanup after this slice keeps backend chat orchestration in `ProfileProvider`, but pure backend conversation merge/read-through and local read/seen preference helper functions now live in `expo/services/local-interaction-service.ts`.

## Extracted Persisted Conversations Hook

Post-Slice 6 provider-internal cleanup moved local conversation state and AsyncStorage write orchestration behind `expo/hooks/use-persisted-conversations.ts`.

State now owned by the hook:

- `conversations`

Preserved behavior:

- Existing AsyncStorage key is reused: `duet.conversations.v1`.
- Initial storage hydration can replace in-memory conversations without writing back immediately.
- Provider mutations still persist local conversation updates through a single `updateConversations` wrapper.
- `ProfileProvider` still exposes `conversations` through the compatibility facade.

Not moved:

- Backend match/thread hydration decisions.
- Backend chat send/read calls.
- Local simulated reply/photo conversation mutations.

## Extracted Local Chat Simulation Helpers

Post-Slice 6 provider-internal cleanup moved local chat simulation timing behind `expo/services/local-chat-simulation-service.ts`.

Helper behavior now owned by the service:

- Simulated text reply delay.
- Simulated photo approval delay.
- Simulated text reply selection through the existing local interaction helper.

Preserved behavior:

- `ProfileProvider` still appends the simulated reply or photo approval to conversations through the persisted conversations hook.
- Existing random delay windows are unchanged.
- Mock/Fruit fixture chat behavior remains local/demo-only.

## Extracted Local Chat Actions

Post-Slice 6 provider-internal cleanup moved local chat text/photo action orchestration behind `expo/services/local-chat-action-service.ts`.

Preserved behavior:

- `ProfileProvider` still blocks sends when there is no active local match.
- Real backend-only Supabase text sends still go backend-first without a local echo from the local chat action service.
- Local/mock fixture text sends still append an outgoing message, optionally persist to hosted chat, and schedule simulated replies.
- Local photo requests, simulated photo approval, delete-message, and respond-to-photo behavior are unchanged.

Not moved:

- Backend chat hydration application.
- Product decision about simulated replies/photo requests in Supabase mode.

## Extracted Local Match Actions

Post-Slice 6 provider-internal cleanup moved fixture/demo local match activation, pass-state mutation, and stale-match cleanup behind `expo/services/local-match-action-service.ts`.

Preserved behavior:

- Local fixture/demo likes and super-likes still add the profile to local liked/new-match state.
- Local fixture/demo likes and super-likes still ensure the synthetic greeting conversation exists.
- Local passes still add the profile to local passed state before any backend pass persistence is attempted.
- Local unmatch and backend chat `match_not_found` cleanup still remove local liked/conversation state.
- `ProfileProvider` still decides when Supabase swipe results are allowed to activate visible local match state.

## Extracted Local Safety Actions

Post-Slice 6 provider-internal cleanup moved local block cleanup behind `expo/services/local-safety-action-service.ts`.

Preserved behavior:

- `ProfileProvider.blockProfile` still waits for the backend/mock safety service result.
- Successful blocks still remove the blocked profile from local liked IDs, add it to local passed IDs, and remove the local conversation.

## Extracted Safety Service Actions

Post-Slice 6 provider-internal cleanup moved report, block, and account-deletion safety service calls behind `expo/services/safety-action-service.ts`.

Preserved behavior:

- Report, block, and account-deletion request failures still return the safety service error message to the UI.
- `ProfileProvider` still owns the profile-required guard before each action.
- Successful blocks still delegate local visible cleanup to `expo/services/local-safety-action-service.ts`.
- Successful account-deletion requests still call the provider sign-out path.

## Extracted Profile Provider Reset Helpers

Post-Slice 6 provider-internal cleanup moved sign-out and backend-bootstrap reset bookkeeping behind `expo/services/profile-provider-reset-service.ts`.

Preserved behavior:

- Supabase auth sign-out still completes before local provider state is reset.
- Sign-out still clears the local profile, conversations, new-match ids, interaction state, monetization state, backend hydration flags, in-flight hydration keys, and pending backend match refresh state.
- `ProfileProvider` still owns the saved-profile mutation that removes the local profile from storage.
- Mock-mode, missing-user, and account-switch backend bootstrap resets still clear the same refs/cache/state as before.
- `ProfileProvider` still decides which backend bootstrap reset path applies from auth mode, user id, and session key.

## Extracted Match Record Helpers

Post-Slice 6 provider-internal cleanup moved repeated backend match-pair lookup logic behind `expo/services/match-record-utils.ts`.

Helper behavior now owned by the service:

- Finding an active match record between two profile ids from a match list.

Preserved behavior:

- `ProfileProvider` still owns backend chat send/read side effects.
- Existing match lookup semantics are unchanged for chat send repair, backend unmatch, and backend mark-read.

## Extracted Backend Match Actions

Post-Slice 6 provider-internal cleanup moved backend unmatch lookup/RPC orchestration behind `expo/services/backend-match-action-service.ts`.

Preserved behavior:

- `ProfileProvider.unmatch` still removes the local liked id and local conversation immediately.
- Supabase mode still attempts to resolve the active hosted match and call the existing backend unmatch RPC after local cleanup.
- Mock/local unmatch behavior is unchanged.

## Extracted Backend Match Hydration Planning

Post-Slice 6 provider-internal cleanup moved backend match/thread hydration planning behind `expo/services/backend-match-hydration-service.ts`.

Preserved behavior:

- Backend match hydration still loads active match IDs, repairs missing real/dev display profiles through discovery, loads each backend thread, and skips applying partial real/dev match hydration.
- `ProfileProvider` still applies the returned plan into local compatibility state: active backend match IDs, local liked/new-match state, remembered profiles, and merged conversations.
- Mock/Fruit fixture behavior during backend hydration is unchanged.

## Extracted Backend Profile Display Helpers

Post-Slice 6 provider-internal cleanup moved backend display-profile completeness and selection helpers behind `expo/services/backend-profile-display-service.ts`.

Preserved behavior:

- Incomplete backend profiles with placeholder names are still filtered out of provider lookup/cache hydration and backend match hydration.
- Hosted fixture/mock profile ids are still treated as complete fixture profiles.
- Backend match hydration still prefers complete backend profile data and falls back to remembered complete display profiles.
- Remembered display-profile cache merge logic still updates known profiles, display cache, and last-resolved cache while preserving provider-owned refs/state/persistence.
- Profile lookup resolution still checks known profiles, known-profile cache, display cache, last-resolved cache, and mock profiles in the same order while preserving provider-owned facade callback state.

## Extracted Backend Match Hydration Application

Post-Slice 6 provider-internal cleanup moved backend match/thread hydration application calculations behind `expo/services/backend-match-hydration-application-service.ts`.

Preserved behavior:

- `ProfileProvider` still owns hydration run timing, logging, in-flight guards, and hydration readiness flags.
- Backend hydration still applies active backend match IDs, local liked IDs, new-match IDs, and conversations with local read watermarks.
- Fixture backend conversations still preserve synthetic greeting behavior.

## Extracted Backend Profile Bootstrap

Post-Slice 6 provider-internal cleanup moved backend profile bootstrap loading and pending onboarding recovery behind `expo/services/backend-profile-bootstrap-service.ts`.

Preserved behavior:

- Supabase mode still loads the current backend profile before protected app tabs are allowed through the bootstrap gate.
- Pending onboarding profiles are still recovered by matching the authenticated user id or owner email, saved through the profile service, and cleared from pending storage only after a successful backend save.
- Cancellation checks still prevent pending storage cleanup and provider state application after the bootstrap effect is torn down.
- `ProfileProvider` still owns the React `profile` state setter, local profile persistence mutation, and `backendProfileHydrated` readiness flag.

## Extracted Backend Profile Actions

Post-Slice 6 provider-internal cleanup moved backend complete-onboarding and profile-update calls behind `expo/services/backend-profile-action-service.ts`.

Preserved behavior:

- `completeOnboarding` still stores the backend-returned profile in Supabase mode and the input profile in mock mode.
- `updateProfile` still applies an optimistic local patch and persists the local profile immediately.
- Backend profile update failures still log through the existing `[profile-provider] backend profile update failed` message.
- `ProfileProvider` still owns React state application, local persistence mutation, and readiness flags.

## Extracted Backend Swipe Actions

Post-Slice 6 provider-internal cleanup moved backend swipe persistence calls behind `expo/services/backend-swipe-action-service.ts`.

Preserved behavior:

- Supabase swipe persistence still runs only when the service factory is in Supabase mode, swipe capability is Supabase-backed, and the authenticated user id matches the current profile id.
- Backend swipe failures still log through the existing `[profile-provider] backend swipe failed` message.
- The service now decides whether a like/super-like should activate visible local match state immediately or wait for a backend reciprocal match result.
- `ProfileProvider` still owns local fixture activation, match-limit checks, and super-like counters.

## Current Role

`ProfileProvider` is the central app-state provider for the prototype. It still owns UI-facing local state and coordinates persistence, but the first service and store boundaries have been extracted.

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
- `hydrated`

The provider still owns React state for these values. Storage and several local mutation helpers now live in service modules and focused stores/hooks. `conversations` is owned by `use-persisted-conversations.ts`; `likedIds`, `passedIds`, and `superLikedIds` are owned by `use-interaction-store.ts`; `readWatermarks` and `seenMatchIds` are owned by `use-preferences-store.ts`; `extraSlots`, `boostedUntil`, `superLikeBalance`, `superLikeLastUseAt`, and `subscription` are owned by `use-monetization-store.ts`; `drafts` and `typingProfileIds` are owned by `use-chat-ui-store.ts`.

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

`likeProfile` checks local match slot limits only when monetization is enabled. If allowed, local visible match activation is delegated to `activateLocalMatchState`, which adds the profile ID to local liked/new-match state and creates a synthetic greeting conversation for fixture/demo profiles.

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

`sendMessage` delegates local/mock text behavior to `sendLocalTextMessage`. That service appends local outgoing messages and schedules simulated fixture replies when applicable. Supabase backend-only real profile sends go through backend chat persistence first.

`sendPhoto` delegates local pending photo messages and simulated approval to `sendLocalPhoto`.

Backend text persistence, read receipts, and Realtime refresh exist in Supabase mode in varying degrees. Photo messages, delete-message behavior, and simulated fixture replies remain local/demo behavior.

### Monetization

`purchase`, `subscribe`, and `cancelSubscription` mutate local counters only through helper calculations in `expo/services/local-monetization-service.ts`. No App Store, Google Play, RevenueCat, or payment backend exists.

Monetization is disabled for the feedback MVP through `expo/constants/features.ts`. Monetizable prototype features should remain demoable where useful and are tracked in `docs/monetization-candidates.md`.

### Partner Links

Partner invite/link behavior is local profile metadata through helpers in `expo/services/local-profile-mutation-service.ts`. Profile mutation persistence application is also centralized there, while `ProfileProvider` keeps the public facade wrappers. Invite links/codes are generated locally and are not backed by email, auth, or a real account-linking backend.

## Extraction Risks

- The provider still combines multiple domains in one context.
- Screens depend directly on provider actions and local state names.
- Local match creation is still coupled to mock profiles and conversations.
- Chat simulation still depends on `MOCK_PROFILES`.
- Conversation write callbacks still coordinate backend state, local simulation, and persisted local updates in the provider.
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
- `expo/services/local-chat-simulation-service.ts`
- `expo/services/local-chat-action-service.ts`
- `expo/services/local-match-action-service.ts`
- `expo/services/local-safety-action-service.ts`
- `expo/services/profile-provider-reset-service.ts`
- `expo/services/safety-action-service.ts`
- `expo/services/backend-match-action-service.ts`
- `expo/services/backend-profile-action-service.ts`
- `expo/services/backend-profile-bootstrap-service.ts`
- `expo/services/backend-profile-display-service.ts`
- `expo/services/backend-swipe-action-service.ts`
- `expo/services/backend-match-hydration-service.ts`
- `expo/services/backend-match-hydration-application-service.ts`
- `expo/services/match-record-utils.ts`
- `expo/services/local-monetization-service.ts`
- `expo/services/local-profile-mutation-service.ts`
- `expo/store/use-interaction-store.ts`
- `expo/store/use-monetization-store.ts`
- `expo/store/use-preferences-store.ts`
- `expo/store/use-chat-ui-store.ts`
- `expo/hooks/use-persisted-conversations.ts`

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

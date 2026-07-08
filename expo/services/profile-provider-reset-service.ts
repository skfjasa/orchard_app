import type { MutableRefObject } from "react";

import type { Conversation, Profile } from "@/types";

interface ApplyProfileProviderSignOutResetInput {
  inFlightBackendMatchHydrationKey: MutableRefObject<string | null>;
  lastBackendMatchHydrationKey: MutableRefObject<string | null>;
  lastBackendProfileSessionKey: MutableRefObject<string | null>;
  pendingBackendMatchRefreshRef: MutableRefObject<boolean>;
  replaceConversations(conversations: Conversation[]): void;
  resetInteractions(): void;
  resetMonetization(): void;
  setBackendMatchesHydrated(value: boolean): void;
  setBackendProfileHydrated(value: boolean): void;
  setNewMatchIds(value: string[]): void;
  setProfile(value: Profile | null): void;
}

interface BackendMatchHydrationResetRefs {
  inFlightBackendMatchHydrationKey: MutableRefObject<string | null>;
  lastBackendMatchHydrationKey: MutableRefObject<string | null>;
  pendingBackendMatchRefreshRef: MutableRefObject<boolean>;
}

interface BackendProfileCacheResetInput {
  displayProfilesRef: MutableRefObject<Record<string, Profile>>;
  knownProfilesRef: MutableRefObject<Profile[]>;
  lastResolvedProfilesRef: MutableRefObject<Record<string, Profile>>;
  saveKnownProfiles(profiles: Profile[]): void | Promise<unknown>;
  setKnownProfiles(profiles: Profile[]): void;
}

interface BackendBootstrapStateResetInput {
  setBackendActiveMatchIds(ids: string[]): void;
  setBackendMatchesHydrated(value: boolean): void;
  setBackendProfileHydrated(value: boolean): void;
}

interface ApplyMockModeBackendBootstrapResetInput
  extends BackendMatchHydrationResetRefs,
    BackendBootstrapStateResetInput,
    BackendProfileCacheResetInput {
  lastBackendProfileSessionKey: MutableRefObject<string | null>;
  lastBackendProfileUserId: MutableRefObject<string | null>;
}

interface ApplyMissingUserBackendBootstrapResetInput
  extends BackendMatchHydrationResetRefs,
    BackendBootstrapStateResetInput {
  lastBackendProfileSessionKey: MutableRefObject<string | null>;
}

interface ApplyUserChangedBackendBootstrapResetInput
  extends BackendBootstrapStateResetInput,
    BackendProfileCacheResetInput {
  lastBackendProfileUserId: MutableRefObject<string | null>;
  lastBackendProfileSessionKey: MutableRefObject<string | null>;
  pendingBackendMatchRefreshRef: MutableRefObject<boolean>;
  sessionKey: string | null;
  userId: string;
}

export function applyProfileProviderSignOutReset({
  inFlightBackendMatchHydrationKey,
  lastBackendMatchHydrationKey,
  lastBackendProfileSessionKey,
  pendingBackendMatchRefreshRef,
  replaceConversations,
  resetInteractions,
  resetMonetization,
  setBackendMatchesHydrated,
  setBackendProfileHydrated,
  setNewMatchIds,
  setProfile,
}: ApplyProfileProviderSignOutResetInput) {
  setProfile(null);
  replaceConversations([]);
  setNewMatchIds([]);
  resetInteractions();
  resetMonetization();
  setBackendProfileHydrated(false);
  setBackendMatchesHydrated(false);
  lastBackendProfileSessionKey.current = null;
  lastBackendMatchHydrationKey.current = null;
  inFlightBackendMatchHydrationKey.current = null;
  pendingBackendMatchRefreshRef.current = false;
}

export function applyMockModeBackendBootstrapReset({
  displayProfilesRef,
  inFlightBackendMatchHydrationKey,
  knownProfilesRef,
  lastBackendMatchHydrationKey,
  lastBackendProfileSessionKey,
  lastBackendProfileUserId,
  lastResolvedProfilesRef,
  pendingBackendMatchRefreshRef,
  saveKnownProfiles,
  setBackendActiveMatchIds,
  setBackendMatchesHydrated,
  setBackendProfileHydrated,
  setKnownProfiles,
}: ApplyMockModeBackendBootstrapResetInput) {
  lastBackendProfileSessionKey.current = null;
  lastBackendProfileUserId.current = null;
  resetBackendMatchHydrationRefs({
    inFlightBackendMatchHydrationKey,
    lastBackendMatchHydrationKey,
    pendingBackendMatchRefreshRef,
  });
  resetBackendProfileCache({
    displayProfilesRef,
    knownProfilesRef,
    lastResolvedProfilesRef,
    saveKnownProfiles,
    setKnownProfiles,
  });
  resetBackendBootstrapState({
    setBackendActiveMatchIds,
    setBackendMatchesHydrated,
    setBackendProfileHydrated,
  });
}

export function applyMissingUserBackendBootstrapReset({
  inFlightBackendMatchHydrationKey,
  lastBackendMatchHydrationKey,
  lastBackendProfileSessionKey,
  pendingBackendMatchRefreshRef,
  setBackendActiveMatchIds,
  setBackendMatchesHydrated,
  setBackendProfileHydrated,
}: ApplyMissingUserBackendBootstrapResetInput) {
  lastBackendProfileSessionKey.current = null;
  resetBackendMatchHydrationRefs({
    inFlightBackendMatchHydrationKey,
    lastBackendMatchHydrationKey,
    pendingBackendMatchRefreshRef,
  });
  resetBackendBootstrapState({
    setBackendActiveMatchIds,
    setBackendMatchesHydrated,
    setBackendProfileHydrated,
  });
}

export function applyUserChangedBackendBootstrapReset({
  displayProfilesRef,
  knownProfilesRef,
  lastBackendProfileSessionKey,
  lastBackendProfileUserId,
  lastResolvedProfilesRef,
  pendingBackendMatchRefreshRef,
  saveKnownProfiles,
  sessionKey,
  setBackendActiveMatchIds,
  setBackendMatchesHydrated,
  setBackendProfileHydrated,
  setKnownProfiles,
  userId,
}: ApplyUserChangedBackendBootstrapResetInput) {
  lastBackendProfileSessionKey.current = sessionKey;
  lastBackendProfileUserId.current = userId;
  pendingBackendMatchRefreshRef.current = false;
  resetBackendProfileCache({
    displayProfilesRef,
    knownProfilesRef,
    lastResolvedProfilesRef,
    saveKnownProfiles,
    setKnownProfiles,
  });
  resetBackendBootstrapState({
    setBackendActiveMatchIds,
    setBackendMatchesHydrated,
    setBackendProfileHydrated,
  });
}

function resetBackendMatchHydrationRefs({
  inFlightBackendMatchHydrationKey,
  lastBackendMatchHydrationKey,
  pendingBackendMatchRefreshRef,
}: BackendMatchHydrationResetRefs) {
  lastBackendMatchHydrationKey.current = null;
  inFlightBackendMatchHydrationKey.current = null;
  pendingBackendMatchRefreshRef.current = false;
}

function resetBackendProfileCache({
  displayProfilesRef,
  knownProfilesRef,
  lastResolvedProfilesRef,
  saveKnownProfiles,
  setKnownProfiles,
}: BackendProfileCacheResetInput) {
  knownProfilesRef.current = [];
  displayProfilesRef.current = {};
  lastResolvedProfilesRef.current = {};
  void saveKnownProfiles([]);
  setKnownProfiles([]);
}

function resetBackendBootstrapState({
  setBackendActiveMatchIds,
  setBackendMatchesHydrated,
  setBackendProfileHydrated,
}: BackendBootstrapStateResetInput) {
  setBackendActiveMatchIds([]);
  setBackendProfileHydrated(false);
  setBackendMatchesHydrated(false);
}

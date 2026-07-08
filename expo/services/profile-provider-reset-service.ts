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

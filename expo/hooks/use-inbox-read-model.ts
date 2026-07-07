import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";

import { useTransientEmptyList } from "@/hooks/use-transient-empty-list";
import { useProfile } from "@/providers/profile-provider";

export function useInboxReadModel() {
  const {
    inboxItems,
    markRead,
    profile,
    refreshBackendMatches,
    typingProfileIds,
  } = useProfile();
  const visibleItems = useTransientEmptyList(inboxItems);
  const typingProfileIdSet = useMemo(
    () => new Set(typingProfileIds),
    [typingProfileIds]
  );

  useFocusEffect(
    useCallback(() => {
      void refreshBackendMatches();
    }, [refreshBackendMatches])
  );

  const isTyping = useCallback(
    (profileId: string) => typingProfileIdSet.has(profileId),
    [typingProfileIdSet]
  );

  return {
    isCouple: profile?.accountType === "couple",
    isTyping,
    markRead,
    mirrorPartnerName: profile?.people[1]?.name ?? "partner",
    visibleItems,
  };
}

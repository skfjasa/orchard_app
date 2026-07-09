import { useCallback, useMemo } from "react";

import { useRefreshMatchesOnFocus } from "@/hooks/use-refresh-matches-on-focus";
import { useTransientEmptyList } from "@/hooks/use-transient-empty-list";
import { useProfile } from "@/providers/profile-provider";

export function useInboxReadModel() {
  const {
    inboxItems,
    markRead,
    profile,
    typingProfileIds,
  } = useProfile();
  const visibleItems = useTransientEmptyList(inboxItems);
  const typingProfileIdSet = useMemo(
    () => new Set(typingProfileIds),
    [typingProfileIds]
  );

  useRefreshMatchesOnFocus();

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

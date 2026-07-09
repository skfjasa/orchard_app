import { useCallback, useMemo } from "react";

import { useRefreshMatchesOnFocus } from "@/hooks/use-refresh-matches-on-focus";
import { useTransientEmptyList } from "@/hooks/use-transient-empty-list";
import { useProfile } from "@/providers/profile-provider";

export function useMatchesReadModel() {
  const {
    matchedProfiles,
    markMatchSeen,
    newMatchIds,
  } = useProfile();
  const visibleMatches = useTransientEmptyList(matchedProfiles);
  const newMatchIdSet = useMemo(() => new Set(newMatchIds), [newMatchIds]);

  useRefreshMatchesOnFocus();

  const isNewMatch = useCallback(
    (profileId: string) => newMatchIdSet.has(profileId),
    [newMatchIdSet]
  );

  return {
    isNewMatch,
    markMatchSeen,
    visibleMatches,
  };
}

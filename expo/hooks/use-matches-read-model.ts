import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";

import { useTransientEmptyList } from "@/hooks/use-transient-empty-list";
import { useProfile } from "@/providers/profile-provider";

export function useMatchesReadModel() {
  const {
    matchedProfiles,
    markMatchSeen,
    newMatchIds,
    refreshBackendMatches,
  } = useProfile();
  const visibleMatches = useTransientEmptyList(matchedProfiles);
  const newMatchIdSet = useMemo(() => new Set(newMatchIds), [newMatchIds]);

  useFocusEffect(
    useCallback(() => {
      void refreshBackendMatches();
    }, [refreshBackendMatches])
  );

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

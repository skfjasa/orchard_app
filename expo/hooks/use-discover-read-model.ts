import { useEffect, useMemo, useState } from "react";

import { useDiscoveryProfilesQuery } from "@/hooks/api/use-discovery";
import { useProfile } from "@/providers/profile-provider";
import type { DiscoveryProfile } from "@/services";

export function useDiscoverReadModel() {
  const {
    profile,
    likedIds,
    passedIds,
    likeProfile,
    passProfile,
    rememberProfiles,
    totalSlots,
    slotsRemaining,
    isAtMatchLimit,
    isBoosted,
    superLikeProfile,
    superLikeBalance,
  } = useProfile();
  const [discoveryProfiles, setDiscoveryProfiles] = useState<DiscoveryProfile[]>(
    []
  );
  const discoveryFilters = useMemo(
    () =>
      profile
        ? {
            profileId: profile.id,
            viewerProfile: profile,
            excludedProfileIds: [...likedIds, ...passedIds],
            includeTestFixtures: false,
          }
        : null,
    [likedIds, passedIds, profile]
  );
  const discoveryQuery = useDiscoveryProfilesQuery({
    enabled: !!profile,
    filters: discoveryFilters,
  });

  useEffect(() => {
    if (!profile) {
      setDiscoveryProfiles([]);
      return;
    }

    const result = discoveryQuery.data;
    if (!result) return;
    if (!result.ok) {
      console.log("[discover] profile discovery failed", {
        code: result.error.code,
        message: result.error.message,
      });
      setDiscoveryProfiles([]);
      return;
    }
    rememberProfiles(result.value.map((item) => item.profile));
    setDiscoveryProfiles(result.value);
  }, [discoveryQuery.data, profile, rememberProfiles]);

  return {
    discoveryProfiles,
    isAtMatchLimit,
    isBoosted,
    likeProfile,
    likedIds,
    passProfile,
    profile,
    slotsRemaining,
    superLikeBalance,
    superLikeProfile,
    totalSlots,
  };
}

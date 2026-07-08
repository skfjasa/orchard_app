import { useEffect, useMemo, useState } from "react";

import { useDiscoveryProfilesQuery } from "@/hooks/api/use-discovery";
import { useProfile } from "@/providers/profile-provider";
import { createAppServices } from "@/services/app-services";
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
  const appServices = useMemo(() => createAppServices(), []);
  const discoveryUsesBackend =
    appServices.capabilities.discovery === "supabase";
  const excludedProfileIds = useMemo(
    () => (discoveryUsesBackend ? [] : [...likedIds, ...passedIds]),
    [discoveryUsesBackend, likedIds, passedIds]
  );
  const discoveryFilters = useMemo(
    () =>
      profile
        ? {
            profileId: profile.id,
            viewerProfile: profile,
            excludedProfileIds,
            includeTestFixtures: false,
          }
        : null,
    [excludedProfileIds, profile]
  );
  const discoveryQuery = useDiscoveryProfilesQuery({
    enabled: !!profile,
    filters: discoveryFilters,
    services: appServices,
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

import { useEffect, useMemo, useState } from "react";

import { MVP_MONETIZATION_ENABLED } from "@/constants/features";
import { MOCK_PROFILE_BACKEND_IDS } from "@/constants/mock-profile-ids";
import { useDiscoveryProfilesQuery } from "@/hooks/api/use-discovery";
import { FRUIT_PROFILES } from "@/mocks/fruit-profiles";
import { useProfile } from "@/providers/profile-provider";
import type { DiscoveryProfile } from "@/services";
import type { Profile } from "@/types";
import { scoreMatch } from "@/utils/match";

export function useFruitReadModel() {
  const {
    profile,
    likedIds,
    passedIds,
    likeProfile,
    purchase,
    rememberProfiles,
  } = useProfile();
  const [backendProfiles, setBackendProfiles] = useState<DiscoveryProfile[]>([]);
  const discoveryFilters = useMemo(
    () =>
      profile
        ? {
            profileId: profile.id,
            viewerProfile: profile,
            excludedProfileIds: [],
            includePassed: true,
            limit: 20,
          }
        : null,
    [profile]
  );
  const discoveryQuery = useDiscoveryProfilesQuery({
    enabled: !!profile,
    filters: discoveryFilters,
  });

  useEffect(() => {
    if (!profile) {
      setBackendProfiles([]);
      return;
    }

    const result = discoveryQuery.data;
    if (!result) return;
    if (!result.ok) {
      console.log("[fruit] profile discovery failed", {
        code: result.error.code,
        message: result.error.message,
      });
      setBackendProfiles([]);
      return;
    }
    rememberProfiles(result.value.map((item) => item.profile));
    setBackendProfiles(result.value);
  }, [discoveryQuery.data, profile, rememberProfiles]);

  const trending = useMemo(() => {
    const backendNonFixtureProfiles = backendProfiles.filter(
      (item) => !(item.profile.id in MOCK_PROFILE_BACKEND_IDS)
    );
    const byId = new Map<string, Profile>();
    for (const item of FRUIT_PROFILES) byId.set(item.id, item);
    for (const item of backendNonFixtureProfiles) {
      byId.set(item.profile.id, item.profile);
    }
    const backendProfileIds = new Set(
      backendNonFixtureProfiles.map((item) => item.profile.id)
    );
    const pool = [...byId.values()].filter((candidate) => {
      if (backendProfileIds.has(candidate.id)) {
        return candidate.id !== profile?.id && !likedIds.includes(candidate.id);
      }
      return !likedIds.includes(candidate.id) && !passedIds.includes(candidate.id);
    });
    return pool
      .map((candidate) => {
        const score = profile
          ? scoreMatch(profile, candidate)
          : { distanceScore: 0.5, distanceKm: 0 };
        const trendingScore = candidate.trendingScore ?? 0.5;
        const isBoostedProfile =
          MVP_MONETIZATION_ENABLED &&
          candidate.boostedUntil &&
          candidate.boostedUntil > Date.now()
            ? 1
            : 0;
        const combined =
          trendingScore * 0.7 +
          score.distanceScore * 0.3 +
          isBoostedProfile * 0.2;
        return { profile: candidate, combined, distanceKm: score.distanceKm };
      })
      .sort((a, b) => b.combined - a.combined)
      .sort((a, b) => {
        const aBackend = backendProfileIds.has(a.profile.id);
        const bBackend = backendProfileIds.has(b.profile.id);
        if (aBackend === bBackend) return 0;
        return aBackend ? -1 : 1;
      })
      .slice(0, 12);
  }, [backendProfiles, profile, likedIds, passedIds]);

  return {
    likeProfile,
    profile,
    purchase,
    trending,
  };
}

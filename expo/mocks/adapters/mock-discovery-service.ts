import type { DiscoveryService } from "@/services";
import { rankProfiles } from "@/utils/match";

import { ok } from "./mock-service-response";
import { isBlockedPair } from "./mock-service-state";
import type { MockServiceState } from "./mock-service-state";

export function createMockDiscoveryService(
  state: MockServiceState
): DiscoveryService {
  return {
    async listProfiles(filters) {
      const swipedIds = new Set(
        state.swipes
          .filter((swipe) => swipe.swiperId === filters.profileId)
          .map((swipe) => swipe.targetId)
      );
      const excludedIds = new Set(filters.excludedProfileIds ?? []);
      const available = state.profiles.filter((profile) => {
        if (profile.id === filters.profileId) return false;
        if (state.hiddenProfileIds.includes(profile.id)) return false;
        if (excludedIds.has(profile.id)) return false;
        if (!filters.includePassed && swipedIds.has(profile.id)) return false;
        if (isBlockedPair(state, filters.profileId, profile.id)) return false;
        return true;
      });
      const viewerProfile = filters.viewerProfile ?? state.currentProfile;
      const ranked = viewerProfile
        ? rankProfiles(viewerProfile, available)
        : available.map((profile) => ({ profile, score: undefined }));
      return ok(ranked.slice(0, filters.limit ?? ranked.length));
    },
  };
}

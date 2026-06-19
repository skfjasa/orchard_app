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
      const available = state.profiles.filter((profile) => {
        if (profile.id === filters.profileId) return false;
        if (state.hiddenProfileIds.includes(profile.id)) return false;
        if (!filters.includePassed && swipedIds.has(profile.id)) return false;
        if (isBlockedPair(state, filters.profileId, profile.id)) return false;
        return true;
      });
      const ranked = state.currentProfile
        ? rankProfiles(state.currentProfile, available)
        : available.map((profile) => ({ profile, score: undefined }));
      return ok(ranked.slice(0, filters.limit ?? ranked.length));
    },
  };
}

import type { MatchService } from "@/services";

import { fail, ok } from "./mock-service-response";
import { findProfile } from "./mock-service-state";
import type { MockServiceState } from "./mock-service-state";

export function createMockMatchService(state: MockServiceState): MatchService {
  return {
    async listMatches(profileId) {
      const matches = state.matches
        .filter(
          (match) =>
            match.status === "active" &&
            (match.userA === profileId || match.userB === profileId)
        )
        .map((match) => {
          const otherId = match.userA === profileId ? match.userB : match.userA;
          return { ...match, otherProfile: findProfile(state, otherId) };
        });
      return ok(matches);
    },

    async getMatch(matchId) {
      return ok(state.matches.find((match) => match.id === matchId) ?? null);
    },

    async unmatch(matchId, profileId) {
      const match = state.matches.find((item) => item.id === matchId);
      if (!match) return fail("match_not_found", "Match was not found.");
      if (match.userA !== profileId && match.userB !== profileId) {
        return fail("not_match_member", "Profile is not part of this match.");
      }
      match.status = "unmatched";
      match.unmatchedBy = profileId;
      match.unmatchedAt = Date.now();
      return ok(match);
    },
  };
}

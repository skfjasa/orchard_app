import type { SwipeService } from "@/services";

import { fail, ok } from "./mock-service-response";
import { findProfile, isBlockedPair } from "./mock-service-state";
import type { MockServiceState } from "./mock-service-state";

function sortedMatchId(userA: string, userB: string): string {
  return `mock-match-${[userA, userB].sort().join("-")}`;
}

export function createMockSwipeService(state: MockServiceState): SwipeService {
  return {
    async recordSwipe(input) {
      if (input.swiperId === input.targetId) {
        return fail("invalid_swipe", "A profile cannot swipe on itself.");
      }
      if (!findProfile(state, input.targetId)) {
        return fail("profile_not_found", "Target profile was not found.");
      }
      if (isBlockedPair(state, input.swiperId, input.targetId)) {
        return fail("blocked_pair", "Blocked users cannot match.");
      }

      state.swipes = state.swipes.filter(
        (swipe) =>
          !(
            swipe.swiperId === input.swiperId &&
            swipe.targetId === input.targetId
          )
      );
      state.swipes.push({ ...input, createdAt: Date.now() });

      const isPositive =
        input.decision === "like" || input.decision === "super_like";
      const reciprocal = state.swipes.find(
        (swipe) =>
          swipe.swiperId === input.targetId &&
          swipe.targetId === input.swiperId &&
          (swipe.decision === "like" || swipe.decision === "super_like")
      );
      const matched = isPositive && !!reciprocal;
      const matchId = matched ? sortedMatchId(input.swiperId, input.targetId) : undefined;

      if (matched && matchId && !state.matches.find((m) => m.id === matchId)) {
        const [userA, userB] = [input.swiperId, input.targetId].sort();
        state.matches.push({
          id: matchId,
          userA,
          userB,
          status: "active",
          createdAt: Date.now(),
        });
      }

      return ok({ decision: input.decision, matched, matchId });
    },
  };
}

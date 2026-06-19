import type { SafetyService } from "@/services";

import { ok } from "./mock-service-response";
import type { MockServiceState } from "./mock-service-state";

export function createMockSafetyService(state: MockServiceState): SafetyService {
  return {
    async blockUser(input) {
      const exists = state.blocks.some(
        (block) =>
          block.blockerId === input.blockerId &&
          block.blockedId === input.blockedId
      );
      if (!exists) {
        state.blocks.push({ ...input, createdAt: Date.now() });
      }
      state.matches = state.matches.map((match) =>
        (match.userA === input.blockerId && match.userB === input.blockedId) ||
        (match.userA === input.blockedId && match.userB === input.blockerId)
          ? {
              ...match,
              status: "blocked",
              unmatchedBy: input.blockerId,
              unmatchedAt: Date.now(),
            }
          : match
      );
      return ok(undefined);
    },

    async reportUser(input) {
      state.reports.push({
        id: `mock-report-${Date.now()}`,
        ...input,
        createdAt: Date.now(),
      });
      return ok(undefined);
    },

    async requestAccountDeletion() {
      state.currentProfile = null;
      return ok(undefined);
    },
  };
}

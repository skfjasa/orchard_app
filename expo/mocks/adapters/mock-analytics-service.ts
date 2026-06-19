import type { AnalyticsService } from "@/services";

import { ok } from "./mock-service-response";
import type { MockServiceState } from "./mock-service-state";

export function createMockAnalyticsService(
  state: MockServiceState
): AnalyticsService {
  return {
    async track(eventName, properties) {
      state.analyticsEvents.push({ eventName, properties });
      return ok(undefined);
    },

    async identify() {
      return ok(undefined);
    },

    async reset() {
      state.analyticsEvents = [];
      return ok(undefined);
    },
  };
}

import type { RealtimeService } from "@/services";

export function createMockRealtimeService(): RealtimeService {
  return {
    subscribeToMatchAndMessageChanges() {
      return okNoopSubscription();
    },
  };
}

function okNoopSubscription() {
  return {
    ok: true as const,
    value: {
      unsubscribe: () => undefined,
    },
  };
}

import type { ServiceResponse } from "./service-types";

export type RealtimeChangeReason = "match" | "message";

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export interface MatchMessageRealtimeInput {
  profileId: string;
  matchIds: string[];
  onChange: (reason: RealtimeChangeReason) => void;
}

export interface RealtimeService {
  subscribeToMatchAndMessageChanges(
    input: MatchMessageRealtimeInput
  ): ServiceResponse<RealtimeSubscription>;
}

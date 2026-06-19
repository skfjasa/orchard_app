import type { ServiceResponse } from "./service-types";

export type SwipeDecision = "like" | "pass" | "super_like";

export interface SwipeInput {
  swiperId: string;
  targetId: string;
  decision: SwipeDecision;
}

export interface SwipeResult {
  decision: SwipeDecision;
  matched: boolean;
  matchId?: string;
}

export interface SwipeService {
  recordSwipe(input: SwipeInput): Promise<ServiceResponse<SwipeResult>>;
}

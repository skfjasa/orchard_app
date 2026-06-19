import type {
  AnalyticsService,
  ChatService,
  DiscoveryService,
  MatchService,
  ProfileService,
  SafetyService,
  StorageService,
  SwipeService,
} from "@/services";

import { createMockAnalyticsService } from "./mock-analytics-service";
import { createMockChatService } from "./mock-chat-service";
import { createMockDiscoveryService } from "./mock-discovery-service";
import { createMockMatchService } from "./mock-match-service";
import { createMockProfileService } from "./mock-profile-service";
import { createMockSafetyService } from "./mock-safety-service";
import { createMockServiceState } from "./mock-service-state";
import { createMockStorageService } from "./mock-storage-service";
import { createMockSwipeService } from "./mock-swipe-service";
import type { MockServiceState } from "./mock-service-state";

export interface MockServices {
  state: MockServiceState;
  analytics: AnalyticsService;
  chat: ChatService;
  discovery: DiscoveryService;
  matches: MatchService;
  profiles: ProfileService;
  safety: SafetyService;
  storage: StorageService;
  swipes: SwipeService;
}

export function createMockServices(
  state: MockServiceState = createMockServiceState()
): MockServices {
  return {
    state,
    analytics: createMockAnalyticsService(state),
    chat: createMockChatService(state),
    discovery: createMockDiscoveryService(state),
    matches: createMockMatchService(state),
    profiles: createMockProfileService(state),
    safety: createMockSafetyService(state),
    storage: createMockStorageService(state),
    swipes: createMockSwipeService(state),
  };
}

export { createMockServiceState };
export type { MockServiceState };

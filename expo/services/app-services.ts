import { getBackendMode, type BackendMode } from "@/lib/supabase";
import { createMockServices, type MockServiceState } from "@/mocks/adapters";

import type { AnalyticsService } from "./analytics-service";
import type { ChatService } from "./chat-service";
import type { DiscoveryService } from "./discovery-service";
import type { MatchService } from "./match-service";
import type { ProfileService } from "./profile-service";
import type { RealtimeService } from "./realtime-service";
import type { SafetyService } from "./safety-service";
import type { ServiceMode } from "./service-types";
import type { StorageService } from "./storage-service";
import type { SwipeService } from "./swipe-service";
import { createSupabaseMatchService } from "./supabase-match-service";
import { createSupabaseChatService } from "./supabase-chat-service";
import { createSupabaseDiscoveryService } from "./supabase-discovery-service";
import { createSupabaseProfileService } from "./supabase-profile-service";
import { createSupabaseRealtimeService } from "./supabase-realtime-service";
import { createSupabaseSafetyService } from "./supabase-safety-service";
import { createSupabaseStorageService } from "./supabase-storage-service";
import { createSupabaseSwipeService } from "./supabase-swipe-service";

export interface AppServiceCapabilities {
  analytics: ServiceMode;
  chat: ServiceMode;
  discovery: ServiceMode;
  matches: ServiceMode;
  profiles: ServiceMode;
  realtime: ServiceMode;
  safety: ServiceMode;
  storage: ServiceMode;
  swipes: ServiceMode;
}

export interface AppServices {
  mode: BackendMode;
  mockState: MockServiceState;
  capabilities: AppServiceCapabilities;
  analytics: AnalyticsService;
  chat: ChatService;
  discovery: DiscoveryService;
  matches: MatchService;
  profiles: ProfileService;
  realtime: RealtimeService;
  safety: SafetyService;
  storage: StorageService;
  swipes: SwipeService;
}

export interface CreateAppServicesOptions {
  mode?: BackendMode;
  mockState?: MockServiceState;
}

function createMockCapabilities(): AppServiceCapabilities {
  return {
    analytics: "mock",
    chat: "mock",
    discovery: "mock",
    matches: "mock",
    profiles: "mock",
    realtime: "mock",
    safety: "mock",
    storage: "mock",
    swipes: "mock",
  };
}

function createSupabaseCapabilities(): AppServiceCapabilities {
  return {
    ...createMockCapabilities(),
    chat: "supabase",
    discovery: "supabase",
    matches: "supabase",
    profiles: "supabase",
    realtime: "supabase",
    safety: "supabase",
    storage: "supabase",
    swipes: "supabase",
  };
}

export function createAppServices(
  options: CreateAppServicesOptions = {}
): AppServices {
  const mode = options.mode ?? getBackendMode();
  const mockServices = createMockServices(options.mockState);

  if (mode === "mock") {
    return {
      ...mockServices,
      mode,
      mockState: mockServices.state,
      capabilities: createMockCapabilities(),
    };
  }

  return {
    ...mockServices,
    mode,
    mockState: mockServices.state,
    capabilities: createSupabaseCapabilities(),
    chat: createSupabaseChatService(),
    discovery: createSupabaseDiscoveryService(),
    matches: createSupabaseMatchService(),
    profiles: createSupabaseProfileService(),
    realtime: createSupabaseRealtimeService(),
    safety: createSupabaseSafetyService(),
    storage: createSupabaseStorageService(),
    swipes: createSupabaseSwipeService(),
  };
}

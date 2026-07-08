import type { AppServices } from "@/services/app-services";
import type { SwipeDecision, SwipeResult } from "./swipe-service";
import { isBackendProfileId } from "@/constants/mock-profile-ids";

interface RecordBackendSwipeInput {
  currentProfileId?: string | null;
  decision: SwipeDecision;
  services: AppServices;
  targetId: string;
  userId?: string | null;
}

export type BackendSwipeVisibleMatchResult =
  | { status: "activate_local_match" }
  | { status: "not_matched" };

interface ResolveBackendSwipeVisibleMatchInput {
  currentProfileId?: string | null;
  decision: Extract<SwipeDecision, "like" | "super_like">;
  profileId: string;
  services: AppServices;
  userId?: string | null;
}

export async function resolveBackendSwipeVisibleMatch({
  currentProfileId,
  decision,
  profileId,
  services,
  userId,
}: ResolveBackendSwipeVisibleMatchInput): Promise<BackendSwipeVisibleMatchResult> {
  if (!shouldUseBackendSwipePath(services)) {
    return { status: "activate_local_match" };
  }

  if (!isBackendProfileId(profileId)) {
    return { status: "activate_local_match" };
  }

  const swipe = await recordBackendSwipe({
    currentProfileId,
    decision,
    services,
    targetId: profileId,
    userId,
  });

  if (!swipe?.matched) {
    return { status: "not_matched" };
  }

  return { status: "activate_local_match" };
}

export async function recordBackendSwipe({
  currentProfileId,
  decision,
  services,
  targetId,
  userId,
}: RecordBackendSwipeInput): Promise<SwipeResult | null> {
  if (!canUseBackendSwipes(services, currentProfileId, userId)) {
    return null;
  }

  const result = await services.swipes.recordSwipe({
    swiperId: userId,
    targetId,
    decision,
  });

  if (!result.ok) {
    console.log("[profile-provider] backend swipe failed", {
      code: result.error.code,
      message: result.error.message,
    });
    return null;
  }

  return result.value;
}

function shouldUseBackendSwipePath(services: AppServices) {
  return (
    services.mode === "supabase" &&
    services.capabilities.swipes === "supabase"
  );
}

function canUseBackendSwipes(
  services: AppServices,
  currentProfileId?: string | null,
  userId?: string | null
): userId is string {
  return (
    shouldUseBackendSwipePath(services) &&
    !!currentProfileId &&
    !!userId &&
    currentProfileId === userId
  );
}

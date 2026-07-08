import type { AppServices } from "@/services/app-services";
import type { SwipeDecision, SwipeResult } from "./swipe-service";

interface RecordBackendSwipeInput {
  currentProfileId?: string | null;
  decision: SwipeDecision;
  services: AppServices;
  targetId: string;
  userId?: string | null;
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

function canUseBackendSwipes(
  services: AppServices,
  currentProfileId?: string | null,
  userId?: string | null
): userId is string {
  return (
    services.mode === "supabase" &&
    services.capabilities.swipes === "supabase" &&
    !!currentProfileId &&
    !!userId &&
    currentProfileId === userId
  );
}

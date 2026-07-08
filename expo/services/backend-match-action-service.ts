import {
  isBackendProfileId,
  toBackendProfileId,
} from "@/constants/mock-profile-ids";
import type { AppServices } from "@/services/app-services";

import { findMatchBetweenProfiles } from "./match-record-utils";

export type BackendUnmatchResult =
  | { status: "skipped" }
  | { status: "match_not_found"; targetProfileId: string }
  | { status: "unmatched"; matchId: string }
  | { status: "failed" };

interface UnmatchBackendProfileInput {
  currentProfileId?: string | null;
  profileId: string;
  services: AppServices;
  userId?: string | null;
}

export async function unmatchBackendProfile({
  currentProfileId,
  profileId,
  services,
  userId,
}: UnmatchBackendProfileInput): Promise<BackendUnmatchResult> {
  if (!canUseBackendMatches(services, currentProfileId, userId)) {
    return { status: "skipped" };
  }

  const targetProfileId = toBackendProfileId(profileId);
  if (!isBackendProfileId(targetProfileId)) {
    return { status: "skipped" };
  }

  const matchResult = await services.matches.listMatches(userId);
  if (!matchResult.ok) {
    console.log("[profile-provider] backend unmatch lookup failed", {
      code: matchResult.error.code,
      message: matchResult.error.message,
      targetProfileId,
    });
    return { status: "failed" };
  }

  const match = findMatchBetweenProfiles(
    matchResult.value,
    userId,
    targetProfileId
  );

  if (!match) {
    return { status: "match_not_found", targetProfileId };
  }

  const result = await services.matches.unmatch(match.id, userId);
  if (!result.ok) {
    console.log("[profile-provider] backend unmatch failed", {
      code: result.error.code,
      message: result.error.message,
      targetProfileId,
    });
    return { status: "failed" };
  }

  return { status: "unmatched", matchId: match.id };
}

function canUseBackendMatches(
  services: AppServices,
  currentProfileId?: string | null,
  userId?: string | null
): userId is string {
  return (
    services.mode === "supabase" &&
    services.capabilities.matches === "supabase" &&
    !!currentProfileId &&
    !!userId &&
    currentProfileId === userId
  );
}

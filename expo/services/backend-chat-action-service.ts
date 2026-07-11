import {
  isBackendProfileId,
  toBackendProfileId,
} from "@/constants/mock-profile-ids";
import type { AppServices } from "@/services/app-services";
import type { ServiceFailure } from "@/services/service-types";
import type { Message } from "@/types";

import { findMatchBetweenProfiles } from "./match-record-utils";

export type BackendChatSendResult =
  | { status: "skipped" }
  | { status: "match_not_found"; targetProfileId: string }
  | { status: "sent"; message: Message }
  | {
      status: "failed";
      stage: "lookup" | "send";
      error: ServiceFailure;
    };

type BackendChatMatchLookupResult =
  | { status: "found"; matchId: string }
  | { status: "not_found" }
  | { status: "failed"; error: ServiceFailure };

interface SendBackendChatMessageInput {
  body: string;
  currentProfileId?: string | null;
  services: AppServices;
  targetId: string;
  userId?: string | null;
}

interface MarkBackendConversationReadInput {
  currentProfileId?: string | null;
  profileId: string;
  readThrough: number;
  services: AppServices;
  userId?: string | null;
}

export async function sendBackendChatMessage({
  body,
  currentProfileId,
  services,
  targetId,
  userId,
}: SendBackendChatMessageInput): Promise<BackendChatSendResult> {
  if (!canUseBackendChat(services, currentProfileId, userId)) {
    return { status: "skipped" };
  }

  const targetProfileId = toBackendProfileId(targetId);
  if (!isBackendProfileId(targetProfileId)) {
    return { status: "skipped" };
  }

  const matchLookup = await findBackendChatMatch({
    lookupContext: "send",
    services,
    targetProfileId,
    userId,
  });

  if (matchLookup.status === "failed") {
    return { status: "failed", stage: "lookup", error: matchLookup.error };
  }

  if (matchLookup.status === "not_found") {
    console.log("[profile-provider] backend chat match not found", {
      targetProfileId,
    });
    return { status: "match_not_found", targetProfileId };
  }

  const result = await services.chat.sendMessage({
    matchId: matchLookup.matchId,
    senderId: userId,
    body,
  });

  if (!result.ok) {
    console.log("[profile-provider] backend message send failed", {
      code: result.error.code,
      message: result.error.message,
    });
    return { status: "failed", stage: "send", error: result.error };
  }

  return { status: "sent", message: result.value };
}

export async function markBackendConversationRead({
  currentProfileId,
  profileId,
  readThrough,
  services,
  userId,
}: MarkBackendConversationReadInput): Promise<void> {
  if (readThrough <= 0) return;
  if (!canUseBackendChat(services, currentProfileId, userId)) return;

  const targetProfileId = toBackendProfileId(profileId);
  if (!isBackendProfileId(targetProfileId)) return;

  const matchLookup = await findBackendChatMatch({
    lookupContext: "mark_read",
    services,
    targetProfileId,
    userId,
  });

  if (matchLookup.status !== "found") return;

  const result = await services.chat.markRead(
    matchLookup.matchId,
    userId,
    readThrough
  );
  if (!result.ok) {
    console.log("[profile-provider] backend mark read failed", {
      code: result.error.code,
      message: result.error.message,
    });
  }
}

function canUseBackendChat(
  services: AppServices,
  currentProfileId?: string | null,
  userId?: string | null
): userId is string {
  return (
    services.mode === "supabase" &&
    services.capabilities.chat === "supabase" &&
    services.capabilities.matches === "supabase" &&
    !!currentProfileId &&
    !!userId &&
    currentProfileId === userId
  );
}

async function findBackendChatMatch({
  lookupContext,
  services,
  targetProfileId,
  userId,
}: {
  lookupContext: "mark_read" | "send";
  services: AppServices;
  targetProfileId: string;
  userId: string;
}): Promise<BackendChatMatchLookupResult> {
  const matchResult = await services.matches.listMatches(userId);
  if (!matchResult.ok) {
    const message =
      lookupContext === "mark_read"
        ? "[profile-provider] backend mark read match lookup failed"
        : "[profile-provider] backend match lookup failed";
    console.log(message, {
      code: matchResult.error.code,
      message: matchResult.error.message,
    });
    return { status: "failed", error: matchResult.error };
  }

  const match = findMatchBetweenProfiles(
    matchResult.value,
    userId,
    targetProfileId
  );

  return match?.status === "active"
    ? { status: "found", matchId: match.id }
    : { status: "not_found" };
}

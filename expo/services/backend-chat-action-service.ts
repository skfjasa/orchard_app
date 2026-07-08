import {
  isBackendProfileId,
  toBackendProfileId,
} from "@/constants/mock-profile-ids";
import type { AppServices } from "@/services/app-services";
import type { Message } from "@/types";

import { findMatchBetweenProfiles } from "./match-record-utils";

export type BackendChatSendResult =
  | { status: "skipped" }
  | { status: "match_not_found"; targetProfileId: string }
  | { status: "sent"; message: Message }
  | { status: "failed" };

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

  const matchId = await findBackendChatMatchId({
    lookupContext: "send",
    repairWithSwipe: true,
    services,
    targetId,
    targetProfileId,
    userId,
  });

  if (matchId === "failed") {
    return { status: "failed" };
  }

  if (!matchId) {
    console.log("[profile-provider] backend chat match not found", {
      targetProfileId,
    });
    return { status: "match_not_found", targetProfileId };
  }

  const result = await services.chat.sendMessage({
    matchId,
    senderId: userId,
    body,
  });

  if (!result.ok) {
    console.log("[profile-provider] backend message send failed", {
      code: result.error.code,
      message: result.error.message,
    });
    return { status: "failed" };
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

  const matchId = await findBackendChatMatchId({
    lookupContext: "mark_read",
    repairWithSwipe: false,
    services,
    targetId: profileId,
    targetProfileId,
    userId,
  });

  if (!matchId || matchId === "failed") return;

  const result = await services.chat.markRead(matchId, userId, readThrough);
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

async function findBackendChatMatchId({
  repairWithSwipe,
  lookupContext,
  services,
  targetId,
  targetProfileId,
  userId,
}: {
  lookupContext: "mark_read" | "send";
  repairWithSwipe: boolean;
  services: AppServices;
  targetId: string;
  targetProfileId: string;
  userId: string;
}): Promise<string | null | "failed"> {
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
    return "failed";
  }

  const match = findMatchBetweenProfiles(
    matchResult.value,
    userId,
    targetProfileId
  );

  if (match) return match.id;

  if (!repairWithSwipe || services.capabilities.swipes !== "supabase") {
    return null;
  }

  const swipeResult = await services.swipes.recordSwipe({
    swiperId: userId,
    targetId,
    decision: "like",
  });

  if (!swipeResult.ok) {
    console.log("[profile-provider] backend chat match repair failed", {
      code: swipeResult.error.code,
      message: swipeResult.error.message,
      targetProfileId,
    });
    return null;
  }

  return swipeResult.value.matchId ?? null;
}

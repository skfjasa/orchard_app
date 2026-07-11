import type { Conversation } from "@/types";

import type { BackendChatSendResult } from "./backend-chat-action-service";
import { mergeBackendConversation } from "./local-interaction-service";
import { removeLocalMatchState } from "./local-match-action-service";

type IdListUpdate = (updater: (prev: string[]) => string[]) => void;
type ConversationUpdate = (
  updater: (prev: Conversation[]) => Conversation[]
) => void;

interface ApplyBackendChatSendResultInput {
  appendLocalEcho?: boolean;
  result: BackendChatSendResult;
  setLikedIds: IdListUpdate;
  targetId: string;
  updateConversations: ConversationUpdate;
}

export function applyBackendChatSendResult({
  appendLocalEcho = true,
  result,
  setLikedIds,
  targetId,
  updateConversations,
}: ApplyBackendChatSendResultInput): void {
  if (result.status === "match_not_found") {
    removeLocalMatchState({
      profileId: targetId,
      setLikedIds,
      updateConversations,
    });
    return;
  }

  if (result.status !== "sent" || !appendLocalEcho) return;

  updateConversations((prev) =>
    mergeBackendConversation(prev, targetId, [result.message])
  );
}

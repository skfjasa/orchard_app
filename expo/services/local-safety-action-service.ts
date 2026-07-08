import type { Conversation } from "@/types";

import {
  addUniqueId,
  removeConversation,
  removeId,
} from "./local-interaction-service";

type IdListUpdate = (updater: (prev: string[]) => string[]) => void;
type ConversationUpdate = (updater: (prev: Conversation[]) => Conversation[]) => void;

interface ApplyLocalBlockCleanupInput {
  blockedProfileId: string;
  setLikedIds: IdListUpdate;
  setPassedIds: IdListUpdate;
  updateConversations: ConversationUpdate;
}

export function applyLocalBlockCleanup({
  blockedProfileId,
  setLikedIds,
  setPassedIds,
  updateConversations,
}: ApplyLocalBlockCleanupInput) {
  setLikedIds((prev) => removeId(prev, blockedProfileId));
  setPassedIds((prev) => addUniqueId(prev, blockedProfileId));
  updateConversations((prev) => removeConversation(prev, blockedProfileId));
}

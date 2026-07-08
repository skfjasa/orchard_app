import type { Conversation, Profile } from "@/types";

import {
  addUniqueId,
  ensureGreetingConversation,
  type LocalGreetingKind,
} from "./local-interaction-service";

type IdListUpdate = (updater: (prev: string[]) => string[]) => void;
type ConversationUpdate = (updater: (prev: Conversation[]) => Conversation[]) => void;

interface ActivateLocalMatchInput {
  kind: LocalGreetingKind;
  mockProfiles: Profile[];
  profileId: string;
  setLikedIds: IdListUpdate;
  setNewMatchIds: IdListUpdate;
  updateConversations: ConversationUpdate;
}

export function activateLocalMatchState({
  kind,
  mockProfiles,
  profileId,
  setLikedIds,
  setNewMatchIds,
  updateConversations,
}: ActivateLocalMatchInput) {
  setNewMatchIds((prev) => addUniqueId(prev, profileId));

  setLikedIds((prev) => {
    const next = addUniqueId(prev, profileId);
    if (next === prev) return prev;
    return next;
  });

  updateConversations((prev) => {
    const other = mockProfiles.find((profile) => profile.id === profileId);
    const next = ensureGreetingConversation(prev, other, kind);
    if (next === prev) return prev;
    return next;
  });
}

import type { Conversation, Profile } from "@/types";

import {
  addUniqueId,
  ensureGreetingConversation,
  removeConversation,
  removeId,
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

interface RemoveLocalMatchInput {
  profileId: string;
  setLikedIds: IdListUpdate;
  updateConversations: ConversationUpdate;
}

interface PassLocalProfileInput {
  profileId: string;
  setPassedIds: IdListUpdate;
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

export function removeLocalMatchState({
  profileId,
  setLikedIds,
  updateConversations,
}: RemoveLocalMatchInput) {
  setLikedIds((prev) => removeId(prev, profileId));
  updateConversations((prev) => removeConversation(prev, profileId));
}

export function passLocalProfile({
  profileId,
  setPassedIds,
}: PassLocalProfileInput) {
  setPassedIds((prev) => {
    const next = addUniqueId(prev, profileId);
    if (next === prev) return prev;
    return next;
  });
}

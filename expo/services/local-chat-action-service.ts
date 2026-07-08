import type { Conversation, Profile } from "@/types";

import {
  appendIncomingTextReply,
  appendOutgoingPhotoRequest,
  appendOutgoingTextMessage,
  approvePendingPhoto,
  removeMessage,
  updatePhotoStatus,
} from "./local-interaction-service";
import {
  scheduleSimulatedPhotoApproval,
  scheduleSimulatedTextReply,
} from "./local-chat-simulation-service";

type ConversationUpdate = (updater: (prev: Conversation[]) => Conversation[]) => void;

interface SendLocalTextMessageInput {
  authorName?: string;
  localMockProfile?: Profile;
  persistBackendChatMessage: (
    profileId: string,
    text: string,
    options?: { appendLocalEcho?: boolean }
  ) => void;
  profileId: string;
  text: string;
  updateConversations: ConversationUpdate;
}

interface DeleteLocalMessageInput {
  messageId: string;
  profileId: string;
  updateConversations: ConversationUpdate;
}

interface SendLocalPhotoInput {
  authorName?: string;
  photoUri: string;
  profileId: string;
  updateConversations: ConversationUpdate;
}

interface RespondToLocalPhotoInput {
  decision: "approved" | "declined";
  messageId: string;
  profileId: string;
  updateConversations: ConversationUpdate;
}

export function sendLocalTextMessage({
  authorName,
  localMockProfile,
  persistBackendChatMessage,
  profileId,
  text,
  updateConversations,
}: SendLocalTextMessageInput) {
  console.log("[profile-provider] sendMessage", { profileId, length: text.length });
  updateConversations((prev) => {
    const exists = prev.find((conversation) => conversation.profileId === profileId);
    if (!exists) {
      console.log(
        "[profile-provider] sendMessage: creating missing convo",
        profileId
      );
    }
    return appendOutgoingTextMessage(prev, profileId, text, authorName);
  });

  persistBackendChatMessage(profileId, text, {
    appendLocalEcho: !localMockProfile,
  });

  if (!localMockProfile) return;
  scheduleSimulatedTextReply(localMockProfile, (reply) => {
    updateConversations((prev) =>
      appendIncomingTextReply(prev, profileId, localMockProfile, reply)
    );
  });
}

export function deleteLocalMessage({
  messageId,
  profileId,
  updateConversations,
}: DeleteLocalMessageInput) {
  console.log("[profile-provider] deleteMessage", { profileId, messageId });
  updateConversations((prev) => removeMessage(prev, profileId, messageId));
}

export function sendLocalPhoto({
  authorName,
  photoUri,
  profileId,
  updateConversations,
}: SendLocalPhotoInput) {
  const messageId = `m-${Date.now()}`;
  updateConversations((prev) =>
    appendOutgoingPhotoRequest(prev, profileId, photoUri, messageId, authorName)
  );

  scheduleSimulatedPhotoApproval(() => {
    console.log("[profile-provider] simulated photo approval", messageId);
    updateConversations((prev) =>
      approvePendingPhoto(prev, profileId, messageId)
    );
  });
}

export function respondToLocalPhoto({
  decision,
  messageId,
  profileId,
  updateConversations,
}: RespondToLocalPhotoInput) {
  updateConversations((prev) =>
    updatePhotoStatus(prev, profileId, messageId, decision)
  );
}

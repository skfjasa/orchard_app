import { Conversation, Message, Profile } from "@/types";

export type LocalGreetingKind = "like" | "super_like";
type IdListUpdate = (updater: (prev: string[]) => string[]) => void;

interface MarkLocalMatchSeenInput {
  ownerProfileId: string | undefined;
  profileId: string;
  seenMatchIds: Record<string, string[]>;
  setNewMatchIds: IdListUpdate;
  setSeenMatchIds(seenMatchIds: Record<string, string[]>): void;
  onSeenMatchIdsChanged?(seenMatchIds: Record<string, string[]>): void;
}

export function addUniqueId(ids: string[], id: string): string[] {
  if (ids.includes(id)) return ids;
  return [...ids, id];
}

export function removeId(ids: string[], id: string): string[] {
  return ids.filter((value) => value !== id);
}

export function ensureGreetingConversation(
  conversations: Conversation[],
  other: Profile | undefined,
  kind: LocalGreetingKind
): Conversation[] {
  if (!other) return conversations;
  const greeting: Message = {
    id: `m-${Date.now()}`,
    fromMe: false,
    authorName: other.people[0]?.name,
    text: makeGreetingText(other, kind),
    at: Date.now(),
  };

  const existing = conversations.find(
    (conversation) => conversation.profileId === other.id
  );
  if (existing) {
    if (existing.messages.some((message) => !message.fromMe)) {
      return conversations;
    }
    return conversations.map((conversation) =>
      conversation.profileId === other.id
        ? {
            ...conversation,
            messages: [greeting, ...conversation.messages],
            unread: conversation.unread + 1,
          }
        : conversation
    );
  }

  const convo: Conversation = {
    id: `c-${other.id}`,
    profileId: other.id,
    messages: [greeting],
    unread: 1,
  };
  return [convo, ...conversations];
}

export function removeConversation(
  conversations: Conversation[],
  profileId: string
): Conversation[] {
  return conversations.filter((conversation) => conversation.profileId !== profileId);
}

export function appendOutgoingTextMessage(
  conversations: Conversation[],
  profileId: string,
  text: string,
  authorName?: string
): Conversation[] {
  const msg: Message = {
    id: `m-${Date.now()}`,
    fromMe: true,
    authorName,
    text,
    at: Date.now(),
    kind: "text",
  };
  return appendOrCreateConversation(conversations, profileId, msg);
}

export function makeSimulatedReply(other: Profile): string {
  const replies = [
    `Ha, love that \u2014 tell me more!`,
    `Okay that's a vibe. What's your go-to weekend move?`,
    `Totally feel you. Coffee or cocktails first?`,
    `You're funny. What are you up to this week?`,
    `Same energy. Favorite spot in ${other.location.city}?`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

export function appendIncomingTextReply(
  conversations: Conversation[],
  profileId: string,
  other: Profile,
  text: string
): Conversation[] {
  const replyMsg: Message = {
    id: `m-${Date.now()}-r`,
    fromMe: false,
    authorName: other.people[0]?.name,
    text,
    at: Date.now(),
    kind: "text",
  };
  return conversations.map((conversation) =>
    conversation.profileId === profileId
      ? {
          ...conversation,
          messages: [...conversation.messages, replyMsg],
          unread: conversation.unread + 1,
        }
      : conversation
  );
}

export function removeMessage(
  conversations: Conversation[],
  profileId: string,
  messageId: string
): Conversation[] {
  return conversations.map((conversation) =>
    conversation.profileId === profileId
      ? {
          ...conversation,
          messages: conversation.messages.filter((message) => message.id !== messageId),
        }
      : conversation
  );
}

export function appendOutgoingPhotoRequest(
  conversations: Conversation[],
  profileId: string,
  photoUri: string,
  messageId: string,
  authorName?: string
): Conversation[] {
  const msg: Message = {
    id: messageId,
    fromMe: true,
    authorName,
    text: "Photo request",
    at: Date.now(),
    kind: "photo",
    photoUri,
    photoStatus: "pending",
  };
  return appendOrCreateConversation(conversations, profileId, msg);
}

export function updatePhotoStatus(
  conversations: Conversation[],
  profileId: string,
  messageId: string,
  decision: "approved" | "declined"
): Conversation[] {
  return conversations.map((conversation) =>
    conversation.profileId === profileId
      ? {
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId && message.kind === "photo"
              ? { ...message, photoStatus: decision }
              : message
          ),
        }
      : conversation
  );
}

export function approvePendingPhoto(
  conversations: Conversation[],
  profileId: string,
  messageId: string
): Conversation[] {
  return conversations.map((conversation) =>
    conversation.profileId === profileId
      ? {
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId && message.photoStatus === "pending"
              ? { ...message, photoStatus: "approved" as const }
              : message
          ),
        }
      : conversation
  );
}

export function markConversationRead(
  conversations: Conversation[],
  profileId: string
): Conversation[] {
  let changed = false;
  const next = conversations.map((conversation) => {
    if (conversation.profileId !== profileId) return conversation;
    if (conversation.unread <= 0) return conversation;
    changed = true;
    return { ...conversation, unread: 0 };
  });

  if (!changed) return conversations;

  return next;
}

export function mergeBackendConversation(
  conversations: Conversation[],
  profileId: string,
  backendMessages: Message[],
  readThrough = 0
): Conversation[] {
  if (backendMessages.length === 0) return conversations;

  const existing = conversations.find(
    (conversation) => conversation.profileId === profileId
  );

  if (!existing) {
    return [
      {
        id: `c-${profileId}`,
        profileId,
        messages: backendMessages,
        unread: backendMessages.filter(
          (message) => !message.fromMe && message.at > readThrough
        ).length,
      },
      ...conversations,
    ];
  }

  const mergedMessages = mergeMessages(existing.messages, backendMessages);
  const unread = mergedMessages.filter(
    (message) => !message.fromMe && message.at > readThrough
  ).length;
  const messagesUnchanged =
    mergedMessages.length === existing.messages.length &&
    mergedMessages.every((message, index) => message === existing.messages[index]);

  if (messagesUnchanged && existing.unread === unread) return conversations;

  return conversations.map((conversation) =>
    conversation.profileId === profileId
      ? {
          ...conversation,
          messages: mergedMessages,
          unread,
        }
      : conversation
  );
}

export function newestMessageAt(
  conversations: Conversation[],
  profileId: string
): number {
  const conversation = conversations.find((item) => item.profileId === profileId);
  if (!conversation) return 0;
  return conversation.messages.reduce(
    (latest, message) => Math.max(latest, message.at),
    0
  );
}

export function applyReadWatermark(
  readWatermarks: Record<string, Record<string, number>>,
  ownerProfileId: string | undefined,
  profileId: string,
  readThrough: number
): Record<string, Record<string, number>> {
  if (!ownerProfileId || readThrough <= 0) return readWatermarks;

  const ownerWatermarks = readWatermarks[ownerProfileId] ?? {};
  if ((ownerWatermarks[profileId] ?? 0) >= readThrough) {
    return readWatermarks;
  }

  return {
    ...readWatermarks,
    [ownerProfileId]: {
      ...ownerWatermarks,
      [profileId]: readThrough,
    },
  };
}

export function applySeenMatchId(
  seenMatchIds: Record<string, string[]>,
  ownerProfileId: string | undefined,
  profileId: string
): Record<string, string[]> {
  if (!ownerProfileId) return seenMatchIds;

  const ownerSeenMatchIds = seenMatchIds[ownerProfileId] ?? [];
  const nextOwnerSeenMatchIds = addUniqueId(ownerSeenMatchIds, profileId);
  if (nextOwnerSeenMatchIds === ownerSeenMatchIds) {
    return seenMatchIds;
  }

  return {
    ...seenMatchIds,
    [ownerProfileId]: nextOwnerSeenMatchIds,
  };
}

export function markLocalMatchSeen({
  ownerProfileId,
  profileId,
  seenMatchIds,
  setNewMatchIds,
  setSeenMatchIds,
  onSeenMatchIdsChanged,
}: MarkLocalMatchSeenInput) {
  setNewMatchIds((prev) => removeId(prev, profileId));
  const nextSeenMatchIds = applySeenMatchId(
    seenMatchIds,
    ownerProfileId,
    profileId
  );
  if (nextSeenMatchIds === seenMatchIds) return;

  onSeenMatchIdsChanged?.(nextSeenMatchIds);
  setSeenMatchIds(nextSeenMatchIds);
}

function appendOrCreateConversation(
  conversations: Conversation[],
  profileId: string,
  message: Message
): Conversation[] {
  const exists = conversations.find(
    (conversation) => conversation.profileId === profileId
  );
  if (exists) {
    return conversations.map((conversation) =>
      conversation.profileId === profileId
        ? { ...conversation, messages: [...conversation.messages, message] }
        : conversation
    );
  }

  const convo: Conversation = {
    id: `c-${profileId}`,
    profileId,
    messages: [message],
    unread: 0,
  };
  return [convo, ...conversations];
}

function makeGreetingText(other: Profile, kind: LocalGreetingKind): string {
  if (kind === "super_like") {
    return other.accountType === "couple"
      ? `Whoa, a super like! ${other.people[0]?.name} & ${other.people[1]?.name} here \u2014 you definitely caught our eye.`
      : `A super like?! You've got my attention. What's your story?`;
  }

  return other.accountType === "couple"
    ? `Hey! ${other.people[0]?.name} & ${other.people[1]?.name} here. Loved your profile \u2014 how's your week going?`
    : `Hi! I really liked your profile. What brings you to Orchard?`;
}

function isLikelyLocalBackendEcho(localMessage: Message, backendMessage: Message) {
  return (
    localMessage.id.startsWith("m-") &&
    localMessage.fromMe === true &&
    backendMessage.fromMe === true &&
    localMessage.kind === backendMessage.kind &&
    localMessage.text === backendMessage.text &&
    Math.abs(localMessage.at - backendMessage.at) < 15_000
  );
}

function mergeMessages(localMessages: Message[], backendMessages: Message[]) {
  const byId = new Map<string, Message>();
  for (const message of localMessages) {
    byId.set(message.id, message);
  }
  for (const message of backendMessages) {
    const duplicateLocalEcho = [...byId.values()].some((existing) =>
      isLikelyLocalBackendEcho(existing, message)
    );
    if (duplicateLocalEcho) continue;
    byId.set(message.id, message);
  }

  return [...byId.values()].sort((a, b) => a.at - b.at);
}

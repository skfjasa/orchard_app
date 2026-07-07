import type { ProfileInboxItem } from "@/providers/profile-provider-contract";
import type { Conversation, Profile } from "@/types";

type ProfileLookup = (profileId: string) => Profile | undefined;

export function findConversationByProfileId(
  conversations: Conversation[],
  profileId: string
): Conversation | undefined {
  return conversations.find(
    (conversation) => conversation.profileId === profileId
  );
}

export function hasActiveProfileMatch(
  likedIds: string[],
  profileId: string
): boolean {
  return likedIds.includes(profileId);
}

export function buildMatchedProfiles(
  likedIds: string[],
  getProfileById: ProfileLookup
): Profile[] {
  return likedIds
    .map((profileId) => getProfileById(profileId))
    .filter((item): item is Profile => !!item);
}

export function buildInboxItems(
  conversations: Conversation[],
  getProfileById: ProfileLookup
): ProfileInboxItem[] {
  return conversations
    .map<ProfileInboxItem | null>((conversation) => {
      const other = getProfileById(conversation.profileId);
      if (!other) return null;
      const messages = Array.isArray(conversation.messages)
        ? conversation.messages
        : [];
      const lastMessage = messages[messages.length - 1] ?? null;
      return {
        conversation: { ...conversation, messages },
        other,
        lastMessage,
      };
    })
    .filter((item): item is ProfileInboxItem => !!item)
    .sort((a, b) => {
      const aTime = a.lastMessage?.at ?? 0;
      const bTime = b.lastMessage?.at ?? 0;
      return bTime - aTime;
    });
}

export function countUnreadMessages(conversations: Conversation[]): number {
  return conversations.reduce(
    (total, conversation) => total + Math.max(0, conversation.unread),
    0
  );
}

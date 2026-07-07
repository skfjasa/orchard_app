import { useMemo } from "react";

import { useProfile } from "@/providers/profile-provider";

export function useChatThreadReadModel(profileId?: string) {
  const {
    blockProfile,
    deleteMessage,
    drafts,
    getConversation,
    getProfileById,
    hasActiveMatch,
    markRead,
    profile,
    respondToPhoto,
    sendMessage,
    sendPhoto,
    setDraft,
    typingProfileIds,
    unmatch,
  } = useProfile();

  const otherProfile = useMemo(
    () => (profileId ? getProfileById(profileId) : undefined),
    [getProfileById, profileId]
  );

  const conversation = useMemo(
    () => (profileId ? getConversation(profileId) : undefined),
    [getConversation, profileId]
  );

  return {
    blockProfile,
    conversation,
    currentProfile: profile,
    deleteMessage,
    draftText: profileId ? drafts[profileId] ?? "" : "",
    hasActiveLocalMatch: profileId ? hasActiveMatch(profileId) : false,
    isTyping: profileId ? typingProfileIds.includes(profileId) : false,
    markRead,
    otherProfile,
    respondToPhoto,
    sendMessage,
    sendPhoto,
    setDraft,
    unmatch,
  };
}

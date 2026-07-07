import { useMemo } from "react";

import { useProfile } from "@/providers/profile-provider";

export function useMatchDetailReadModel(profileId?: string) {
  const {
    blockProfile,
    getProfileById,
    hasActiveMatch,
    likeProfile,
    markMatchSeen,
    passProfile,
    profile,
    superLikedIds,
    superLikeProfile,
  } = useProfile();

  const otherProfile = useMemo(
    () => (profileId ? getProfileById(profileId) : undefined),
    [getProfileById, profileId]
  );

  return {
    blockProfile,
    currentProfile: profile,
    isMatched: otherProfile ? hasActiveMatch(otherProfile.id) : false,
    isSuperLiked: otherProfile ? superLikedIds.includes(otherProfile.id) : false,
    likeProfile,
    markMatchSeen,
    otherProfile,
    passProfile,
    superLikeProfile,
  };
}

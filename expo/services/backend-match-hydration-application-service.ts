import { isBackendProfileId } from "@/constants/mock-profile-ids";
import type { Conversation, Profile } from "@/types";

import type { BackendConversationHydration } from "./backend-match-hydration-service";
import {
  ensureGreetingConversation,
  mergeBackendConversation,
} from "./local-interaction-service";

export function mergeBackendLikedIds(
  previousIds: string[],
  matchedLocalProfileIds: string[]
): string[] {
  const localOnlyLikedIds = previousIds.filter((id) => !isBackendProfileId(id));
  const next = [...matchedLocalProfileIds, ...localOnlyLikedIds];
  if (sameStringSet(previousIds, next)) return previousIds;
  return next;
}

export function mergeBackendNewMatchIds({
  matchedLocalProfileIds,
  previousIds,
  seenMatchIds,
}: {
  matchedLocalProfileIds: string[];
  previousIds: string[];
  seenMatchIds: string[];
}): string[] {
  const currentSeenMatchIds = new Set(seenMatchIds);
  const nextNewMatchIds = matchedLocalProfileIds.filter(
    (id) => !currentSeenMatchIds.has(id)
  );
  const localOnlyNewMatchIds = previousIds.filter(
    (id) => !isBackendProfileId(id)
  );
  const next = [...new Set([...nextNewMatchIds, ...localOnlyNewMatchIds])];
  if (sameStringSet(previousIds, next)) return previousIds;
  return next;
}

export function mergeBackendHydratedConversations({
  backendConversations,
  matchedLocalProfileIds,
  mockProfiles,
  previousConversations,
  readWatermarks,
  userId,
}: {
  backendConversations: BackendConversationHydration[];
  matchedLocalProfileIds: string[];
  mockProfiles: Profile[];
  previousConversations: Conversation[];
  readWatermarks: Record<string, Record<string, number>>;
  userId: string;
}): Conversation[] {
  const matchedProfileIdSet = new Set(matchedLocalProfileIds);
  const filtered = previousConversations.filter(
    (conversation) =>
      matchedProfileIdSet.has(conversation.profileId) ||
      !isBackendProfileId(conversation.profileId)
  );
  let next = filtered.length === previousConversations.length
    ? previousConversations
    : filtered;

  for (const backendConversation of backendConversations) {
    const hostedReadThrough = backendConversation.readThrough ?? 0;
    const localReadThrough =
      readWatermarks[userId]?.[backendConversation.profileId] ?? 0;
    const readThrough = Math.max(hostedReadThrough, localReadThrough);
    next = mergeBackendConversation(
      next,
      backendConversation.profileId,
      backendConversation.messages,
      readThrough
    );
    if (backendConversation.isFixture) {
      const other =
        mockProfiles.find(
          (item) => item.id === backendConversation.profileId
        ) ?? undefined;
      next = ensureGreetingConversation(next, other, "like");
    }
  }

  return next;
}

function sameStringSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const values = new Set(a);
  return b.every((item) => values.has(item));
}

import { isBackendProfileId } from "@/constants/mock-profile-ids";
import type { Conversation, Profile } from "@/types";

import type {
  BackendConversationHydration,
  BackendMatchHydrationReadyPlan,
} from "./backend-match-hydration-service";
import {
  ensureGreetingConversation,
  mergeBackendConversation,
} from "./local-interaction-service";

interface ApplyBackendMatchHydrationPlanInput {
  hydrationPlan: BackendMatchHydrationReadyPlan;
  mockProfiles: Profile[];
  readWatermarks: Record<string, Record<string, number>>;
  rememberProfiles(profiles: Profile[]): void;
  seenMatchIds: string[];
  setBackendActiveMatchIds(
    next:
      | string[]
      | ((previousIds: string[]) => string[])
  ): void;
  setLikedIds(next: string[] | ((previousIds: string[]) => string[])): void;
  setNewMatchIds(next: string[] | ((previousIds: string[]) => string[])): void;
  updateConversations(
    updater: (previousConversations: Conversation[]) => Conversation[]
  ): void;
  userId: string;
}

export function applyBackendMatchHydrationPlan({
  hydrationPlan,
  mockProfiles,
  readWatermarks,
  rememberProfiles,
  seenMatchIds,
  setBackendActiveMatchIds,
  setLikedIds,
  setNewMatchIds,
  updateConversations,
  userId,
}: ApplyBackendMatchHydrationPlanInput) {
  rememberProfiles(hydrationPlan.profilesToRemember);
  setBackendActiveMatchIds((prev) =>
    sameStringSet(prev, hydrationPlan.activeBackendMatchIds)
      ? prev
      : hydrationPlan.activeBackendMatchIds
  );
  setLikedIds((prev) =>
    mergeBackendLikedIds(prev, hydrationPlan.matchedLocalProfileIds)
  );
  setNewMatchIds((prev) =>
    mergeBackendNewMatchIds({
      matchedLocalProfileIds: hydrationPlan.matchedLocalProfileIds,
      previousIds: prev,
      seenMatchIds,
    })
  );
  updateConversations((prev) =>
    mergeBackendHydratedConversations({
      backendConversations: hydrationPlan.backendConversations,
      matchedLocalProfileIds: hydrationPlan.matchedLocalProfileIds,
      mockProfiles,
      previousConversations: prev,
      readWatermarks,
      userId,
    })
  );
}

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

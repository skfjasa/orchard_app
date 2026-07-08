import { MOCK_PROFILES } from "@/mocks/profiles";
import {
  fromBackendProfileId,
  isBackendProfileId,
} from "@/constants/mock-profile-ids";
import type { AppServices } from "@/services/app-services";
import type { MatchRecord } from "@/services/match-service";
import type { Message, Profile } from "@/types";

const INCOMPLETE_BACKEND_PROFILE_NAME = "orchard user";

export interface BackendConversationHydration {
  profileId: string;
  messages: Message[];
  readThrough?: number;
  isFixture: boolean;
}

export type BackendMatchHydrationPlan =
  | {
      status: "ready";
      activeBackendMatchIds: string[];
      backendConversations: BackendConversationHydration[];
      matchedLocalProfileIds: string[];
      profilesToRemember: Profile[];
    }
  | { status: "partial" };

interface BuildBackendMatchHydrationPlanInput {
  displayProfiles: Record<string, Profile>;
  knownProfiles: Profile[];
  matches: MatchRecord[];
  profile: Profile;
  services: AppServices;
  userId: string;
}

export async function buildBackendMatchHydrationPlan({
  displayProfiles,
  knownProfiles,
  matches,
  profile,
  services,
  userId,
}: BuildBackendMatchHydrationPlanInput): Promise<BackendMatchHydrationPlan> {
  const matchedLocalProfileIds = new Set<string>();
  const activeBackendMatchIds = matches.map((match) => match.id);
  const discoveryProfilesById = new Map<string, Profile>();
  const profilesToRemember: Profile[] = [];

  const missingRealProfileIds = matches
    .map((match) =>
      fromBackendProfileId(match.userA === userId ? match.userB : match.userA)
    )
    .filter((profileId, index, allIds) => {
      if (allIds.indexOf(profileId) !== index) return false;
      if (MOCK_PROFILES.some((item) => item.id === profileId)) return false;
      const rememberedProfile =
        knownProfiles.find((item) => item.id === profileId) ??
        displayProfiles[profileId];
      return !chooseDisplayProfile(undefined, rememberedProfile);
    });

  if (
    missingRealProfileIds.length > 0 &&
    services.capabilities.discovery === "supabase"
  ) {
    const discoveryResult = await services.discovery.listProfiles({
      profileId: userId,
      viewerProfile: profile,
      excludedProfileIds: [],
      includePassed: true,
      limit: 100,
    });

    if (discoveryResult.ok) {
      const completeProfiles = discoveryResult.value
        .map((item) => item.profile)
        .filter((item) => !isIncompleteBackendProfile(item));
      profilesToRemember.push(...completeProfiles);
      for (const item of completeProfiles) {
        discoveryProfilesById.set(item.id, item);
      }
    } else {
      console.log("[profile-provider] backend match profile repair failed", {
        code: discoveryResult.error.code,
        message: discoveryResult.error.message,
      });
    }
  }

  const backendConversations: BackendConversationHydration[] = [];

  for (const match of matches) {
    const otherBackendProfileId =
      match.userA === userId ? match.userB : match.userA;
    const otherLocalProfileId = fromBackendProfileId(otherBackendProfileId);
    const mockProfile = MOCK_PROFILES.find(
      (item) => item.id === otherLocalProfileId
    );
    const rememberedProfile =
      knownProfiles.find((item) => item.id === otherLocalProfileId) ??
      displayProfiles[otherLocalProfileId] ??
      discoveryProfilesById.get(otherLocalProfileId);
    const otherProfile =
      mockProfile ?? chooseDisplayProfile(match.otherProfile, rememberedProfile);

    if (!mockProfile && !otherProfile) {
      console.log("[profile-provider] skipping partial match hydration", {
        profileId: otherLocalProfileId,
        matchId: match.id,
      });
      return { status: "partial" };
    }

    matchedLocalProfileIds.add(otherProfile?.id ?? otherLocalProfileId);
    if (!mockProfile && otherProfile) {
      profilesToRemember.push(otherProfile);
    }

    const threadResult = await services.chat.getThread(match.id);
    if (!threadResult.ok) {
      console.log("[profile-provider] backend thread hydration failed", {
        code: threadResult.error.code,
        message: threadResult.error.message,
        matchId: match.id,
        profileId: otherLocalProfileId,
      });
      continue;
    }

    backendConversations.push({
      profileId: otherProfile?.id ?? otherLocalProfileId,
      messages: threadResult.value.messages,
      readThrough: threadResult.value.readThrough,
      isFixture: !!mockProfile,
    });
  }

  return {
    status: "ready",
    activeBackendMatchIds,
    backendConversations,
    matchedLocalProfileIds: [...matchedLocalProfileIds],
    profilesToRemember,
  };
}

function isIncompleteBackendProfile(profile: Profile | undefined): boolean {
  if (!profile || !isBackendProfileId(profile.id)) return false;
  if (MOCK_PROFILES.some((item) => item.id === profile.id)) return false;
  if (profile.people.length === 0) return true;

  return profile.people.every(
    (person) =>
      person.name.trim().toLowerCase() === INCOMPLETE_BACKEND_PROFILE_NAME
  );
}

function chooseDisplayProfile(
  backendProfile: Profile | undefined,
  rememberedProfile: Profile | undefined
): Profile | undefined {
  if (backendProfile && !isIncompleteBackendProfile(backendProfile)) {
    return backendProfile;
  }

  if (rememberedProfile && !isIncompleteBackendProfile(rememberedProfile)) {
    return rememberedProfile;
  }

  return undefined;
}

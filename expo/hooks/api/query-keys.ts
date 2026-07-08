import type { BackendMode } from "@/lib/supabase";
import type { DiscoveryFilters } from "@/services/discovery-service";

function stableIds(ids?: string[]) {
  return [...(ids ?? [])].sort();
}

function viewerProfileKey(filters?: DiscoveryFilters | null) {
  const profile = filters?.viewerProfile;
  if (!profile) return "none";

  return {
    accountType: profile.accountType,
    id: profile.id,
    location: profile.location,
    lookingFor: profile.lookingFor,
    people: profile.people.map((person) => ({
      age: person.age,
      gender: person.gender,
      interests: person.interests ?? [],
      race: person.race,
    })),
    polyType: profile.polyType ?? null,
    preferences: profile.preferences,
  };
}

export const backendQueryKeys = {
  all: ["backend"] as const,
  matches: {
    all: (mode: BackendMode) =>
      [...backendQueryKeys.all, mode, "matches"] as const,
    list: (mode: BackendMode, profileId?: string | null) =>
      [...backendQueryKeys.matches.all(mode), profileId ?? "none"] as const,
  },
  chat: {
    thread: (
      mode: BackendMode,
      profileId?: string | null,
      matchId?: string | null
    ) =>
      [
        ...backendQueryKeys.all,
        mode,
        "chat-thread",
        profileId ?? "none",
        matchId ?? "none",
      ] as const,
  },
  discovery: {
    list: (mode: BackendMode, filters?: DiscoveryFilters | null) =>
      [
        ...backendQueryKeys.all,
        mode,
        "discovery",
        {
          excludedProfileIds: stableIds(filters?.excludedProfileIds),
          includePassed: filters?.includePassed ?? false,
          includeTestFixtures: filters?.includeTestFixtures ?? false,
          limit: filters?.limit ?? null,
          profileId: filters?.profileId ?? "none",
          viewerProfile: viewerProfileKey(filters),
        },
      ] as const,
  },
};

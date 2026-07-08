import { MOCK_PROFILES } from "@/mocks/profiles";
import { isBackendProfileId } from "@/constants/mock-profile-ids";
import type { Profile } from "@/types";

const INCOMPLETE_BACKEND_PROFILE_NAME = "orchard user";

export function isIncompleteBackendProfile(
  profile: Profile | undefined
): boolean {
  if (!profile || !isBackendProfileId(profile.id)) return false;
  if (MOCK_PROFILES.some((item) => item.id === profile.id)) return false;
  if (profile.people.length === 0) return true;

  return profile.people.every(
    (person) =>
      person.name.trim().toLowerCase() === INCOMPLETE_BACKEND_PROFILE_NAME
  );
}

export function chooseDisplayProfile(
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

export function buildBackendDisplayProfileMap(profiles: Profile[]) {
  return Object.fromEntries(
    profiles
      .filter((profile) => !isIncompleteBackendProfile(profile))
      .map((profile) => [profile.id, profile])
  );
}

interface MergeRememberedDisplayProfilesInput {
  previousDisplayProfiles: Record<string, Profile>;
  previousKnownProfiles: Profile[];
  previousLastResolvedProfiles: Record<string, Profile>;
  profilesToRemember: Profile[];
}

export interface RememberedDisplayProfilesMerge {
  changed: boolean;
  displayProfiles: Record<string, Profile>;
  knownProfiles: Profile[];
  lastResolvedProfiles: Record<string, Profile>;
}

export function mergeRememberedDisplayProfiles({
  previousDisplayProfiles,
  previousKnownProfiles,
  previousLastResolvedProfiles,
  profilesToRemember,
}: MergeRememberedDisplayProfilesInput): RememberedDisplayProfilesMerge {
  const byId = new Map(previousKnownProfiles.map((item) => [item.id, item]));
  let changed = false;
  let displayProfiles = previousDisplayProfiles;
  let lastResolvedProfiles = previousLastResolvedProfiles;

  for (const item of profilesToRemember) {
    if (isIncompleteBackendProfile(item)) continue;
    displayProfiles = {
      ...displayProfiles,
      [item.id]: item,
    };
    lastResolvedProfiles = {
      ...lastResolvedProfiles,
      [item.id]: item,
    };
    if (byId.get(item.id) === item) continue;
    byId.set(item.id, item);
    changed = true;
  }

  return {
    changed,
    displayProfiles,
    knownProfiles: changed ? [...byId.values()] : previousKnownProfiles,
    lastResolvedProfiles,
  };
}

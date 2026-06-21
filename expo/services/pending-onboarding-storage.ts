import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Profile } from "@/types";

const PENDING_ONBOARDING_PROFILE_KEY = "orchard.pendingOnboardingProfile.v1";

interface PendingOnboardingProfile {
  profile: Profile;
  createdAt: number;
}

function stripLocalCredentials(profile: Profile): Profile {
  return {
    ...profile,
    credentials: undefined,
  };
}

export async function savePendingOnboardingProfile(profile: Profile) {
  const pending: PendingOnboardingProfile = {
    profile: stripLocalCredentials(profile),
    createdAt: Date.now(),
  };
  await AsyncStorage.setItem(
    PENDING_ONBOARDING_PROFILE_KEY,
    JSON.stringify(pending)
  );
  return pending.profile;
}

export async function loadPendingOnboardingProfile(
  profileId: string,
  ownerEmail?: string | null
): Promise<Profile | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_ONBOARDING_PROFILE_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw) as PendingOnboardingProfile;
    if (pending.profile.id === profileId) return pending.profile;

    const expectedEmail = ownerEmail?.trim().toLowerCase();
    const pendingEmail = pending.profile.ownerEmail?.trim().toLowerCase();
    if (expectedEmail && pendingEmail && expectedEmail === pendingEmail) {
      return {
        ...pending.profile,
        id: profileId,
      };
    }

    return null;
  } catch (error) {
    console.log("[pending-onboarding-storage] load error", error);
    return null;
  }
}

export async function clearPendingOnboardingProfile() {
  await AsyncStorage.removeItem(PENDING_ONBOARDING_PROFILE_KEY);
}

import type { Profile } from "@/types";

import type { ServiceResponse } from "./service-types";

export type ProfilePreparationResult =
  | { status: "prepared" }
  | { status: "already_completed"; profile: Profile };

export interface ProfilePhotoCleanupWarning {
  code: "profile_photo_cleanup_failed";
  storagePaths: string[];
}

export interface ProfilePhotoPersistenceResult {
  profile: Profile;
  warnings: ProfilePhotoCleanupWarning[];
}

export interface OnboardingCompletionResult {
  profile: Profile;
  warnings: ProfilePhotoCleanupWarning[];
}

export interface OnboardingCompletionDependencies<SavedMembers> {
  finalizeProfile(): Promise<ServiceResponse<Profile>>;
  persistMembers(): Promise<ServiceResponse<SavedMembers>>;
  persistPhotos(
    members: SavedMembers
  ): Promise<ServiceResponse<ProfilePhotoPersistenceResult>>;
  persistSettings(): Promise<ServiceResponse<void>>;
  prepareProfile(): Promise<ServiceResponse<ProfilePreparationResult>>;
}

export async function completeOnboardingInPhases<SavedMembers>(
  dependencies: OnboardingCompletionDependencies<SavedMembers>
): Promise<ServiceResponse<OnboardingCompletionResult>> {
  const preparation = await dependencies.prepareProfile();
  if (!preparation.ok) return preparation;
  if (preparation.value.status === "already_completed") {
    return {
      ok: true,
      value: { profile: preparation.value.profile, warnings: [] },
    };
  }

  const members = await dependencies.persistMembers();
  if (!members.ok) return members;

  const settings = await dependencies.persistSettings();
  if (!settings.ok) return settings;

  const photos = await dependencies.persistPhotos(members.value);
  if (!photos.ok) return photos;

  const finalized = await dependencies.finalizeProfile();
  if (!finalized.ok) return finalized;

  return {
    ok: true,
    value: {
      profile: finalized.value,
      warnings: photos.value.warnings,
    },
  };
}

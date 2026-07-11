import type { Profile } from "@/types";

import type { ServiceResponse } from "./service-types";

export type ProfilePreparationResult =
  | { status: "prepared" }
  | { status: "already_completed"; profile: Profile };

export interface OnboardingCompletionDependencies<SavedMembers> {
  finalizeProfile(): Promise<ServiceResponse<Profile>>;
  persistMembers(): Promise<ServiceResponse<SavedMembers>>;
  persistPhotos(
    members: SavedMembers
  ): Promise<ServiceResponse<Profile>>;
  persistSettings(): Promise<ServiceResponse<void>>;
  prepareProfile(): Promise<ServiceResponse<ProfilePreparationResult>>;
}

export async function completeOnboardingInPhases<SavedMembers>(
  dependencies: OnboardingCompletionDependencies<SavedMembers>
): Promise<ServiceResponse<Profile>> {
  const preparation = await dependencies.prepareProfile();
  if (!preparation.ok) return preparation;
  if (preparation.value.status === "already_completed") {
    return { ok: true, value: preparation.value.profile };
  }

  const members = await dependencies.persistMembers();
  if (!members.ok) return members;

  const settings = await dependencies.persistSettings();
  if (!settings.ok) return settings;

  const photos = await dependencies.persistPhotos(members.value);
  if (!photos.ok) return photos;

  return dependencies.finalizeProfile();
}

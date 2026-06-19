import type { Profile } from "@/types";

import type { ServiceResponse } from "./service-types";

export interface ProfileDraftInput {
  profile: Profile;
}

export interface ProfileUpdateInput {
  profileId: string;
  patch: Partial<Profile>;
}

export interface ProfileService {
  getCurrentProfile(): Promise<ServiceResponse<Profile | null>>;
  completeOnboarding(input: ProfileDraftInput): Promise<ServiceResponse<Profile>>;
  updateProfile(input: ProfileUpdateInput): Promise<ServiceResponse<Profile>>;
  setProfileVisibility(
    profileId: string,
    isVisible: boolean
  ): Promise<ServiceResponse<Profile>>;
  signOut(): Promise<ServiceResponse<void>>;
}

import type { Profile } from "@/types";

import type { ServiceResponse } from "./service-types";
import type { OnboardingCompletionResult } from "./onboarding-completion-service";

export interface ProfileDraftInput {
  profile: Profile;
}

export interface ProfileUpdateInput {
  profileId: string;
  patch: Partial<Profile>;
}

export type CurrentProfileResult =
  | { status: "missing" }
  | { status: "incomplete"; profile: Profile }
  | { status: "completed"; profile: Profile };

export interface ProfileService {
  getCurrentProfile(): Promise<ServiceResponse<CurrentProfileResult>>;
  completeOnboarding(
    input: ProfileDraftInput
  ): Promise<ServiceResponse<OnboardingCompletionResult>>;
  updateProfile(input: ProfileUpdateInput): Promise<ServiceResponse<Profile>>;
  setProfileVisibility(
    profileId: string,
    isVisible: boolean
  ): Promise<ServiceResponse<Profile>>;
  signOut(): Promise<ServiceResponse<void>>;
}

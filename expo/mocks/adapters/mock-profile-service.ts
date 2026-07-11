import type {
  ProfileDraftInput,
  ProfileService,
  ProfileUpdateInput,
} from "@/services";

import { fail, ok } from "./mock-service-response";
import type { MockServiceState } from "./mock-service-state";

export function createMockProfileService(
  state: MockServiceState
): ProfileService {
  return {
    async getCurrentProfile() {
      return ok(
        state.currentProfile
          ? { status: "completed" as const, profile: state.currentProfile }
          : { status: "missing" as const }
      );
    },

    async completeOnboarding(input: ProfileDraftInput) {
      state.currentProfile = input.profile;
      return ok(input.profile);
    },

    async updateProfile(input: ProfileUpdateInput) {
      if (!state.currentProfile || state.currentProfile.id !== input.profileId) {
        return fail("profile_not_found", "Current profile was not found.");
      }
      state.currentProfile = { ...state.currentProfile, ...input.patch };
      return ok(state.currentProfile);
    },

    async setProfileVisibility(profileId: string, isVisible: boolean) {
      if (!state.currentProfile || state.currentProfile.id !== profileId) {
        return fail("profile_not_found", "Current profile was not found.");
      }
      state.hiddenProfileIds = isVisible
        ? state.hiddenProfileIds.filter((id) => id !== profileId)
        : [...new Set([...state.hiddenProfileIds, profileId])];
      return ok(state.currentProfile);
    },

    async signOut() {
      state.currentProfile = null;
      state.swipes = [];
      state.matches = [];
      state.conversations = {};
      return ok(undefined);
    },
  };
}

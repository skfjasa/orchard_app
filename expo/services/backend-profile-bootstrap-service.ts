import type { AppServices } from "@/services/app-services";
import type { Profile } from "@/types";

import {
  clearPendingOnboardingProfile,
  loadPendingOnboardingProfile,
} from "./pending-onboarding-storage";

export type BackendProfileBootstrapResult =
  | { status: "loaded"; profile: Profile }
  | { status: "incomplete" }
  | { status: "empty" }
  | { status: "failed" }
  | { status: "cancelled" };

interface BootstrapBackendProfileInput {
  email?: string | null;
  isCancelled?: () => boolean;
  pendingStorage?: {
    clear(): Promise<void>;
    load(profileId: string, ownerEmail?: string | null): Promise<Profile | null>;
  };
  services: AppServices;
  userId: string;
}

export async function bootstrapBackendProfile({
  email,
  isCancelled,
  pendingStorage = {
    clear: clearPendingOnboardingProfile,
    load: loadPendingOnboardingProfile,
  },
  services,
  userId,
}: BootstrapBackendProfileInput): Promise<BackendProfileBootstrapResult> {
  const currentProfileResult = await services.profiles.getCurrentProfile();
  if (isCancelled?.()) return { status: "cancelled" };

  if (!currentProfileResult.ok) {
    console.log("[profile-provider] backend profile load failed", {
      code: currentProfileResult.error.code,
      message: currentProfileResult.error.message,
    });
    return { status: "failed" };
  }

  if (currentProfileResult.value.status === "completed") {
    return { status: "loaded", profile: currentProfileResult.value.profile };
  }

  const pendingProfile = await pendingStorage.load(userId, email);
  if (isCancelled?.()) return { status: "cancelled" };
  if (!pendingProfile) {
    return currentProfileResult.value.status === "incomplete"
      ? { status: "incomplete" }
      : { status: "empty" };
  }

  const pendingResult = await services.profiles.completeOnboarding({
    profile: pendingProfile,
  });
  if (isCancelled?.()) return { status: "cancelled" };

  if (!pendingResult.ok) {
    console.log("[profile-provider] pending profile save failed", {
      code: pendingResult.error.code,
      message: pendingResult.error.message,
    });
    const retryRead = await services.profiles.getCurrentProfile();
    if (isCancelled?.()) return { status: "cancelled" };
    return retryRead.ok && retryRead.value.status === "incomplete"
      ? { status: "incomplete" }
      : { status: "failed" };
  }

  await pendingStorage.clear();
  if (isCancelled?.()) return { status: "cancelled" };

  return { status: "loaded", profile: pendingResult.value };
}

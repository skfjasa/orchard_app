import type { AppServices } from "@/services/app-services";
import type { Profile } from "@/types";

import {
  clearPendingOnboardingProfile,
  loadPendingOnboardingProfile,
} from "./pending-onboarding-storage";

export type BackendProfileBootstrapResult =
  | { status: "loaded"; profile: Profile }
  | { status: "empty" }
  | { status: "failed" }
  | { status: "cancelled" };

interface BootstrapBackendProfileInput {
  email?: string | null;
  isCancelled?: () => boolean;
  services: AppServices;
  userId: string;
}

export async function bootstrapBackendProfile({
  email,
  isCancelled,
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

  if (currentProfileResult.value) {
    return { status: "loaded", profile: currentProfileResult.value };
  }

  const pendingProfile = await loadPendingOnboardingProfile(userId, email);
  if (isCancelled?.()) return { status: "cancelled" };
  if (!pendingProfile) return { status: "empty" };

  const pendingResult = await services.profiles.completeOnboarding({
    profile: pendingProfile,
  });
  if (isCancelled?.()) return { status: "cancelled" };

  if (!pendingResult.ok) {
    console.log("[profile-provider] pending profile save failed", {
      code: pendingResult.error.code,
      message: pendingResult.error.message,
    });
    return { status: "failed" };
  }

  await clearPendingOnboardingProfile();
  if (isCancelled?.()) return { status: "cancelled" };

  return { status: "loaded", profile: pendingResult.value };
}

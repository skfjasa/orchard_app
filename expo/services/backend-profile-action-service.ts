import type { AppServices } from "@/services/app-services";
import type { Profile } from "@/types";

export type BackendProfileCompletionResult =
  | { status: "skipped"; profile: Profile }
  | { status: "completed"; profile: Profile }
  | { status: "failed"; error: string };

export type BackendProfileUpdateResult =
  | { status: "skipped" }
  | { status: "updated"; profile: Profile }
  | { status: "failed" };

interface CompleteBackendOnboardingProfileInput {
  profile: Profile;
  services: AppServices;
}

interface UpdateBackendProfileInput {
  patch: Partial<Profile>;
  profileId: string;
  services: AppServices;
}

export async function completeBackendOnboardingProfile({
  profile,
  services,
}: CompleteBackendOnboardingProfileInput): Promise<BackendProfileCompletionResult> {
  if (!canUseBackendProfiles(services)) {
    return { status: "skipped", profile };
  }

  const result = await services.profiles.completeOnboarding({ profile });
  if (!result.ok) {
    return { status: "failed", error: result.error.message };
  }

  return { status: "completed", profile: result.value };
}

export async function updateBackendProfile({
  patch,
  profileId,
  services,
}: UpdateBackendProfileInput): Promise<BackendProfileUpdateResult> {
  if (!canUseBackendProfiles(services)) {
    return { status: "skipped" };
  }

  const result = await services.profiles.updateProfile({ profileId, patch });
  if (!result.ok) {
    console.log("[profile-provider] backend profile update failed", {
      code: result.error.code,
      message: result.error.message,
    });
    return { status: "failed" };
  }

  return { status: "updated", profile: result.value };
}

function canUseBackendProfiles(services: AppServices) {
  return (
    services.mode === "supabase" &&
    services.capabilities.profiles === "supabase"
  );
}

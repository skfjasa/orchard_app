export type ProfileBootstrapPath =
  | "onboarding"
  | "onboarding_profile"
  | "protected_app";

interface SelectProfileBootstrapPathInput {
  backendProfileIncomplete: boolean;
  hasProfile: boolean;
  hasSession: boolean;
  mode: "mock" | "supabase";
}

export function selectProfileBootstrapPath({
  backendProfileIncomplete,
  hasProfile,
  hasSession,
  mode,
}: SelectProfileBootstrapPathInput): ProfileBootstrapPath {
  if (mode === "supabase" && !hasSession) return "onboarding";
  if (
    mode === "supabase" &&
    hasSession &&
    (backendProfileIncomplete || !hasProfile)
  ) {
    return "onboarding_profile";
  }
  return hasProfile ? "protected_app" : "onboarding";
}

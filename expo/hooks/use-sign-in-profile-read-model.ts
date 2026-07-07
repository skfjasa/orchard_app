import { useProfile } from "@/providers/profile-provider";

export function useSignInProfileReadModel() {
  const { backendMatchesHydrated, backendProfileHydrated, hydrated, profile } =
    useProfile();

  return {
    backendMatchesHydrated,
    backendProfileHydrated,
    hydrated,
    profile,
  };
}

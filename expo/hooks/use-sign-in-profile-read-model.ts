import { useProfile } from "@/providers/profile-provider";

export function useSignInProfileReadModel() {
  const {
    backendMatchesHydrated,
    backendProfileHydrated,
    backendProfileIncomplete,
    hydrated,
    profile,
  } = useProfile();

  return {
    backendMatchesHydrated,
    backendProfileHydrated,
    backendProfileIncomplete,
    hydrated,
    profile,
  };
}

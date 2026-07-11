import { useAuth } from "@/providers/auth-provider";
import { useProfile } from "@/providers/profile-provider";

export function useAppBootstrapReadModel() {
  const { initialized: authInitialized, mode, session } = useAuth();
  const {
    backendMatchesHydrated,
    backendProfileHydrated,
    backendProfileIncomplete,
    hydrated,
    profile,
  } = useProfile();

  return {
    authInitialized,
    backendMatchesHydrated,
    backendProfileHydrated,
    backendProfileIncomplete,
    hydrated,
    mode,
    profile,
    session,
  };
}

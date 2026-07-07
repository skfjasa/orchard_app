import { useAuth } from "@/providers/auth-provider";
import { useProfile } from "@/providers/profile-provider";

export function useAppBootstrapReadModel() {
  const { initialized: authInitialized, mode, session } = useAuth();
  const { backendMatchesHydrated, backendProfileHydrated, hydrated, profile } =
    useProfile();

  return {
    authInitialized,
    backendMatchesHydrated,
    backendProfileHydrated,
    hydrated,
    mode,
    profile,
    session,
  };
}

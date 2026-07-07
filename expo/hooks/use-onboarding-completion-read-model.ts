import { useProfile } from "@/providers/profile-provider";

export function useOnboardingCompletionReadModel() {
  const { completeOnboarding } = useProfile();

  return {
    completeOnboarding,
  };
}

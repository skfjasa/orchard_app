import { useProfile } from "@/providers/profile-provider";

export function useSafetyLegalReadModel() {
  const { requestAccountDeletion } = useProfile();

  return {
    requestAccountDeletion,
  };
}

import { useProfile } from "@/providers/profile-provider";

export function useTabBadgeReadModel() {
  const { newMatchCount, unreadMessageCount } = useProfile();

  return {
    newMatchCount,
    unreadMessageCount,
  };
}

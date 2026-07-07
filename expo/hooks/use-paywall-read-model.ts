import { useProfile } from "@/providers/profile-provider";

export function usePaywallReadModel() {
  const {
    purchase,
    subscribe,
    totalSlots,
    slotsUsed,
    superLikeBalance,
    subscription,
  } = useProfile();

  return {
    purchase,
    slotsUsed,
    subscribe,
    subscription,
    superLikeBalance,
    totalSlots,
  };
}

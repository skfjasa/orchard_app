import { useProfile } from "@/providers/profile-provider";

export function useProfileTabReadModel() {
  const {
    acceptPartnerLink,
    boostedUntil,
    cancelSubscription,
    invitePartner,
    isBoosted,
    profile,
    removePartnerLink,
    resendPartnerInvite,
    signOut,
    slotsRemaining,
    slotsUsed,
    subscription,
    superLikeBalance,
    superLikeRechargeAt,
    totalSlots,
  } = useProfile();

  return {
    acceptPartnerLink,
    boostedUntil,
    cancelSubscription,
    invitePartner,
    isBoosted,
    profile,
    removePartnerLink,
    resendPartnerInvite,
    signOut,
    slotsRemaining,
    slotsUsed,
    subscription,
    superLikeBalance,
    superLikeRechargeAt,
    totalSlots,
  };
}

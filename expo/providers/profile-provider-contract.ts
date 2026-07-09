import type { ReportReason } from "@/services/safety-service";
import type { SubscriptionState } from "@/services/local-profile-storage";
import type {
  Conversation,
  Message,
  Profile,
  PurchaseId,
  SubscriptionId,
} from "@/types";

export type ProfileActionResult = {
  ok: boolean;
  error?: string;
};

export type MatchActionResult = {
  ok: boolean;
  reason?: "limit" | "superlikes";
  matched?: boolean;
};

export interface ProfileInboxItem {
  conversation: Conversation;
  other: Profile;
  lastMessage: Message | null;
}

export interface ProfileProviderContract {
  profile: Profile | null;
  knownProfiles: Profile[];
  conversations: Conversation[];
  likedIds: string[];
  newMatchIds: string[];
  matchedProfiles: Profile[];
  inboxItems: ProfileInboxItem[];
  newMatchCount: number;
  unreadMessageCount: number;
  passedIds: string[];
  hydrated: boolean;
  backendProfileHydrated: boolean;
  backendMatchesHydrated: boolean;
  isLoading: boolean;
  totalSlots: number;
  slotsUsed: number;
  slotsRemaining: number;
  isAtMatchLimit: boolean;
  extraSlots: number;
  boostedUntil: number | null;
  isBoosted: boolean;
  superLikedIds: string[];
  superLikeBalance: number;
  superLikeLastUseAt: number | null;
  superLikeRechargeAt: number | null;
  subscription: SubscriptionState | null;

  getProfileById(profileId: string): Profile | undefined;
  getConversation(profileId: string): Conversation | undefined;
  hasActiveMatch(profileId: string): boolean;
  completeOnboarding(profile: Profile): Promise<ProfileActionResult>;
  rememberProfiles(profiles: Profile[]): void;
  markMatchSeen(profileId: string): Promise<void>;
  updateProfile(patch: Partial<Profile>): void;
  signOut(): Promise<ProfileActionResult>;
  likeProfile(profileId: string): Promise<MatchActionResult>;
  superLikeProfile(profileId: string): Promise<MatchActionResult>;
  unmatch(profileId: string): void;
  reportProfile(
    reportedProfileId: string,
    reason?: ReportReason,
    details?: string,
    reportedMessageId?: string
  ): Promise<ProfileActionResult>;
  blockProfile(blockedProfileId: string): Promise<ProfileActionResult>;
  requestAccountDeletion(reason?: string): Promise<ProfileActionResult>;
  passProfile(profileId: string): void;

  sendMessage(profileId: string, text: string, authorName?: string): void;
  deleteMessage(profileId: string, messageId: string): void;
  sendPhoto(profileId: string, photoUri: string, authorName?: string): void;
  respondToPhoto(
    profileId: string,
    messageId: string,
    decision: "approved" | "declined"
  ): void;
  markRead(profileId: string): void;
  drafts: Record<string, string>;
  setDraft(profileId: string, text: string): void;
  typingProfileIds: string[];

  purchase(purchaseId: PurchaseId): void;
  subscribe(subscriptionId: SubscriptionId): void;
  cancelSubscription(): void;

  invitePartner(email: string, displayName?: string): void;
  resendPartnerInvite(partnerId: string): void;
  acceptPartnerLink(partnerId: string): void;
  removePartnerLink(partnerId: string): void;
}

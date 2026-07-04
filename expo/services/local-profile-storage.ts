import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  Conversation,
  DEFAULT_SUPER_LIKES,
  Profile,
  SubscriptionId,
} from "@/types";

const PROFILE_KEY = "duet.profile.v1";
const CONVOS_KEY = "duet.conversations.v1";
const LIKES_KEY = "duet.likes.v1";
const PASSES_KEY = "duet.passes.v1";
const SUPERLIKES_KEY = "duet.superLikes.v1";
const EXTRA_SLOTS_KEY = "duet.extraSlots.v1";
const BOOST_KEY = "duet.boostedUntil.v1";
const SUPERLIKE_BALANCE_KEY = "duet.superLikeBalance.v1";
const SUPERLIKE_LAST_USE_KEY = "duet.superLikeLastUse.v1";
const SUBSCRIPTION_KEY = "duet.subscription.v1";
const READ_WATERMARKS_KEY = "duet.readWatermarks.v1";
const SEEN_MATCHES_KEY = "duet.seenMatches.v1";
const STORED_PROFILE_STATE_KEYS = [
  PROFILE_KEY,
  CONVOS_KEY,
  LIKES_KEY,
  PASSES_KEY,
  SUPERLIKES_KEY,
  EXTRA_SLOTS_KEY,
  BOOST_KEY,
  SUPERLIKE_BALANCE_KEY,
  SUPERLIKE_LAST_USE_KEY,
  SUBSCRIPTION_KEY,
  READ_WATERMARKS_KEY,
  SEEN_MATCHES_KEY,
];

export interface SubscriptionState {
  id: SubscriptionId;
  startedAt: number;
  renewsAt: number;
  lastGrantAt: number;
}

export interface StoredProfileState {
  profile: Profile | null;
  conversations: Conversation[];
  likedIds: string[];
  passedIds: string[];
  superLikedIds: string[];
  extraSlots: number;
  boostedUntil: number | null;
  superLikeBalance: number;
  superLikeLastUseAt: number | null;
  subscription: SubscriptionState | null;
  readWatermarks: Record<string, Record<string, number>>;
  seenMatchIds: Record<string, string[]>;
}

export function emptyStoredProfileState(): StoredProfileState {
  return {
    profile: null,
    conversations: [],
    likedIds: [],
    passedIds: [],
    superLikedIds: [],
    extraSlots: 0,
    boostedUntil: null,
    superLikeBalance: DEFAULT_SUPER_LIKES,
    superLikeLastUseAt: null,
    subscription: null,
    readWatermarks: {},
    seenMatchIds: {},
  };
}

export async function loadStoredProfileState(): Promise<StoredProfileState> {
  try {
    const [p, c, l, s, sl, es, b, slb, slu, sub, rw, sm] = await Promise.all([
      AsyncStorage.getItem(PROFILE_KEY),
      AsyncStorage.getItem(CONVOS_KEY),
      AsyncStorage.getItem(LIKES_KEY),
      AsyncStorage.getItem(PASSES_KEY),
      AsyncStorage.getItem(SUPERLIKES_KEY),
      AsyncStorage.getItem(EXTRA_SLOTS_KEY),
      AsyncStorage.getItem(BOOST_KEY),
      AsyncStorage.getItem(SUPERLIKE_BALANCE_KEY),
      AsyncStorage.getItem(SUPERLIKE_LAST_USE_KEY),
      AsyncStorage.getItem(SUBSCRIPTION_KEY),
      AsyncStorage.getItem(READ_WATERMARKS_KEY),
      AsyncStorage.getItem(SEEN_MATCHES_KEY),
    ]);

    return {
      profile: p ? (JSON.parse(p) as Profile) : null,
      conversations: c ? (JSON.parse(c) as Conversation[]) : [],
      likedIds: l ? (JSON.parse(l) as string[]) : [],
      passedIds: s ? (JSON.parse(s) as string[]) : [],
      superLikedIds: sl ? (JSON.parse(sl) as string[]) : [],
      extraSlots: es ? (JSON.parse(es) as number) : 0,
      boostedUntil: b ? (JSON.parse(b) as number) : null,
      superLikeBalance:
        slb !== null ? (JSON.parse(slb) as number) : DEFAULT_SUPER_LIKES,
      superLikeLastUseAt: slu ? (JSON.parse(slu) as number) : null,
      subscription: sub ? (JSON.parse(sub) as SubscriptionState) : null,
      readWatermarks: rw
        ? (JSON.parse(rw) as Record<string, Record<string, number>>)
        : {},
      seenMatchIds: sm ? (JSON.parse(sm) as Record<string, string[]>) : {},
    };
  } catch (e) {
    console.log("[local-profile-storage] load error", e);
    return emptyStoredProfileState();
  }
}

export async function resetStoredProfileState() {
  await AsyncStorage.multiRemove(STORED_PROFILE_STATE_KEYS);
}

export async function saveStoredProfile(profile: Profile | null) {
  if (profile) await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  else await AsyncStorage.removeItem(PROFILE_KEY);
  return profile;
}

export async function saveStoredConversations(conversations: Conversation[]) {
  await AsyncStorage.setItem(CONVOS_KEY, JSON.stringify(conversations));
  return conversations;
}

export async function saveStoredLikes(likedIds: string[]) {
  await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(likedIds));
  return likedIds;
}

export async function saveStoredPasses(passedIds: string[]) {
  await AsyncStorage.setItem(PASSES_KEY, JSON.stringify(passedIds));
  return passedIds;
}

export async function saveStoredSuperLikes(superLikedIds: string[]) {
  await AsyncStorage.setItem(SUPERLIKES_KEY, JSON.stringify(superLikedIds));
  return superLikedIds;
}

export async function saveStoredExtraSlots(extraSlots: number) {
  await AsyncStorage.setItem(EXTRA_SLOTS_KEY, JSON.stringify(extraSlots));
  return extraSlots;
}

export async function saveStoredBoost(boostedUntil: number | null) {
  if (boostedUntil === null) await AsyncStorage.removeItem(BOOST_KEY);
  else await AsyncStorage.setItem(BOOST_KEY, JSON.stringify(boostedUntil));
  return boostedUntil;
}

export async function saveStoredSuperLikeBalance(superLikeBalance: number) {
  await AsyncStorage.setItem(
    SUPERLIKE_BALANCE_KEY,
    JSON.stringify(superLikeBalance)
  );
  return superLikeBalance;
}

export async function saveStoredSuperLikeLastUse(lastUseAt: number | null) {
  if (lastUseAt === null) await AsyncStorage.removeItem(SUPERLIKE_LAST_USE_KEY);
  else await AsyncStorage.setItem(SUPERLIKE_LAST_USE_KEY, JSON.stringify(lastUseAt));
  return lastUseAt;
}

export async function saveStoredSubscription(
  subscription: SubscriptionState | null
) {
  if (subscription === null) await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
  else await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
  return subscription;
}

export async function saveStoredReadWatermarks(
  readWatermarks: Record<string, Record<string, number>>
) {
  await AsyncStorage.setItem(
    READ_WATERMARKS_KEY,
    JSON.stringify(readWatermarks)
  );
  return readWatermarks;
}

export async function saveStoredSeenMatchIds(
  seenMatchIds: Record<string, string[]>
) {
  await AsyncStorage.setItem(SEEN_MATCHES_KEY, JSON.stringify(seenMatchIds));
  return seenMatchIds;
}

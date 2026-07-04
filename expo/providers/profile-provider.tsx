import createContextHook from "@nkzw/create-context-hook";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { MOCK_PROFILES } from "@/mocks/profiles";
import {
  fromBackendProfileId,
  isBackendProfileId,
  toBackendProfileId,
} from "@/constants/mock-profile-ids";
import { MVP_MONETIZATION_ENABLED } from "@/constants/features";
import { useAuth } from "@/providers/auth-provider";
import { createAppServices } from "@/services/app-services";
import {
  addUniqueId,
  appendIncomingTextReply,
  appendOutgoingPhotoRequest,
  appendOutgoingTextMessage,
  approvePendingPhoto,
  ensureGreetingConversation,
  makeSimulatedReply,
  markConversationRead,
  removeConversation,
  removeId,
  removeMessage,
  updatePhotoStatus,
} from "@/services/local-interaction-service";
import {
  loadStoredProfileState,
  saveStoredBoost,
  saveStoredConversations,
  saveStoredExtraSlots,
  saveStoredLikes,
  saveStoredPasses,
  saveStoredProfile,
  saveStoredReadWatermarks,
  saveStoredSeenMatchIds,
  saveStoredSubscription,
  saveStoredSuperLikeBalance,
  saveStoredSuperLikeLastUse,
  saveStoredSuperLikes,
} from "@/services/local-profile-storage";
import type { SubscriptionState } from "@/services/local-profile-storage";
import {
  applyLocalPurchase,
  createLocalSubscription,
  isLocalBoostActive,
} from "@/services/local-monetization-service";
import {
  acceptPartnerLink as acceptLocalPartnerLink,
  addPartnerInvite,
  applyProfilePatch,
  removePartnerLink as removeLocalPartnerLink,
  resendPartnerInvite as resendLocalPartnerInvite,
} from "@/services/local-profile-mutation-service";
import {
  clearPendingOnboardingProfile,
  loadPendingOnboardingProfile,
} from "@/services/pending-onboarding-storage";
import {
  Conversation,
  DEFAULT_MATCH_SLOTS,
  DEFAULT_SUPER_LIKES,
  Message,
  Profile,
  PurchaseId,
  SUPER_LIKE_RECHARGE_MS,
  SubscriptionId,
} from "@/types";
import type { ReportReason } from "@/services/safety-service";
import type { SwipeDecision, SwipeResult } from "@/services/swipe-service";

export type { SubscriptionState } from "@/services/local-profile-storage";

function mergeMessages(localMessages: Message[], backendMessages: Message[]) {
  const byId = new Map<string, Message>();
  for (const message of localMessages) {
    byId.set(message.id, message);
  }
  for (const message of backendMessages) {
    byId.set(message.id, message);
  }

  return [...byId.values()].sort((a, b) => a.at - b.at);
}

function mergeBackendConversation(
  conversations: Conversation[],
  profileId: string,
  backendMessages: Message[],
  readThrough = 0
) {
  if (backendMessages.length === 0) return conversations;

  const existing = conversations.find(
    (conversation) => conversation.profileId === profileId
  );

  if (!existing) {
    return [
      {
        id: `c-${profileId}`,
        profileId,
        messages: backendMessages,
        unread: backendMessages.filter(
          (message) => !message.fromMe && message.at > readThrough
        ).length,
      },
      ...conversations,
    ];
  }

  const existingMessageIds = new Set(
    existing.messages.map((message) => message.id)
  );
  const mergedMessages = mergeMessages(existing.messages, backendMessages);
  if (
    mergedMessages.length === existing.messages.length &&
    mergedMessages.every((message, index) => message === existing.messages[index])
  ) {
    return conversations;
  }
  const newlyUnread = backendMessages.filter(
    (message) =>
      !message.fromMe &&
      message.at > readThrough &&
      !existingMessageIds.has(message.id)
  ).length;

  return conversations.map((conversation) =>
    conversation.profileId === profileId
      ? {
          ...conversation,
          messages: mergedMessages,
          unread: conversation.unread + newlyUnread,
        }
      : conversation
  );
}

function sameStringSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const values = new Set(a);
  return b.every((item) => values.has(item));
}

function newestMessageAt(conversations: Conversation[], profileId: string) {
  const conversation = conversations.find((item) => item.profileId === profileId);
  if (!conversation) return 0;
  return conversation.messages.reduce(
    (latest, message) => Math.max(latest, message.at),
    0
  );
}

type MatchActionResult = {
  ok: boolean;
  reason?: "limit" | "superlikes";
  matched?: boolean;
};

const BACKEND_MATCH_REFRESH_INTERVAL_MS = 10_000;

const FALLBACK_BACKEND_PROFILE_PHOTO =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80";

function createFallbackBackendProfile(profileId: string): Profile {
  return {
    id: profileId,
    accountType: "single",
    people: [
      {
        name: "Orchard user",
        age: 18,
        gender: "Other",
        race: "Prefer not to say",
        photo: FALLBACK_BACKEND_PROFILE_PHOTO,
        photos: [FALLBACK_BACKEND_PROFILE_PHOTO],
        interests: [],
      },
    ],
    location: {
      city: "",
      lat: 0,
      lng: 0,
    },
    preferences: [],
    lookingFor: "Solo",
    createdAt: Date.now(),
    socials: {},
  };
}

export const [ProfileProvider, useProfile] = createContextHook(() => {
  const { mode, session, signOut: signOutAuth, userId } = useAuth();
  const appServices = useMemo(() => createAppServices(), []);
  const lastBackendProfileSessionKey = useRef<string | null>(null);
  const lastBackendProfileUserId = useRef<string | null>(null);
  const lastBackendMatchHydrationKey = useRef<string | null>(null);
  const inFlightBackendMatchHydrationKey = useRef<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [knownProfiles, setKnownProfiles] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [newMatchIds, setNewMatchIds] = useState<string[]>([]);
  const [readWatermarks, setReadWatermarks] = useState<
    Record<string, Record<string, number>>
  >({});
  const [seenMatchIds, setSeenMatchIds] = useState<Record<string, string[]>>({});
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [superLikedIds, setSuperLikedIds] = useState<string[]>([]);
  const [extraSlots, setExtraSlots] = useState<number>(0);
  const [boostedUntil, setBoostedUntil] = useState<number | null>(null);
  const [superLikeBalance, setSuperLikeBalance] = useState<number>(
    DEFAULT_SUPER_LIKES
  );
  const [superLikeLastUseAt, setSuperLikeLastUseAt] = useState<number | null>(
    null
  );
  const [subscription, setSubscription] = useState<SubscriptionState | null>(
    null
  );
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [backendProfileHydrated, setBackendProfileHydrated] =
    useState<boolean>(false);

  const loadQuery = useQuery({
    queryKey: ["duet-storage"],
    queryFn: loadStoredProfileState,
  });

  useEffect(() => {
    if (loadQuery.data && !hydrated) {
      setProfile(loadQuery.data.profile);
      setConversations(loadQuery.data.conversations);
      setLikedIds(loadQuery.data.likedIds);
      setPassedIds(loadQuery.data.passedIds);
      setSuperLikedIds(loadQuery.data.superLikedIds);
      setExtraSlots(loadQuery.data.extraSlots);
      setBoostedUntil(loadQuery.data.boostedUntil);
      setSuperLikeBalance(loadQuery.data.superLikeBalance);
      setSuperLikeLastUseAt(loadQuery.data.superLikeLastUseAt);
      setSubscription(loadQuery.data.subscription);
      setReadWatermarks(loadQuery.data.readWatermarks);
      setSeenMatchIds(loadQuery.data.seenMatchIds);
      setHydrated(true);
      console.log("[profile-provider] hydrated", {
        hasProfile: !!loadQuery.data.profile,
        convos: loadQuery.data.conversations.length,
        extraSlots: loadQuery.data.extraSlots,
        boostedUntil: loadQuery.data.boostedUntil,
      });
    }
  }, [loadQuery.data, hydrated]);

  const saveProfileMutation = useMutation({
    mutationFn: saveStoredProfile,
  });

  const saveConvosMutation = useMutation({
    mutationFn: saveStoredConversations,
  });

  const saveLikesMutation = useMutation({
    mutationFn: saveStoredLikes,
  });

  const savePassesMutation = useMutation({
    mutationFn: saveStoredPasses,
  });

  const saveSuperLikesMutation = useMutation({
    mutationFn: saveStoredSuperLikes,
  });

  const saveExtraSlotsMutation = useMutation({
    mutationFn: saveStoredExtraSlots,
  });

  const saveBoostMutation = useMutation({
    mutationFn: saveStoredBoost,
  });

  const saveSuperLikeBalanceMutation = useMutation({
    mutationFn: saveStoredSuperLikeBalance,
  });

  const saveSuperLikeLastUseMutation = useMutation({
    mutationFn: saveStoredSuperLikeLastUse,
  });

  const saveSubscriptionMutation = useMutation({
    mutationFn: saveStoredSubscription,
  });

  const saveReadWatermarksMutation = useMutation({
    mutationFn: saveStoredReadWatermarks,
  });

  const saveSeenMatchIdsMutation = useMutation({
    mutationFn: saveStoredSeenMatchIds,
  });

  useEffect(() => {
    if (mode !== "supabase") {
      lastBackendProfileSessionKey.current = null;
      lastBackendProfileUserId.current = null;
      lastBackendMatchHydrationKey.current = null;
      inFlightBackendMatchHydrationKey.current = null;
      setBackendProfileHydrated(false);
      return;
    }

    if (!userId) {
      lastBackendProfileSessionKey.current = null;
      lastBackendProfileUserId.current = null;
      lastBackendMatchHydrationKey.current = null;
      inFlightBackendMatchHydrationKey.current = null;
      setBackendProfileHydrated(false);
      return;
    }

    const sessionKey = session?.access_token ?? null;
    if (
      lastBackendProfileUserId.current === userId &&
      lastBackendProfileSessionKey.current === sessionKey
    ) {
      return;
    }

    lastBackendProfileSessionKey.current = sessionKey;
    lastBackendProfileUserId.current = userId;
    setBackendProfileHydrated(false);
  }, [mode, session?.access_token, userId]);

  useEffect(() => {
    if (mode !== "supabase") return;
    if (!hydrated || !userId) return;
    if (!profile || profile.id === userId) return;

    console.log("[profile-provider] clearing profile for signed-in user", {
      localProfileId: profile.id,
      userId,
    });
    setProfile(null);
    saveProfileMutation.mutate(null);
    setBackendProfileHydrated(false);
  }, [hydrated, mode, profile, saveProfileMutation, userId]);

  useEffect(() => {
    if (mode !== "supabase") return;
    if (appServices.capabilities.profiles !== "supabase") return;
    if (!hydrated || backendProfileHydrated || !userId || profile) return;

    let cancelled = false;
    void appServices.profiles.getCurrentProfile().then(async (result) => {
      if (cancelled) return;

      if (!result.ok) {
        console.log("[profile-provider] backend profile load failed", {
          code: result.error.code,
          message: result.error.message,
        });
        setBackendProfileHydrated(true);
        return;
      }

      if (!result.value) {
        const pendingProfile = await loadPendingOnboardingProfile(
          userId,
          session?.user.email
        );
        if (cancelled) return;
        if (!pendingProfile) {
          setBackendProfileHydrated(true);
          return;
        }

        const pendingResult = await appServices.profiles.completeOnboarding({
          profile: pendingProfile,
        });
        if (cancelled) return;

        if (!pendingResult.ok) {
          console.log("[profile-provider] pending profile save failed", {
            code: pendingResult.error.code,
            message: pendingResult.error.message,
          });
          setBackendProfileHydrated(true);
          return;
        }

        await clearPendingOnboardingProfile();
        if (cancelled) return;
        setProfile(pendingResult.value);
        saveProfileMutation.mutate(pendingResult.value);
        setBackendProfileHydrated(true);
        return;
      }

      setProfile(result.value);
      saveProfileMutation.mutate(result.value);
      setBackendProfileHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [
    appServices,
    backendProfileHydrated,
    hydrated,
    mode,
    profile,
    saveProfileMutation,
    session?.user.email,
    userId,
  ]);

  const rememberProfiles = useCallback((profilesToRemember: Profile[]) => {
    if (profilesToRemember.length === 0) return;

    setKnownProfiles((prev) => {
      const byId = new Map(prev.map((item) => [item.id, item]));
      let changed = false;

      for (const item of profilesToRemember) {
        if (byId.get(item.id) === item) continue;
        byId.set(item.id, item);
        changed = true;
      }

      return changed ? [...byId.values()] : prev;
    });
  }, []);

  const refreshBackendMatches = useCallback(async () => {
    if (mode !== "supabase") return;
    if (appServices.capabilities.matches !== "supabase") return;
    if (appServices.capabilities.chat !== "supabase") return;
    if (!hydrated || !backendProfileHydrated) return;
    if (!profile || !userId || profile.id !== userId) return;

    const sessionKey = session?.access_token ?? "";
    const hydrationKey = `${userId}:${sessionKey}`;
    if (inFlightBackendMatchHydrationKey.current === hydrationKey) return;
    inFlightBackendMatchHydrationKey.current = hydrationKey;

    try {
      const matchResult = await appServices.matches.listMatches(userId);

      if (!matchResult.ok) {
        console.log("[profile-provider] backend match hydration failed", {
          code: matchResult.error.code,
          message: matchResult.error.message,
        });
        return;
      }

      const matchedLocalProfileIds = new Set<string>();
      const backendConversations: {
        profileId: string;
        messages: Message[];
        isFixture: boolean;
      }[] = [];
      const matchedProfilesToRemember: Profile[] = [];
      const currentSeenMatchIds = new Set(seenMatchIds[userId] ?? []);
      const nextNewMatchIds = new Set<string>();

      for (const match of matchResult.value) {
        const otherBackendProfileId =
          match.userA === userId ? match.userB : match.userA;
        const otherLocalProfileId = fromBackendProfileId(otherBackendProfileId);
        const mockProfile = MOCK_PROFILES.find(
          (item) => item.id === otherLocalProfileId
        );
        const otherProfile =
          mockProfile ??
          match.otherProfile ??
          createFallbackBackendProfile(otherLocalProfileId);

        matchedLocalProfileIds.add(otherProfile.id);
        if (!currentSeenMatchIds.has(otherProfile.id)) {
          nextNewMatchIds.add(otherProfile.id);
        }
        if (!mockProfile) {
          matchedProfilesToRemember.push(otherProfile);
        }

        const threadResult = await appServices.chat.getThread(match.id);
        if (!threadResult.ok) {
          console.log("[profile-provider] backend thread hydration failed", {
            code: threadResult.error.code,
            message: threadResult.error.message,
            matchId: match.id,
            profileId: otherLocalProfileId,
          });
          continue;
        }

        backendConversations.push({
          profileId: otherProfile.id,
          messages: threadResult.value.messages,
          isFixture: !!mockProfile,
        });
      }

      rememberProfiles(matchedProfilesToRemember);

      setLikedIds((prev) => {
        const next = [...matchedLocalProfileIds];
        if (sameStringSet(prev, next)) return prev;
        saveLikesMutation.mutate(next);
        return next;
      });

      setNewMatchIds((prev) => {
        const next = [...nextNewMatchIds];
        if (sameStringSet(prev, next)) return prev;
        return next;
      });

      setConversations((prev) => {
        const filtered = prev.filter((conversation) =>
          matchedLocalProfileIds.has(conversation.profileId)
        );
        let next = filtered.length === prev.length ? prev : filtered;
        for (const backendConversation of backendConversations) {
          const readThrough =
            readWatermarks[userId]?.[backendConversation.profileId] ?? 0;
          next = mergeBackendConversation(
            next,
            backendConversation.profileId,
            backendConversation.messages,
            readThrough
          );
          if (backendConversation.isFixture) {
            const other =
              MOCK_PROFILES.find(
                (item) => item.id === backendConversation.profileId
              ) ?? undefined;
            next = ensureGreetingConversation(next, other, "like");
          }
        }
        if (next === prev) return prev;
        saveConvosMutation.mutate(next);
        return next;
      });
      lastBackendMatchHydrationKey.current = hydrationKey;
    } finally {
      if (inFlightBackendMatchHydrationKey.current === hydrationKey) {
        inFlightBackendMatchHydrationKey.current = null;
      }
    }
  }, [
    appServices,
    backendProfileHydrated,
    hydrated,
    mode,
    profile,
    readWatermarks,
    rememberProfiles,
    saveConvosMutation,
    saveLikesMutation,
    seenMatchIds,
    session?.access_token,
    userId,
  ]);

  useEffect(() => {
    void refreshBackendMatches();
  }, [refreshBackendMatches]);

  useEffect(() => {
    if (mode !== "supabase") return;
    if (!hydrated || !backendProfileHydrated) return;
    if (!profile || !userId || profile.id !== userId) return;

    const intervalId = setInterval(() => {
      void refreshBackendMatches();
    }, BACKEND_MATCH_REFRESH_INTERVAL_MS);

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshBackendMatches();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [
    backendProfileHydrated,
    hydrated,
    mode,
    profile,
    refreshBackendMatches,
    userId,
  ]);

  const completeOnboarding = useCallback(
    async (p: Profile): Promise<{ ok: boolean; error?: string }> => {
      let profileToStore = p;

      if (mode === "supabase" && appServices.capabilities.profiles === "supabase") {
        const result = await appServices.profiles.completeOnboarding({
          profile: p,
        });

        if (!result.ok) {
          return { ok: false, error: result.error.message };
        }

        profileToStore = result.value;
      }

      console.log("[profile-provider] completeOnboarding", profileToStore.id);
      setProfile(profileToStore);
      saveProfileMutation.mutate(profileToStore);
      setBackendProfileHydrated(true);
      return { ok: true };
    },
    [appServices, mode, saveProfileMutation]
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      setProfile((prev) => {
        const next = applyProfilePatch(prev, patch);
        if (!next) return prev;
        if (
          mode === "supabase" &&
          appServices.capabilities.profiles === "supabase"
        ) {
          void appServices.profiles
            .updateProfile({ profileId: next.id, patch })
            .then((result) => {
              if (!result.ok) {
                console.log("[profile-provider] backend profile update failed", {
                  code: result.error.code,
                  message: result.error.message,
                });
              }
            });
        }
        saveProfileMutation.mutate(next);
        return next;
      });
    },
    [appServices, mode, saveProfileMutation]
  );

  const signOut = useCallback(async () => {
    let result: Awaited<ReturnType<typeof signOutAuth>> | undefined;
    if (mode === "supabase") {
      result = await signOutAuth();
    }
    setProfile(null);
    setKnownProfiles([]);
    setConversations([]);
    setLikedIds([]);
    setNewMatchIds([]);
    setPassedIds([]);
    setSuperLikedIds([]);
    setExtraSlots(0);
    setBoostedUntil(null);
    setSuperLikeBalance(DEFAULT_SUPER_LIKES);
    setSuperLikeLastUseAt(null);
    setSubscription(null);
    setBackendProfileHydrated(false);
    lastBackendMatchHydrationKey.current = null;
    inFlightBackendMatchHydrationKey.current = null;
    saveProfileMutation.mutate(null);
    saveConvosMutation.mutate([]);
    saveLikesMutation.mutate([]);
    savePassesMutation.mutate([]);
    saveSuperLikesMutation.mutate([]);
    saveExtraSlotsMutation.mutate(0);
    saveBoostMutation.mutate(null);
    saveSuperLikeBalanceMutation.mutate(DEFAULT_SUPER_LIKES);
    saveSuperLikeLastUseMutation.mutate(null);
    saveSubscriptionMutation.mutate(null);
    return result ?? { ok: true as const };
  }, [
    mode,
    signOutAuth,
    saveProfileMutation,
    saveConvosMutation,
    saveLikesMutation,
    savePassesMutation,
    saveSuperLikesMutation,
    saveExtraSlotsMutation,
    saveBoostMutation,
    saveSuperLikeBalanceMutation,
    saveSuperLikeLastUseMutation,
    saveSubscriptionMutation,
  ]);

  const totalSlots = MVP_MONETIZATION_ENABLED
    ? DEFAULT_MATCH_SLOTS + extraSlots
    : Number.MAX_SAFE_INTEGER;
  const slotsUsed = likedIds.length;
  const slotsRemaining = Math.max(0, totalSlots - slotsUsed);
  const isAtMatchLimit = slotsRemaining <= 0;

  const recordBackendSwipe = useCallback(
    async (
      targetId: string,
      decision: SwipeDecision
    ): Promise<SwipeResult | null> => {
      if (mode !== "supabase") return null;
      if (appServices.capabilities.swipes !== "supabase") return null;
      if (!profile || !userId || profile.id !== userId) return null;

      const result = await appServices.swipes.recordSwipe({
        swiperId: userId,
        targetId,
        decision,
      });

      if (!result.ok) {
        console.log("[profile-provider] backend swipe failed", {
          code: result.error.code,
          message: result.error.message,
        });
        return null;
      }

      return result.value;
    },
    [appServices, mode, profile, userId]
  );

  const activateLocalMatch = useCallback(
    (id: string, kind: "like" | "super_like") => {
      setNewMatchIds((prev) => addUniqueId(prev, id));

      setLikedIds((prev) => {
        const next = addUniqueId(prev, id);
        if (next === prev) return prev;
        saveLikesMutation.mutate(next);
        return next;
      });

      setConversations((prev) => {
        const other = MOCK_PROFILES.find((p) => p.id === id);
        const next = ensureGreetingConversation(prev, other, kind);
        if (next === prev) return prev;
        saveConvosMutation.mutate(next);
        return next;
      });
    },
    [saveConvosMutation, saveLikesMutation]
  );

  const markMatchSeen = useCallback((profileId: string) => {
    setNewMatchIds((prev) => removeId(prev, profileId));
    if (!profile?.id) return;
    setSeenMatchIds((prev) => {
      const ownerSeen = prev[profile.id] ?? [];
      const nextOwnerSeen = addUniqueId(ownerSeen, profileId);
      if (nextOwnerSeen === ownerSeen) return prev;
      const next = { ...prev, [profile.id]: nextOwnerSeen };
      saveSeenMatchIdsMutation.mutate(next);
      return next;
    });
  }, [profile?.id, saveSeenMatchIdsMutation]);

  const persistBackendChatMessage = useCallback(
    (targetId: string, text: string) => {
      if (mode !== "supabase") return;
      if (appServices.capabilities.chat !== "supabase") return;
      if (appServices.capabilities.matches !== "supabase") return;
      if (!profile || !userId || profile.id !== userId) return;

      const targetProfileId = toBackendProfileId(targetId);
      if (!isBackendProfileId(targetProfileId)) return;

      void appServices.matches
        .listMatches(userId)
        .then(async (matchResult) => {
          if (!matchResult.ok) {
            console.log("[profile-provider] backend match lookup failed", {
              code: matchResult.error.code,
              message: matchResult.error.message,
            });
            return;
          }

          const match = matchResult.value.find(
            (item) =>
              (item.userA === userId && item.userB === targetProfileId) ||
              (item.userA === targetProfileId && item.userB === userId)
          );

          let matchId = match?.id;
          if (!matchId && appServices.capabilities.swipes === "supabase") {
            const swipeResult = await appServices.swipes.recordSwipe({
              swiperId: userId,
              targetId,
              decision: "like",
            });

            if (!swipeResult.ok) {
              console.log("[profile-provider] backend chat match repair failed", {
                code: swipeResult.error.code,
                message: swipeResult.error.message,
                targetProfileId,
              });
            } else {
              matchId = swipeResult.value.matchId;
            }
          }

      if (!matchId) {
        console.log("[profile-provider] backend chat match not found", {
          targetProfileId,
        });
        setLikedIds((prev) => {
          const next = removeId(prev, targetId);
          if (next === prev) return prev;
          saveLikesMutation.mutate(next);
          return next;
        });
        setConversations((prev) => {
          const next = removeConversation(prev, targetId);
          if (next === prev) return prev;
          saveConvosMutation.mutate(next);
          return next;
        });
        return;
      }

          const result = await appServices.chat.sendMessage({
            matchId,
            senderId: userId,
            body: text,
          });

          if (!result.ok) {
            console.log("[profile-provider] backend message send failed", {
              code: result.error.code,
              message: result.error.message,
            });
            return;
          }

          setConversations((prev) => {
            const next = mergeBackendConversation(prev, targetId, [result.value]);
            if (next === prev) return prev;
            saveConvosMutation.mutate(next);
            return next;
          });
        });
    },
    [appServices, mode, profile, saveConvosMutation, userId]
  );

  const likeProfile = useCallback(
    async (id: string): Promise<MatchActionResult> => {
      if (likedIds.includes(id)) return { ok: true, matched: true };
      if (slotsUsed >= totalSlots) {
        console.log("[profile-provider] like blocked: match limit");
        return { ok: false, reason: "limit" };
      }

      if (mode === "supabase" && appServices.capabilities.swipes === "supabase") {
        if (!isBackendProfileId(id)) {
          activateLocalMatch(id, "like");
          return { ok: true, matched: true };
        }
        const swipe = await recordBackendSwipe(id, "like");
        if (!swipe?.matched) return { ok: true, matched: false };
        activateLocalMatch(id, "like");
        return { ok: true, matched: true };
      }

      activateLocalMatch(id, "like");
      return { ok: true, matched: true };
    },
    [
      activateLocalMatch,
      appServices.capabilities.swipes,
      likedIds,
      mode,
      recordBackendSwipe,
      slotsUsed,
      totalSlots,
    ]
  );

  const unmatch = useCallback(
    (id: string) => {
      setLikedIds((prev) => {
        const next = removeId(prev, id);
        saveLikesMutation.mutate(next);
        return next;
      });
      setConversations((prev) => {
        const next = removeConversation(prev, id);
        saveConvosMutation.mutate(next);
        return next;
      });

      if (
        mode === "supabase" &&
        appServices.capabilities.matches === "supabase" &&
        profile &&
        userId &&
        profile.id === userId
      ) {
        const targetProfileId = toBackendProfileId(id);
        if (isBackendProfileId(targetProfileId)) {
          void appServices.matches.listMatches(userId).then(async (matchResult) => {
            if (!matchResult.ok) {
              console.log("[profile-provider] backend unmatch lookup failed", {
                code: matchResult.error.code,
                message: matchResult.error.message,
                targetProfileId,
              });
              return;
            }

            const match = matchResult.value.find(
              (item) =>
                (item.userA === userId && item.userB === targetProfileId) ||
                (item.userA === targetProfileId && item.userB === userId)
            );

            if (!match) return;

            const result = await appServices.matches.unmatch(match.id, userId);
            if (!result.ok) {
              console.log("[profile-provider] backend unmatch failed", {
                code: result.error.code,
                message: result.error.message,
                targetProfileId,
              });
            }
          });
        }
      }
    },
    [appServices, mode, profile, saveLikesMutation, saveConvosMutation, userId]
  );

  const reportProfile = useCallback(
    async (
      reportedProfileId: string,
      reason: ReportReason = "other",
      details?: string,
      reportedMessageId?: string
    ): Promise<{ ok: boolean; error?: string }> => {
      if (!profile) {
        return { ok: false, error: "Create a profile before reporting." };
      }

      const result = await appServices.safety.reportUser({
        reporterId: profile.id,
        reportedUserId: reportedProfileId,
        reportedMessageId,
        reason,
        details,
      });

      if (!result.ok) {
        return { ok: false, error: result.error.message };
      }

      return { ok: true };
    },
    [appServices, profile]
  );

  const blockProfile = useCallback(
    async (blockedProfileId: string): Promise<{ ok: boolean; error?: string }> => {
      if (!profile) {
        return { ok: false, error: "Create a profile before blocking." };
      }

      const result = await appServices.safety.blockUser({
        blockerId: profile.id,
        blockedId: blockedProfileId,
      });

      if (!result.ok) {
        return { ok: false, error: result.error.message };
      }

      setLikedIds((prev) => {
        const next = removeId(prev, blockedProfileId);
        saveLikesMutation.mutate(next);
        return next;
      });
      setPassedIds((prev) => {
        const next = addUniqueId(prev, blockedProfileId);
        savePassesMutation.mutate(next);
        return next;
      });
      setConversations((prev) => {
        const next = removeConversation(prev, blockedProfileId);
        saveConvosMutation.mutate(next);
        return next;
      });

      return { ok: true };
    },
    [
      appServices,
      profile,
      saveConvosMutation,
      saveLikesMutation,
      savePassesMutation,
    ]
  );

  const requestAccountDeletion = useCallback(
    async (reason?: string): Promise<{ ok: boolean; error?: string }> => {
      if (!profile) {
        return { ok: false, error: "No profile is signed in." };
      }

      const result = await appServices.safety.requestAccountDeletion({
        profileId: profile.id,
        reason,
      });

      if (!result.ok) {
        return { ok: false, error: result.error.message };
      }

      signOut();
      return { ok: true };
    },
    [appServices, profile, signOut]
  );

  const superLikeProfile = useCallback(
    async (id: string): Promise<MatchActionResult> => {
      if (superLikedIds.includes(id) && likedIds.includes(id)) {
        return { ok: true, matched: true };
      }
      if (
        MVP_MONETIZATION_ENABLED &&
        !likedIds.includes(id) &&
        slotsUsed >= totalSlots
      ) {
        console.log("[profile-provider] superLike blocked: match limit");
        return { ok: false, reason: "limit" };
      }
      if (MVP_MONETIZATION_ENABLED && superLikeBalance <= 0) {
        console.log("[profile-provider] superLike blocked: no balance");
        return { ok: false, reason: "superlikes" };
      }

      if (MVP_MONETIZATION_ENABLED) {
        const nextBalance = superLikeBalance - 1;
        setSuperLikeBalance(nextBalance);
        saveSuperLikeBalanceMutation.mutate(nextBalance);
        const now = Date.now();
        setSuperLikeLastUseAt(now);
        saveSuperLikeLastUseMutation.mutate(now);
      }

      setSuperLikedIds((prev) => {
        const next = addUniqueId(prev, id);
        if (next === prev) return prev;
        saveSuperLikesMutation.mutate(next);
        return next;
      });

      if (mode === "supabase" && appServices.capabilities.swipes === "supabase") {
        if (!isBackendProfileId(id)) {
          activateLocalMatch(id, "super_like");
          return { ok: true, matched: true };
        }
        const swipe = await recordBackendSwipe(id, "super_like");
        if (!swipe?.matched) return { ok: true, matched: false };
        activateLocalMatch(id, "super_like");
        return { ok: true, matched: true };
      }

      activateLocalMatch(id, "super_like");
      return { ok: true, matched: true };
    },
    [
      activateLocalMatch,
      appServices.capabilities.swipes,
      superLikedIds,
      likedIds,
      mode,
      recordBackendSwipe,
      slotsUsed,
      totalSlots,
      superLikeBalance,
      saveSuperLikesMutation,
      saveSuperLikeBalanceMutation,
      saveSuperLikeLastUseMutation,
    ]
  );

  const passProfile = useCallback(
    (id: string) => {
      setPassedIds((prev) => {
        const next = addUniqueId(prev, id);
        if (next === prev) return prev;
        savePassesMutation.mutate(next);
        return next;
      });
      void recordBackendSwipe(id, "pass");
    },
    [savePassesMutation, recordBackendSwipe]
  );

  const sendMessage = useCallback(
    (profileId: string, text: string, authorName?: string) => {
      if (!likedIds.includes(profileId)) {
        console.log("[profile-provider] sendMessage blocked: no active match", {
          profileId,
        });
        return;
      }
      const localMockProfile = MOCK_PROFILES.find((p) => p.id === profileId);
      if (mode === "supabase" && isBackendProfileId(profileId) && !localMockProfile) {
        persistBackendChatMessage(profileId, text);
        return;
      }
      console.log("[profile-provider] sendMessage", { profileId, length: text.length });
      setConversations((prev) => {
        const exists = prev.find((c) => c.profileId === profileId);
        if (!exists) {
          console.log(
            "[profile-provider] sendMessage: creating missing convo",
            profileId
          );
        }
        const next = appendOutgoingTextMessage(prev, profileId, text, authorName);
        saveConvosMutation.mutate(next);
        return next;
      });

      persistBackendChatMessage(profileId, text);

      if (!localMockProfile) return;
      const reply = makeSimulatedReply(localMockProfile);
      const delay = 1800 + Math.floor(Math.random() * 2500);
      setTimeout(() => {
        setConversations((prev) => {
          const next = appendIncomingTextReply(prev, profileId, localMockProfile, reply);
          saveConvosMutation.mutate(next);
          return next;
        });
      }, delay);
    },
    [likedIds, mode, saveConvosMutation, persistBackendChatMessage]
  );

  const deleteMessage = useCallback(
    (profileId: string, messageId: string) => {
      console.log("[profile-provider] deleteMessage", { profileId, messageId });
      setConversations((prev) => {
        const next = removeMessage(prev, profileId, messageId);
        saveConvosMutation.mutate(next);
        return next;
      });
    },
    [saveConvosMutation]
  );

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [typingProfileIds, setTypingProfileIds] = useState<string[]>([]);

  const setDraft = useCallback((profileId: string, text: string) => {
    setDrafts((prev) => {
      if ((prev[profileId] ?? "") === text) return prev;
      return { ...prev, [profileId]: text };
    });
  }, []);

  const sendPhoto = useCallback(
    (profileId: string, photoUri: string, authorName?: string) => {
      if (!likedIds.includes(profileId)) {
        console.log("[profile-provider] sendPhoto blocked: no active match", {
          profileId,
        });
        return;
      }
      const msgId = `m-${Date.now()}`;
      setConversations((prev) => {
        const next = appendOutgoingPhotoRequest(
          prev,
          profileId,
          photoUri,
          msgId,
          authorName
        );
        saveConvosMutation.mutate(next);
        return next;
      });

      const delay = 2500 + Math.floor(Math.random() * 3500);
      setTimeout(() => {
        console.log("[profile-provider] simulated photo approval", msgId);
        setConversations((prev) => {
          const next = approvePendingPhoto(prev, profileId, msgId);
          saveConvosMutation.mutate(next);
          return next;
        });
      }, delay);
    },
    [likedIds, saveConvosMutation]
  );

  const respondToPhoto = useCallback(
    (profileId: string, messageId: string, decision: "approved" | "declined") => {
      setConversations((prev) => {
        const next = updatePhotoStatus(prev, profileId, messageId, decision);
        saveConvosMutation.mutate(next);
        return next;
      });
    },
    [saveConvosMutation]
  );

  const markRead = useCallback(
    (profileId: string) => {
      if (profile?.id) {
        const readThrough = newestMessageAt(conversations, profileId);
        if (readThrough > 0) {
          setReadWatermarks((prev) => {
            const ownerWatermarks = prev[profile.id] ?? {};
            if ((ownerWatermarks[profileId] ?? 0) >= readThrough) return prev;
            const next = {
              ...prev,
              [profile.id]: {
                ...ownerWatermarks,
                [profileId]: readThrough,
              },
            };
            saveReadWatermarksMutation.mutate(next);
            return next;
          });
        }
      }
      setConversations((prev) => {
        const next = markConversationRead(prev, profileId);
        if (next === prev) return prev;
        saveConvosMutation.mutate(next);
        return next;
      });
    },
    [conversations, profile?.id, saveConvosMutation, saveReadWatermarksMutation]
  );

  const purchase = useCallback(
    (id: PurchaseId) => {
      console.log("[profile-provider] purchase", id);
      const result = applyLocalPurchase(id, superLikeBalance);

      if (typeof result.extraSlotsDelta === "number") {
        const delta = result.extraSlotsDelta;
        setExtraSlots((v) => {
          const n = v + delta;
          saveExtraSlotsMutation.mutate(n);
          return n;
        });
      }
      if (typeof result.boostedUntil === "number") {
        setBoostedUntil(result.boostedUntil);
        saveBoostMutation.mutate(result.boostedUntil);
      }
      if (typeof result.superLikeBalance === "number") {
        setSuperLikeBalance(result.superLikeBalance);
        saveSuperLikeBalanceMutation.mutate(result.superLikeBalance);
      }
      if (typeof result.superLikeBalanceDelta === "number") {
        const delta = result.superLikeBalanceDelta;
        setSuperLikeBalance((v) => {
          const n = v + delta;
          saveSuperLikeBalanceMutation.mutate(n);
          return n;
        });
      }
      if ("superLikeLastUseAt" in result) {
        setSuperLikeLastUseAt(result.superLikeLastUseAt ?? null);
        saveSuperLikeLastUseMutation.mutate(result.superLikeLastUseAt ?? null);
      }
    },
    [
      superLikeBalance,
      saveExtraSlotsMutation,
      saveBoostMutation,
      saveSuperLikeBalanceMutation,
      saveSuperLikeLastUseMutation,
    ]
  );

  const subscribe = useCallback(
    (id: SubscriptionId) => {
      console.log("[profile-provider] subscribe", id);
      const result = createLocalSubscription(id);
      if (!result) return;
      setSubscription(result.subscription);
      saveSubscriptionMutation.mutate(result.subscription);

      setExtraSlots((v) => {
        const n = v + result.extraSlotsDelta;
        saveExtraSlotsMutation.mutate(n);
        return n;
      });
      setSuperLikeBalance((v) => {
        const n = v + result.superLikeBalanceDelta;
        saveSuperLikeBalanceMutation.mutate(n);
        return n;
      });
      if (typeof result.boostedUntil === "number") {
        setBoostedUntil(result.boostedUntil);
        saveBoostMutation.mutate(result.boostedUntil);
      }
    },
    [
      saveSubscriptionMutation,
      saveExtraSlotsMutation,
      saveSuperLikeBalanceMutation,
      saveBoostMutation,
    ]
  );

  const cancelSubscription = useCallback(() => {
    console.log("[profile-provider] cancel subscription");
    setSubscription(null);
    saveSubscriptionMutation.mutate(null);
  }, [saveSubscriptionMutation]);

  const invitePartner = useCallback(
    (email: string, displayName?: string) => {
      setProfile((prev) => {
        const next = addPartnerInvite(prev, email, displayName);
        if (!next) return prev;
        saveProfileMutation.mutate(next);
        return next;
      });
    },
    [saveProfileMutation]
  );

  const resendPartnerInvite = useCallback(
    (partnerId: string) => {
      setProfile((prev) => {
        const next = resendLocalPartnerInvite(prev, partnerId);
        if (!next) return prev;
        saveProfileMutation.mutate(next);
        return next;
      });
    },
    [saveProfileMutation]
  );

  const acceptPartnerLink = useCallback(
    (partnerId: string) => {
      setProfile((prev) => {
        const next = acceptLocalPartnerLink(prev, partnerId);
        if (!next) return prev;
        saveProfileMutation.mutate(next);
        return next;
      });
    },
    [saveProfileMutation]
  );

  const removePartnerLink = useCallback(
    (partnerId: string) => {
      setProfile((prev) => {
        const next = removeLocalPartnerLink(prev, partnerId);
        if (!next) return prev;
        saveProfileMutation.mutate(next);
        return next;
      });
    },
    [saveProfileMutation]
  );

  const isBoosted = useMemo(() => {
    return isLocalBoostActive(boostedUntil);
  }, [boostedUntil]);

  const superLikeRechargeAt = useMemo(() => {
    if (superLikeBalance >= DEFAULT_SUPER_LIKES) return null;
    if (!superLikeLastUseAt) return null;
    return superLikeLastUseAt + SUPER_LIKE_RECHARGE_MS;
  }, [superLikeBalance, superLikeLastUseAt]);

  useEffect(() => {
    if (!hydrated) return;
    if (superLikeBalance >= DEFAULT_SUPER_LIKES) return;
    if (!superLikeLastUseAt) return;
    const due = superLikeLastUseAt + SUPER_LIKE_RECHARGE_MS;
    if (Date.now() >= due) {
      console.log("[profile-provider] super like auto-recharge");
      setSuperLikeBalance(DEFAULT_SUPER_LIKES);
      saveSuperLikeBalanceMutation.mutate(DEFAULT_SUPER_LIKES);
      setSuperLikeLastUseAt(null);
      saveSuperLikeLastUseMutation.mutate(null);
    }
  }, [
    hydrated,
    superLikeBalance,
    superLikeLastUseAt,
    saveSuperLikeBalanceMutation,
    saveSuperLikeLastUseMutation,
  ]);

  return useMemo(
    () => ({
      profile,
      knownProfiles,
      conversations,
      likedIds,
      newMatchIds,
      passedIds,
      hydrated,
      backendProfileHydrated,
      isLoading: loadQuery.isLoading,
      totalSlots,
      slotsUsed,
      slotsRemaining,
      isAtMatchLimit,
      extraSlots,
      boostedUntil,
      isBoosted,
      superLikedIds,
      superLikeBalance,
      superLikeLastUseAt,
      superLikeRechargeAt,
      subscription,
      completeOnboarding,
      rememberProfiles,
      markMatchSeen,
      updateProfile,
      signOut,
      likeProfile,
      superLikeProfile,
      unmatch,
      reportProfile,
      blockProfile,
      requestAccountDeletion,
      passProfile,
      sendMessage,
      deleteMessage,
      sendPhoto,
      respondToPhoto,
      markRead,
      drafts,
      setDraft,
      typingProfileIds,
      purchase,
      subscribe,
      cancelSubscription,
      invitePartner,
      resendPartnerInvite,
      acceptPartnerLink,
      removePartnerLink,
    }),
    [
      profile,
      knownProfiles,
      conversations,
      likedIds,
      newMatchIds,
      passedIds,
      hydrated,
      backendProfileHydrated,
      loadQuery.isLoading,
      totalSlots,
      slotsUsed,
      slotsRemaining,
      isAtMatchLimit,
      extraSlots,
      boostedUntil,
      isBoosted,
      superLikedIds,
      superLikeBalance,
      superLikeLastUseAt,
      superLikeRechargeAt,
      subscription,
      completeOnboarding,
      rememberProfiles,
      markMatchSeen,
      updateProfile,
      signOut,
      likeProfile,
      superLikeProfile,
      unmatch,
      reportProfile,
      blockProfile,
      requestAccountDeletion,
      passProfile,
      sendMessage,
      deleteMessage,
      sendPhoto,
      respondToPhoto,
      markRead,
      drafts,
      setDraft,
      typingProfileIds,
      purchase,
      subscribe,
      cancelSubscription,
      invitePartner,
      resendPartnerInvite,
      acceptPartnerLink,
      removePartnerLink,
    ]
  );
});

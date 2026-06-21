import createContextHook from "@nkzw/create-context-hook";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MOCK_PROFILES } from "@/mocks/profiles";
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
  Profile,
  PurchaseId,
  SUPER_LIKE_RECHARGE_MS,
  SubscriptionId,
} from "@/types";
import type { ReportReason } from "@/services/safety-service";

export type { SubscriptionState } from "@/services/local-profile-storage";

export const [ProfileProvider, useProfile] = createContextHook(() => {
  const { mode, session, signOut: signOutAuth, userId } = useAuth();
  const appServices = useMemo(() => createAppServices(), []);
  const lastBackendProfileSessionKey = useRef<string | null>(null);
  const lastBackendProfileUserId = useRef<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
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

  useEffect(() => {
    if (mode !== "supabase") {
      lastBackendProfileSessionKey.current = null;
      lastBackendProfileUserId.current = null;
      setBackendProfileHydrated(false);
      return;
    }

    if (!userId) {
      lastBackendProfileSessionKey.current = null;
      lastBackendProfileUserId.current = null;
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

  const signOut = useCallback(() => {
    if (mode === "supabase") {
      void signOutAuth();
    }
    setProfile(null);
    setConversations([]);
    setLikedIds([]);
    setPassedIds([]);
    setSuperLikedIds([]);
    setExtraSlots(0);
    setBoostedUntil(null);
    setSuperLikeBalance(DEFAULT_SUPER_LIKES);
    setSuperLikeLastUseAt(null);
    setSubscription(null);
    setBackendProfileHydrated(false);
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

  const persistBackendSwipe = useCallback(
    (targetId: string, decision: "like" | "pass" | "super_like") => {
      if (mode !== "supabase") return;
      if (appServices.capabilities.swipes !== "supabase") return;
      if (!profile || !userId || profile.id !== userId) return;

      void appServices.swipes
        .recordSwipe({
          swiperId: userId,
          targetId,
          decision,
        })
        .then((result) => {
          if (!result.ok) {
            console.log("[profile-provider] backend swipe failed", {
              code: result.error.code,
              message: result.error.message,
            });
          }
        });
    },
    [appServices, mode, profile, userId]
  );

  const likeProfile = useCallback(
    (id: string): { ok: boolean; reason?: "limit" } => {
      if (likedIds.includes(id)) return { ok: true };
      if (slotsUsed >= totalSlots) {
        console.log("[profile-provider] like blocked: match limit");
        return { ok: false, reason: "limit" };
      }

      setLikedIds((prev) => {
        const next = addUniqueId(prev, id);
        if (next === prev) return prev;
        saveLikesMutation.mutate(next);
        return next;
      });

      setConversations((prev) => {
        const other = MOCK_PROFILES.find((p) => p.id === id);
        const next = ensureGreetingConversation(prev, other, "like");
        if (next === prev) return prev;
        saveConvosMutation.mutate(next);
        return next;
      });

      persistBackendSwipe(id, "like");

      return { ok: true };
    },
    [
      likedIds,
      slotsUsed,
      totalSlots,
      saveLikesMutation,
      saveConvosMutation,
      persistBackendSwipe,
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
    },
    [saveLikesMutation, saveConvosMutation]
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
    (id: string): { ok: boolean; reason?: "limit" | "superlikes" } => {
      if (superLikedIds.includes(id) && likedIds.includes(id)) return { ok: true };
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

      setLikedIds((prev) => {
        const next = addUniqueId(prev, id);
        if (next === prev) return prev;
        saveLikesMutation.mutate(next);
        return next;
      });

      setConversations((prev) => {
        const other = MOCK_PROFILES.find((p) => p.id === id);
        const next = ensureGreetingConversation(prev, other, "super_like");
        if (next === prev) return prev;
        saveConvosMutation.mutate(next);
        return next;
      });

      persistBackendSwipe(id, "super_like");

      return { ok: true };
    },
    [
      superLikedIds,
      likedIds,
      slotsUsed,
      totalSlots,
      superLikeBalance,
      saveSuperLikesMutation,
      saveLikesMutation,
      saveConvosMutation,
      saveSuperLikeBalanceMutation,
      saveSuperLikeLastUseMutation,
      persistBackendSwipe,
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
      persistBackendSwipe(id, "pass");
    },
    [savePassesMutation, persistBackendSwipe]
  );

  const sendMessage = useCallback(
    (profileId: string, text: string, authorName?: string) => {
      if (!likedIds.includes(profileId)) {
        console.log("[profile-provider] sendMessage blocked: no active match", {
          profileId,
        });
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

      const other = MOCK_PROFILES.find((p) => p.id === profileId);
      if (!other) return;
      const reply = makeSimulatedReply(other);
      const delay = 1800 + Math.floor(Math.random() * 2500);
      setTimeout(() => {
        setConversations((prev) => {
          const next = appendIncomingTextReply(prev, profileId, other, reply);
          saveConvosMutation.mutate(next);
          return next;
        });
      }, delay);
    },
    [likedIds, saveConvosMutation]
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
      setConversations((prev) => {
        const next = markConversationRead(prev, profileId);
        saveConvosMutation.mutate(next);
        return next;
      });
    },
    [saveConvosMutation]
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
      conversations,
      likedIds,
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
      conversations,
      likedIds,
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

import createContextHook from "@nkzw/create-context-hook";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MOCK_PROFILES } from "@/mocks/profiles";
import {
  isBackendProfileId,
} from "@/constants/mock-profile-ids";
import { MVP_MONETIZATION_ENABLED } from "@/constants/features";
import { useMatchRealtime } from "@/hooks/api/use-match-realtime";
import { useMatchesQuery } from "@/hooks/api/use-matches";
import { usePersistedConversations } from "@/hooks/use-persisted-conversations";
import { useTransientEmptyList } from "@/hooks/use-transient-empty-list";
import { useAuth } from "@/providers/auth-provider";
import { createAppServices } from "@/services/app-services";
import {
  markBackendConversationRead,
  sendBackendChatMessage,
} from "@/services/backend-chat-action-service";
import { unmatchBackendProfile } from "@/services/backend-match-action-service";
import {
  buildBackendDisplayProfileMap,
  isIncompleteBackendProfile,
  mergeRememberedDisplayProfiles,
  resolveDisplayProfileById,
} from "@/services/backend-profile-display-service";
import {
  completeBackendOnboardingProfile,
  updateBackendProfile,
} from "@/services/backend-profile-action-service";
import { bootstrapBackendProfile } from "@/services/backend-profile-bootstrap-service";
import {
  recordBackendSwipe as recordBackendSwipeAction,
  resolveBackendSwipeVisibleMatch,
} from "@/services/backend-swipe-action-service";
import {
  applyBackendMatchHydrationPlan,
} from "@/services/backend-match-hydration-application-service";
import { buildBackendMatchHydrationPlan } from "@/services/backend-match-hydration-service";
import {
  deleteLocalMessage,
  respondToLocalPhoto,
  sendLocalPhoto,
  sendLocalTextMessage,
} from "@/services/local-chat-action-service";
import {
  activateLocalMatchState,
  passLocalProfile,
  removeLocalMatchState,
} from "@/services/local-match-action-service";
import {
  addUniqueId,
  applyReadWatermark,
  applySeenMatchId,
  markConversationRead,
  mergeBackendConversation,
  newestMessageAt,
  removeId,
} from "@/services/local-interaction-service";
import { applyLocalBlockCleanup } from "@/services/local-safety-action-service";
import {
  loadStoredProfileState,
  saveStoredProfile,
  saveStoredKnownProfiles,
} from "@/services/local-profile-storage";
import {
  applyLocalPurchase,
  createLocalSubscription,
  getSuperLikeRechargeAt,
  isLocalBoostActive,
  shouldRechargeSuperLikes,
} from "@/services/local-monetization-service";
import {
  acceptPartnerLink as acceptLocalPartnerLink,
  addPartnerInvite,
  applyProfileMutation,
  applyProfilePatch,
  removePartnerLink as removeLocalPartnerLink,
  resendPartnerInvite as resendLocalPartnerInvite,
} from "@/services/local-profile-mutation-service";
import {
  buildInboxItems,
  buildMatchedProfiles,
  countUnreadMessages,
  findConversationByProfileId,
  hasActiveProfileMatch,
} from "@/services/profile-provider-selectors";
import {
  applyMissingUserBackendBootstrapReset,
  applyMockModeBackendBootstrapReset,
  applyProfileProviderSignOutReset,
  applyUserChangedBackendBootstrapReset,
} from "@/services/profile-provider-reset-service";
import {
  blockProfileThroughSafetyService,
  reportProfileThroughSafetyService,
  requestAccountDeletionThroughSafetyService,
} from "@/services/safety-action-service";
import {
  DEFAULT_MATCH_SLOTS,
  DEFAULT_SUPER_LIKES,
  Profile,
  PurchaseId,
  SubscriptionId,
} from "@/types";
import type { MatchRecord } from "@/services/match-service";
import type { ReportReason } from "@/services/safety-service";
import type { ServiceResponse } from "@/services/service-types";
import type { SwipeDecision, SwipeResult } from "@/services/swipe-service";
import { useChatUiStore } from "@/store/use-chat-ui-store";
import { useInteractionStore } from "@/store/use-interaction-store";
import { useMonetizationStore } from "@/store/use-monetization-store";
import { usePreferencesStore } from "@/store/use-preferences-store";
import type {
  MatchActionResult,
  ProfileProviderContract,
} from "./profile-provider-contract";

export type { SubscriptionState } from "@/services/local-profile-storage";
export type {
  MatchActionResult,
  ProfileActionResult,
  ProfileInboxItem,
  ProfileProviderContract,
} from "./profile-provider-contract";

type BackendMatchListResult = ServiceResponse<MatchRecord[]>;

export const [ProfileProvider, useProfile] = createContextHook(() => {
  const { mode, session, signOut: signOutAuth, userId } = useAuth();
  const appServices = useMemo(() => createAppServices(), []);
  const lastBackendProfileSessionKey = useRef<string | null>(null);
  const lastBackendProfileUserId = useRef<string | null>(null);
  const lastBackendMatchHydrationKey = useRef<string | null>(null);
  const inFlightBackendMatchHydrationKey = useRef<string | null>(null);
  const pendingBackendMatchRefreshRef = useRef<boolean>(false);
  const {
    hydratePreferences,
    readWatermarks,
    seenMatchIds,
    setReadWatermarks,
    setSeenMatchIds,
  } = usePreferencesStore();
  const {
    hydrateInteractions,
    likedIds,
    passedIds,
    resetInteractions,
    setLikedIds,
    setPassedIds,
    setSuperLikedIds,
    superLikedIds,
  } = useInteractionStore();
  const {
    boostedUntil,
    extraSlots,
    hydrateMonetization,
    resetMonetization,
    setBoostedUntil,
    setExtraSlots,
    setSubscription,
    setSuperLikeBalance,
    setSuperLikeLastUseAt,
    subscription,
    superLikeBalance,
    superLikeLastUseAt,
  } = useMonetizationStore();
  const drafts = useChatUiStore((state) => state.drafts);
  const setDraft = useChatUiStore((state) => state.setDraft);
  const typingProfileIds = useChatUiStore((state) => state.typingProfileIds);
  const knownProfilesRef = useRef<Profile[]>([]);
  const displayProfilesRef = useRef<Record<string, Profile>>({});
  const lastResolvedProfilesRef = useRef<Record<string, Profile>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [knownProfiles, setKnownProfiles] = useState<Profile[]>([]);
  const {
    conversations,
    hydrateConversations,
    replaceConversations,
    updateConversations,
  } = usePersistedConversations();
  const [newMatchIds, setNewMatchIds] = useState<string[]>([]);
  const [backendActiveMatchIds, setBackendActiveMatchIds] = useState<string[]>(
    []
  );
  const readWatermarksRef = useRef<Record<string, Record<string, number>>>({});
  const seenMatchIdsRef = useRef<Record<string, string[]>>({});
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [backendProfileHydrated, setBackendProfileHydrated] =
    useState<boolean>(false);
  const [backendMatchesHydrated, setBackendMatchesHydrated] =
    useState<boolean>(false);

  const loadQuery = useQuery({
    queryKey: ["duet-storage"],
    queryFn: loadStoredProfileState,
  });
  const canQueryBackendMatches =
    mode === "supabase" &&
    appServices.capabilities.matches === "supabase" &&
    appServices.capabilities.chat === "supabase" &&
    hydrated &&
    backendProfileHydrated &&
    !!profile &&
    !!userId &&
    profile.id === userId;
  const backendMatchesQuery = useMatchesQuery({
    enabled: canQueryBackendMatches,
    profileId: userId,
    services: appServices,
  });
  useMatchRealtime({
    enabled: canQueryBackendMatches,
    matchIds: backendActiveMatchIds,
    profileId: userId,
    services: appServices,
  });

  useEffect(() => {
    if (loadQuery.data && !hydrated) {
      setProfile(loadQuery.data.profile);
      hydrateConversations(loadQuery.data.conversations);
      hydrateInteractions(
        loadQuery.data.likedIds,
        loadQuery.data.passedIds,
        loadQuery.data.superLikedIds
      );
      hydrateMonetization(
        loadQuery.data.extraSlots,
        loadQuery.data.boostedUntil,
        loadQuery.data.superLikeBalance,
        loadQuery.data.superLikeLastUseAt,
        loadQuery.data.subscription
      );
      hydratePreferences(
        loadQuery.data.readWatermarks,
        loadQuery.data.seenMatchIds
      );
      const completeKnownProfiles = loadQuery.data.knownProfiles.filter(
        (item) => !isIncompleteBackendProfile(item)
      );
      setKnownProfiles(completeKnownProfiles);
      knownProfilesRef.current = completeKnownProfiles;
      displayProfilesRef.current =
        buildBackendDisplayProfileMap(completeKnownProfiles);
      readWatermarksRef.current = loadQuery.data.readWatermarks;
      seenMatchIdsRef.current = loadQuery.data.seenMatchIds;
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
  const saveProfileRef = useRef(saveProfileMutation.mutate);

  useEffect(() => {
    saveProfileRef.current = saveProfileMutation.mutate;
  }, [saveProfileMutation.mutate]);

  useEffect(() => {
    if (mode !== "supabase") {
      console.log("[profile-provider] backend bootstrap reset: mock mode");
      applyMockModeBackendBootstrapReset({
        displayProfilesRef,
        inFlightBackendMatchHydrationKey,
        knownProfilesRef,
        lastBackendMatchHydrationKey,
        lastBackendProfileSessionKey,
        lastBackendProfileUserId,
        lastResolvedProfilesRef,
        pendingBackendMatchRefreshRef,
        saveKnownProfiles: saveStoredKnownProfiles,
        setBackendActiveMatchIds,
        setBackendMatchesHydrated,
        setBackendProfileHydrated,
        setKnownProfiles,
      });
      return;
    }

    if (!userId) {
      console.log("[profile-provider] backend bootstrap reset: no user");
      applyMissingUserBackendBootstrapReset({
        inFlightBackendMatchHydrationKey,
        lastBackendMatchHydrationKey,
        lastBackendProfileSessionKey,
        pendingBackendMatchRefreshRef,
        setBackendActiveMatchIds,
        setBackendMatchesHydrated,
        setBackendProfileHydrated,
      });
      return;
    }

    const sessionKey = session?.access_token ?? null;
    if (
      lastBackendProfileUserId.current === userId &&
      lastBackendProfileSessionKey.current === sessionKey
    ) {
      return;
    }

    if (lastBackendProfileUserId.current === userId) {
      lastBackendProfileSessionKey.current = sessionKey;
      return;
    }

    console.log("[profile-provider] backend bootstrap reset: user changed", {
      userId,
    });
    applyUserChangedBackendBootstrapReset({
      displayProfilesRef,
      knownProfilesRef,
      lastBackendProfileSessionKey,
      lastBackendProfileUserId,
      lastResolvedProfilesRef,
      pendingBackendMatchRefreshRef,
      saveKnownProfiles: saveStoredKnownProfiles,
      sessionKey,
      setBackendActiveMatchIds,
      setBackendMatchesHydrated,
      setBackendProfileHydrated,
      setKnownProfiles,
      userId,
    });
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
    saveProfileRef.current(null);
    setBackendProfileHydrated(false);
    setBackendMatchesHydrated(false);
  }, [hydrated, mode, profile, userId]);

  useEffect(() => {
    if (mode !== "supabase") return;
    if (!hydrated || !userId || !profile) return;
    if (profile.id !== userId || backendProfileHydrated) return;
    console.log("[profile-provider] cached profile accepted for backend bootstrap", {
      userId,
    });
    setBackendProfileHydrated(true);
  }, [backendProfileHydrated, hydrated, mode, profile, userId]);

  useEffect(() => {
    if (mode !== "supabase") return;
    if (appServices.capabilities.profiles !== "supabase") return;
    if (!hydrated || backendProfileHydrated || !userId || profile) return;

    let cancelled = false;
    void bootstrapBackendProfile({
      email: session?.user.email,
      isCancelled: () => cancelled,
      services: appServices,
      userId,
    }).then((result) => {
      if (cancelled) return;

      if (result.status === "loaded") {
        setProfile(result.profile);
        saveProfileRef.current(result.profile);
      }

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
    session?.user.email,
    userId,
  ]);

  const rememberProfiles = useCallback((profilesToRemember: Profile[]) => {
    if (profilesToRemember.length === 0) return;

    setKnownProfiles((prev) => {
      const merge = mergeRememberedDisplayProfiles({
        previousDisplayProfiles: displayProfilesRef.current,
        previousKnownProfiles: prev,
        previousLastResolvedProfiles: lastResolvedProfilesRef.current,
        profilesToRemember,
      });
      displayProfilesRef.current = merge.displayProfiles;
      lastResolvedProfilesRef.current = merge.lastResolvedProfiles;
      const next = merge.knownProfiles;
      knownProfilesRef.current = next;
      if (merge.changed) {
        void saveStoredKnownProfiles(next);
      }
      return next;
    });
  }, []);

  const applyBackendMatches = useCallback(async (matchResult: BackendMatchListResult) => {
    if (!canQueryBackendMatches) return;

    const sessionKey = session?.access_token ?? "";
    const hydrationKey = `${userId}:${sessionKey}`;
    if (inFlightBackendMatchHydrationKey.current === hydrationKey) {
      pendingBackendMatchRefreshRef.current = true;
      console.log("[profile-provider] backend match bootstrap queued", {
        userId,
      });
      return;
    }
    inFlightBackendMatchHydrationKey.current = hydrationKey;
    console.log("[profile-provider] backend match bootstrap start", {
      knownProfiles: knownProfilesRef.current.length,
      userId,
    });

    try {
      if (!matchResult.ok) {
        console.log("[profile-provider] backend match hydration failed", {
          code: matchResult.error.code,
          message: matchResult.error.message,
        });
        setBackendMatchesHydrated(true);
        return;
      }

      console.log("[profile-provider] backend match bootstrap loaded matches", {
        count: matchResult.value.length,
        userId,
      });

      const hydrationPlan = await buildBackendMatchHydrationPlan({
        displayProfiles: displayProfilesRef.current,
        knownProfiles: knownProfilesRef.current,
        matches: matchResult.value,
        profile,
        services: appServices,
        userId,
      });

      if (hydrationPlan.status === "partial") return;

      applyBackendMatchHydrationPlan({
        hydrationPlan,
        mockProfiles: MOCK_PROFILES,
        readWatermarks: readWatermarksRef.current,
        rememberProfiles,
        seenMatchIds: seenMatchIdsRef.current[userId] ?? [],
        setBackendActiveMatchIds,
        setLikedIds,
        setNewMatchIds,
        updateConversations,
        userId,
      });
      lastBackendMatchHydrationKey.current = hydrationKey;
      console.log("[profile-provider] backend match bootstrap applied", {
        backendConversations: hydrationPlan.backendConversations.length,
        matchedLocalProfileIds: hydrationPlan.matchedLocalProfileIds,
        userId,
      });
      setBackendMatchesHydrated(true);
    } finally {
      if (inFlightBackendMatchHydrationKey.current === hydrationKey) {
        console.log("[profile-provider] backend match bootstrap released", {
          userId,
        });
        setBackendMatchesHydrated(true);
        inFlightBackendMatchHydrationKey.current = null;
      }
      if (pendingBackendMatchRefreshRef.current) {
        pendingBackendMatchRefreshRef.current = false;
        setTimeout(() => {
          void applyBackendMatches(matchResult);
        }, 0);
      }
    }
  }, [
    appServices,
    canQueryBackendMatches,
    profile,
    rememberProfiles,
    updateConversations,
    session?.access_token,
    userId,
  ]);

  useEffect(() => {
    if (!backendMatchesQuery.data) return;
    void applyBackendMatches(backendMatchesQuery.data);
  }, [
    applyBackendMatches,
    backendMatchesQuery.data,
    backendMatchesQuery.dataUpdatedAt,
  ]);

  const completeOnboarding = useCallback(
    async (p: Profile): Promise<{ ok: boolean; error?: string }> => {
      const result = await completeBackendOnboardingProfile({
        profile: p,
        services: appServices,
      });

      if (result.status === "failed") {
        return { ok: false, error: result.error };
      }

      const profileToStore = result.profile;
      console.log("[profile-provider] completeOnboarding", profileToStore.id);
      setProfile(profileToStore);
      saveProfileRef.current(profileToStore);
      setBackendProfileHydrated(true);
      return { ok: true };
    },
    [appServices]
  );

  const mutateLocalProfile = useCallback(
    (mutateProfile: (profile: Profile | null) => Profile | null) => {
      setProfile((prev) =>
        applyProfileMutation(prev, mutateProfile, (next) =>
          saveProfileRef.current(next)
        )
      );
    },
    []
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      setProfile((prev) =>
        applyProfileMutation(
          prev,
          (current) => applyProfilePatch(current, patch),
          (next) => {
            void updateBackendProfile({
              patch,
              profileId: next.id,
              services: appServices,
            });
            saveProfileRef.current(next);
          }
        )
      );
    },
    [appServices]
  );

  const signOut = useCallback(async () => {
    let result: Awaited<ReturnType<typeof signOutAuth>> | undefined;
    if (mode === "supabase") {
      result = await signOutAuth();
    }
    applyProfileProviderSignOutReset({
      inFlightBackendMatchHydrationKey,
      lastBackendMatchHydrationKey,
      lastBackendProfileSessionKey,
      pendingBackendMatchRefreshRef,
      replaceConversations,
      resetInteractions,
      resetMonetization,
      setBackendMatchesHydrated,
      setBackendProfileHydrated,
      setNewMatchIds,
      setProfile,
    });
    saveProfileRef.current(null);
    return result ?? { ok: true as const };
  }, [
    mode,
    signOutAuth,
    replaceConversations,
    resetInteractions,
    resetMonetization,
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
      return recordBackendSwipeAction({
        currentProfileId: profile?.id,
        decision,
        services: appServices,
        targetId,
        userId,
      });
    },
    [appServices, profile?.id, userId]
  );

  const activateLocalMatch = useCallback(
    (id: string, kind: "like" | "super_like") => {
      activateLocalMatchState({
        kind,
        mockProfiles: MOCK_PROFILES,
        profileId: id,
        setLikedIds,
        setNewMatchIds,
        updateConversations,
      });
    },
    [setLikedIds, updateConversations]
  );

  const markMatchSeen = useCallback(async (profileId: string) => {
    setNewMatchIds((prev) => removeId(prev, profileId));
    const nextSeenMatchIds = applySeenMatchId(
      seenMatchIdsRef.current,
      profile?.id,
      profileId
    );
    if (nextSeenMatchIds === seenMatchIdsRef.current) return;

    seenMatchIdsRef.current = nextSeenMatchIds;
    setSeenMatchIds(nextSeenMatchIds);
  }, [profile?.id]);

  const persistBackendChatMessage = useCallback(
    (targetId: string, text: string, options: { appendLocalEcho?: boolean } = {}) => {
      void sendBackendChatMessage({
        body: text,
        currentProfileId: profile?.id,
        services: appServices,
        targetId,
        userId,
      }).then((result) => {
        if (result.status === "match_not_found") {
          removeLocalMatchState({
            profileId: targetId,
            setLikedIds,
            updateConversations,
          });
          return;
        }

        if (result.status !== "sent" || options.appendLocalEcho === false) {
          return;
        }

        updateConversations((prev) => {
          const next = mergeBackendConversation(prev, targetId, [result.message]);
          if (next === prev) return prev;
          return next;
        });
      });
    },
    [appServices, profile?.id, setLikedIds, updateConversations, userId]
  );

  const likeProfile = useCallback(
    async (id: string): Promise<MatchActionResult> => {
      if (likedIds.includes(id)) return { ok: true, matched: true };
      if (slotsUsed >= totalSlots) {
        console.log("[profile-provider] like blocked: match limit");
        return { ok: false, reason: "limit" };
      }

      const backendMatch = await resolveBackendSwipeVisibleMatch({
        currentProfileId: profile?.id,
        decision: "like",
        profileId: id,
        services: appServices,
        userId,
      });
      if (backendMatch.status === "activate_local_match") {
        activateLocalMatch(id, "like");
        return { ok: true, matched: true };
      }

      return { ok: true, matched: false };
    },
    [
      activateLocalMatch,
      appServices,
      likedIds,
      profile?.id,
      slotsUsed,
      totalSlots,
      userId,
    ]
  );

  const unmatch = useCallback(
    (id: string) => {
      removeLocalMatchState({
        profileId: id,
        setLikedIds,
        updateConversations,
      });

      void unmatchBackendProfile({
        currentProfileId: profile?.id,
        profileId: id,
        services: appServices,
        userId,
      });
    },
    [appServices, profile?.id, setLikedIds, updateConversations, userId]
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

      const result = await reportProfileThroughSafetyService({
        details,
        reason,
        reportedMessageId,
        reportedProfileId,
        reporterId: profile.id,
        services: appServices,
      });

      return result;
    },
    [appServices, profile]
  );

  const blockProfile = useCallback(
    async (blockedProfileId: string): Promise<{ ok: boolean; error?: string }> => {
      if (!profile) {
        return { ok: false, error: "Create a profile before blocking." };
      }

      const result = await blockProfileThroughSafetyService({
        blockedProfileId,
        blockerId: profile.id,
        services: appServices,
      });

      if (!result.ok) {
        return result;
      }

      applyLocalBlockCleanup({
        blockedProfileId,
        setLikedIds,
        setPassedIds,
        updateConversations,
      });

      return { ok: true };
    },
    [
      appServices,
      profile,
      setLikedIds,
      setPassedIds,
      updateConversations,
    ]
  );

  const requestAccountDeletion = useCallback(
    async (reason?: string): Promise<{ ok: boolean; error?: string }> => {
      if (!profile) {
        return { ok: false, error: "No profile is signed in." };
      }

      const result = await requestAccountDeletionThroughSafetyService({
        profileId: profile.id,
        reason,
        services: appServices,
      });

      if (!result.ok) {
        return result;
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
        const now = Date.now();
        setSuperLikeLastUseAt(now);
      }

      setSuperLikedIds((prev) => {
        const next = addUniqueId(prev, id);
        if (next === prev) return prev;
        return next;
      });

      const backendMatch = await resolveBackendSwipeVisibleMatch({
        currentProfileId: profile?.id,
        decision: "super_like",
        profileId: id,
        services: appServices,
        userId,
      });
      if (backendMatch.status === "activate_local_match") {
        activateLocalMatch(id, "super_like");
        return { ok: true, matched: true };
      }

      return { ok: true, matched: false };
    },
    [
      activateLocalMatch,
      appServices,
      superLikedIds,
      likedIds,
      profile?.id,
      slotsUsed,
      totalSlots,
      superLikeBalance,
      setSuperLikeBalance,
      setSuperLikeLastUseAt,
      setSuperLikedIds,
      userId,
    ]
  );

  const passProfile = useCallback(
    (id: string) => {
      passLocalProfile({
        profileId: id,
        setPassedIds,
      });
      void recordBackendSwipe(id, "pass");
    },
    [recordBackendSwipe, setPassedIds]
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
      sendLocalTextMessage({
        authorName,
        localMockProfile,
        persistBackendChatMessage,
        profileId,
        text,
        updateConversations,
      });
    },
    [likedIds, mode, persistBackendChatMessage, updateConversations]
  );

  const deleteMessage = useCallback(
    (profileId: string, messageId: string) => {
      deleteLocalMessage({
        messageId,
        profileId,
        updateConversations,
      });
    },
    [updateConversations]
  );

  const sendPhoto = useCallback(
    (profileId: string, photoUri: string, authorName?: string) => {
      if (!likedIds.includes(profileId)) {
        console.log("[profile-provider] sendPhoto blocked: no active match", {
          profileId,
        });
        return;
      }
      sendLocalPhoto({
        authorName,
        photoUri,
        profileId,
        updateConversations,
      });
    },
    [likedIds, updateConversations]
  );

  const respondToPhoto = useCallback(
    (profileId: string, messageId: string, decision: "approved" | "declined") => {
      respondToLocalPhoto({
        decision,
        messageId,
        profileId,
        updateConversations,
      });
    },
    [updateConversations]
  );

  const markRead = useCallback(
    (profileId: string) => {
      const readThrough = newestMessageAt(conversations, profileId);
      const nextReadWatermarks = applyReadWatermark(
        readWatermarksRef.current,
        profile?.id,
        profileId,
        readThrough
      );
      if (nextReadWatermarks !== readWatermarksRef.current) {
        readWatermarksRef.current = nextReadWatermarks;
        setReadWatermarks(nextReadWatermarks);
      }
      void markBackendConversationRead({
        currentProfileId: profile?.id,
        profileId,
        readThrough,
        services: appServices,
        userId,
      });
      updateConversations((prev) => {
        const next = markConversationRead(prev, profileId);
        if (next === prev) return prev;
        return next;
      });
    },
    [appServices, conversations, profile?.id, updateConversations, userId]
  );

  const purchase = useCallback(
    (id: PurchaseId) => {
      console.log("[profile-provider] purchase", id);
      const result = applyLocalPurchase(id, superLikeBalance);

      if (typeof result.extraSlotsDelta === "number") {
        const delta = result.extraSlotsDelta;
        setExtraSlots((v) => {
          return v + delta;
        });
      }
      if (typeof result.boostedUntil === "number") {
        setBoostedUntil(result.boostedUntil);
      }
      if (typeof result.superLikeBalance === "number") {
        setSuperLikeBalance(result.superLikeBalance);
      }
      if (typeof result.superLikeBalanceDelta === "number") {
        const delta = result.superLikeBalanceDelta;
        setSuperLikeBalance((v) => {
          return v + delta;
        });
      }
      if ("superLikeLastUseAt" in result) {
        setSuperLikeLastUseAt(result.superLikeLastUseAt ?? null);
      }
    },
    [
      superLikeBalance,
      setBoostedUntil,
      setExtraSlots,
      setSuperLikeBalance,
      setSuperLikeLastUseAt,
    ]
  );

  const subscribe = useCallback(
    (id: SubscriptionId) => {
      console.log("[profile-provider] subscribe", id);
      const result = createLocalSubscription(id);
      if (!result) return;
      setSubscription(result.subscription);

      setExtraSlots((v) => {
        return v + result.extraSlotsDelta;
      });
      setSuperLikeBalance((v) => {
        return v + result.superLikeBalanceDelta;
      });
      if (typeof result.boostedUntil === "number") {
        setBoostedUntil(result.boostedUntil);
      }
    },
    [
      setBoostedUntil,
      setExtraSlots,
      setSubscription,
      setSuperLikeBalance,
    ]
  );

  const cancelSubscription = useCallback(() => {
    console.log("[profile-provider] cancel subscription");
    setSubscription(null);
  }, [setSubscription]);

  const invitePartner = useCallback(
    (email: string, displayName?: string) => {
      mutateLocalProfile((current) =>
        addPartnerInvite(current, email, displayName)
      );
    },
    [mutateLocalProfile]
  );

  const resendPartnerInvite = useCallback(
    (partnerId: string) => {
      mutateLocalProfile((current) =>
        resendLocalPartnerInvite(current, partnerId)
      );
    },
    [mutateLocalProfile]
  );

  const acceptPartnerLink = useCallback(
    (partnerId: string) => {
      mutateLocalProfile((current) =>
        acceptLocalPartnerLink(current, partnerId)
      );
    },
    [mutateLocalProfile]
  );

  const removePartnerLink = useCallback(
    (partnerId: string) => {
      mutateLocalProfile((current) =>
        removeLocalPartnerLink(current, partnerId)
      );
    },
    [mutateLocalProfile]
  );

  const isBoosted = useMemo(() => {
    return isLocalBoostActive(boostedUntil);
  }, [boostedUntil]);

  const superLikeRechargeAt = useMemo(() => {
    return getSuperLikeRechargeAt(superLikeBalance, superLikeLastUseAt);
  }, [superLikeBalance, superLikeLastUseAt]);

  const getProfileById = useCallback(
    (profileId: string) => {
      const resolution = resolveDisplayProfileById({
        displayProfiles: displayProfilesRef.current,
        knownProfiles,
        knownProfilesCache: knownProfilesRef.current,
        lastResolvedProfiles: lastResolvedProfilesRef.current,
        mockProfiles: MOCK_PROFILES,
        profileId,
      });
      lastResolvedProfilesRef.current = resolution.lastResolvedProfiles;
      return resolution.profile;
    },
    [knownProfiles]
  );

  const getConversation = useCallback(
    (profileId: string) =>
      findConversationByProfileId(conversations, profileId),
    [conversations]
  );

  const hasActiveMatch = useCallback(
    (profileId: string) => hasActiveProfileMatch(likedIds, profileId),
    [likedIds]
  );

  const rawMatchedProfiles = useMemo(
    () => buildMatchedProfiles(likedIds, getProfileById),
    [getProfileById, likedIds]
  );
  const matchedProfiles = useTransientEmptyList(rawMatchedProfiles, !!profile);

  const rawInboxItems = useMemo(
    () => buildInboxItems(conversations, getProfileById),
    [conversations, getProfileById]
  );
  const inboxItems = useTransientEmptyList(rawInboxItems, !!profile);

  const newMatchCount = useMemo(() => newMatchIds.length, [newMatchIds]);

  const unreadMessageCount = useMemo(
    () => countUnreadMessages(conversations),
    [conversations]
  );

  useEffect(() => {
    if (!hydrated) return;
    if (shouldRechargeSuperLikes(superLikeBalance, superLikeLastUseAt)) {
      console.log("[profile-provider] super like auto-recharge");
      setSuperLikeBalance(DEFAULT_SUPER_LIKES);
      setSuperLikeLastUseAt(null);
    }
  }, [
    hydrated,
    superLikeBalance,
    superLikeLastUseAt,
    setSuperLikeBalance,
    setSuperLikeLastUseAt,
  ]);

  return useMemo<ProfileProviderContract>(
    () => ({
      profile,
      knownProfiles,
      conversations,
      likedIds,
      newMatchIds,
      matchedProfiles,
      inboxItems,
      newMatchCount,
      unreadMessageCount,
      passedIds,
      hydrated,
      backendProfileHydrated,
      backendMatchesHydrated,
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
      getProfileById,
      getConversation,
      hasActiveMatch,
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
      matchedProfiles,
      inboxItems,
      newMatchCount,
      unreadMessageCount,
      passedIds,
      hydrated,
      backendProfileHydrated,
      backendMatchesHydrated,
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
      getProfileById,
      getConversation,
      hasActiveMatch,
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

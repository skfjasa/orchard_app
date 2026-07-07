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
import { useMatchesQuery } from "@/hooks/api/use-matches";
import { useTransientEmptyList } from "@/hooks/use-transient-empty-list";
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
  saveStoredProfile,
  saveStoredKnownProfiles,
  saveStoredSubscription,
  saveStoredSuperLikeBalance,
  saveStoredSuperLikeLastUse,
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
import { useInteractionStore } from "@/store/use-interaction-store";
import { usePreferencesStore } from "@/store/use-preferences-store";
import type {
  MatchActionResult,
  ProfileInboxItem,
  ProfileProviderContract,
} from "./profile-provider-contract";

export type { SubscriptionState } from "@/services/local-profile-storage";
export type {
  MatchActionResult,
  ProfileActionResult,
  ProfileInboxItem,
  ProfileProviderContract,
} from "./profile-provider-contract";

function isLikelyLocalBackendEcho(localMessage: Message, backendMessage: Message) {
  return (
    localMessage.id.startsWith("m-") &&
    localMessage.fromMe === true &&
    backendMessage.fromMe === true &&
    localMessage.kind === backendMessage.kind &&
    localMessage.text === backendMessage.text &&
    Math.abs(localMessage.at - backendMessage.at) < 15_000
  );
}

function mergeMessages(localMessages: Message[], backendMessages: Message[]) {
  const byId = new Map<string, Message>();
  for (const message of localMessages) {
    byId.set(message.id, message);
  }
  for (const message of backendMessages) {
    const duplicateLocalEcho = [...byId.values()].some((existing) =>
      isLikelyLocalBackendEcho(existing, message)
    );
    if (duplicateLocalEcho) continue;
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

  const mergedMessages = mergeMessages(existing.messages, backendMessages);
  const unread = mergedMessages.filter(
    (message) => !message.fromMe && message.at > readThrough
  ).length;
  const messagesUnchanged =
    mergedMessages.length === existing.messages.length &&
    mergedMessages.every((message, index) => message === existing.messages[index]);

  if (messagesUnchanged && existing.unread === unread) return conversations;

  return conversations.map((conversation) =>
    conversation.profileId === profileId
      ? {
          ...conversation,
          messages: mergedMessages,
          unread,
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

export type InboxListItem = ProfileInboxItem;

const BACKEND_MATCH_REFRESH_INTERVAL_MS = 10_000;
const BACKEND_REALTIME_REFRESH_DELAY_MS = 250;
const INCOMPLETE_BACKEND_PROFILE_NAME = "orchard user";

function isIncompleteBackendProfile(profile: Profile | undefined): boolean {
  if (!profile || !isBackendProfileId(profile.id)) return false;
  if (MOCK_PROFILES.some((item) => item.id === profile.id)) return false;
  if (profile.people.length === 0) return true;

  return profile.people.every(
    (person) =>
      person.name.trim().toLowerCase() === INCOMPLETE_BACKEND_PROFILE_NAME
  );
}

function chooseDisplayProfile(
  backendProfile: Profile | undefined,
  rememberedProfile: Profile | undefined
): Profile | undefined {
  if (backendProfile && !isIncompleteBackendProfile(backendProfile)) {
    return backendProfile;
  }

  if (rememberedProfile && !isIncompleteBackendProfile(rememberedProfile)) {
    return rememberedProfile;
  }

  return undefined;
}

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
  const knownProfilesRef = useRef<Profile[]>([]);
  const displayProfilesRef = useRef<Record<string, Profile>>({});
  const lastResolvedProfilesRef = useRef<Record<string, Profile>>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [knownProfiles, setKnownProfiles] = useState<Profile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMatchIds, setNewMatchIds] = useState<string[]>([]);
  const [backendActiveMatchIds, setBackendActiveMatchIds] = useState<string[]>(
    []
  );
  const readWatermarksRef = useRef<Record<string, Record<string, number>>>({});
  const seenMatchIdsRef = useRef<Record<string, string[]>>({});
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
  const [backendMatchesHydrated, setBackendMatchesHydrated] =
    useState<boolean>(false);

  const loadQuery = useQuery({
    queryKey: ["duet-storage"],
    queryFn: loadStoredProfileState,
  });
  const backendMatchesQuery = useMatchesQuery({
    enabled: false,
    profileId: userId,
    services: appServices,
  });
  const refetchBackendMatchesQuery = backendMatchesQuery.refetch;

  useEffect(() => {
    if (loadQuery.data && !hydrated) {
      setProfile(loadQuery.data.profile);
      setConversations(loadQuery.data.conversations);
      hydrateInteractions(
        loadQuery.data.likedIds,
        loadQuery.data.passedIds,
        loadQuery.data.superLikedIds
      );
      setExtraSlots(loadQuery.data.extraSlots);
      setBoostedUntil(loadQuery.data.boostedUntil);
      setSuperLikeBalance(loadQuery.data.superLikeBalance);
      setSuperLikeLastUseAt(loadQuery.data.superLikeLastUseAt);
      setSubscription(loadQuery.data.subscription);
      hydratePreferences(
        loadQuery.data.readWatermarks,
        loadQuery.data.seenMatchIds
      );
      const completeKnownProfiles = loadQuery.data.knownProfiles.filter(
        (item) => !isIncompleteBackendProfile(item)
      );
      setKnownProfiles(completeKnownProfiles);
      knownProfilesRef.current = completeKnownProfiles;
      displayProfilesRef.current = Object.fromEntries(
        completeKnownProfiles.map((item) => [item.id, item])
      );
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

  const saveConvosMutation = useMutation({
    mutationFn: saveStoredConversations,
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
      console.log("[profile-provider] backend bootstrap reset: mock mode");
      lastBackendProfileSessionKey.current = null;
      lastBackendProfileUserId.current = null;
      lastBackendMatchHydrationKey.current = null;
      inFlightBackendMatchHydrationKey.current = null;
      pendingBackendMatchRefreshRef.current = false;
      knownProfilesRef.current = [];
      displayProfilesRef.current = {};
      lastResolvedProfilesRef.current = {};
      void saveStoredKnownProfiles([]);
      setBackendActiveMatchIds([]);
      setKnownProfiles([]);
      setBackendProfileHydrated(false);
      setBackendMatchesHydrated(false);
      return;
    }

    if (!userId) {
      console.log("[profile-provider] backend bootstrap reset: no user");
      lastBackendProfileSessionKey.current = null;
      lastBackendMatchHydrationKey.current = null;
      inFlightBackendMatchHydrationKey.current = null;
      pendingBackendMatchRefreshRef.current = false;
      setBackendActiveMatchIds([]);
      setBackendProfileHydrated(false);
      setBackendMatchesHydrated(false);
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

    lastBackendProfileSessionKey.current = sessionKey;
    lastBackendProfileUserId.current = userId;
    pendingBackendMatchRefreshRef.current = false;
    console.log("[profile-provider] backend bootstrap reset: user changed", {
      userId,
    });
    knownProfilesRef.current = [];
    displayProfilesRef.current = {};
    lastResolvedProfilesRef.current = {};
    void saveStoredKnownProfiles([]);
    setBackendActiveMatchIds([]);
    setKnownProfiles([]);
    setBackendProfileHydrated(false);
    setBackendMatchesHydrated(false);
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
    setBackendMatchesHydrated(false);
  }, [hydrated, mode, profile, saveProfileMutation, userId]);

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
        if (isIncompleteBackendProfile(item)) continue;
        displayProfilesRef.current = {
          ...displayProfilesRef.current,
          [item.id]: item,
        };
        lastResolvedProfilesRef.current = {
          ...lastResolvedProfilesRef.current,
          [item.id]: item,
        };
        if (byId.get(item.id) === item) continue;
        byId.set(item.id, item);
        changed = true;
      }

      const next = changed ? [...byId.values()] : prev;
      knownProfilesRef.current = next;
      if (changed) {
        void saveStoredKnownProfiles(next);
      }
      return next;
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
      const matchQueryResult = await refetchBackendMatchesQuery();
      const matchResult =
        matchQueryResult.data ??
        ({
          ok: false,
          error: {
            code: "matches_query_empty",
            message: "Backend matches query did not return a result.",
          },
        } as const);

      if (!matchResult.ok) {
        console.log("[profile-provider] backend match hydration failed", {
          code: matchResult.error.code,
          message: matchResult.error.message,
        });
        setBackendMatchesHydrated(true);
        return;
      }

      const matchedLocalProfileIds = new Set<string>();
      const activeBackendMatchIds = matchResult.value.map((match) => match.id);
      console.log("[profile-provider] backend match bootstrap loaded matches", {
        count: matchResult.value.length,
        userId,
      });
      const discoveryProfilesById = new Map<string, Profile>();
      const missingRealProfileIds = matchResult.value
        .map((match) =>
          fromBackendProfileId(match.userA === userId ? match.userB : match.userA)
        )
        .filter((profileId, index, allIds) => {
          if (allIds.indexOf(profileId) !== index) return false;
          if (MOCK_PROFILES.some((item) => item.id === profileId)) return false;
          const rememberedProfile =
            knownProfilesRef.current.find((item) => item.id === profileId) ??
            displayProfilesRef.current[profileId];
          return !chooseDisplayProfile(undefined, rememberedProfile);
        });

      if (
        missingRealProfileIds.length > 0 &&
        appServices.capabilities.discovery === "supabase"
      ) {
        const discoveryResult = await appServices.discovery.listProfiles({
          profileId: userId,
          viewerProfile: profile,
          excludedProfileIds: [],
          includePassed: true,
          limit: 100,
        });

        if (discoveryResult.ok) {
          const completeProfiles = discoveryResult.value
            .map((item) => item.profile)
            .filter((item) => !isIncompleteBackendProfile(item));
          rememberProfiles(completeProfiles);
          for (const item of completeProfiles) {
            discoveryProfilesById.set(item.id, item);
          }
        } else {
          console.log("[profile-provider] backend match profile repair failed", {
            code: discoveryResult.error.code,
            message: discoveryResult.error.message,
          });
        }
      }

      const backendConversations: {
        profileId: string;
        messages: Message[];
        readThrough?: number;
        isFixture: boolean;
      }[] = [];
      const matchedProfilesToRemember: Profile[] = [];

      for (const match of matchResult.value) {
        const otherBackendProfileId =
          match.userA === userId ? match.userB : match.userA;
        const otherLocalProfileId = fromBackendProfileId(otherBackendProfileId);
        const mockProfile = MOCK_PROFILES.find(
          (item) => item.id === otherLocalProfileId
        );
        const rememberedProfile = knownProfilesRef.current.find(
          (item) => item.id === otherLocalProfileId
        ) ?? displayProfilesRef.current[otherLocalProfileId] ??
          discoveryProfilesById.get(otherLocalProfileId);
        const otherProfile =
          mockProfile ??
          chooseDisplayProfile(match.otherProfile, rememberedProfile);

        if (!mockProfile && !otherProfile) {
          console.log("[profile-provider] skipping partial match hydration", {
            profileId: otherLocalProfileId,
            matchId: match.id,
          });
          return;
        }

        matchedLocalProfileIds.add(otherProfile?.id ?? otherLocalProfileId);
        if (!mockProfile && otherProfile) {
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
          profileId: otherProfile?.id ?? otherLocalProfileId,
          messages: threadResult.value.messages,
          readThrough: threadResult.value.readThrough,
          isFixture: !!mockProfile,
        });
      }

      rememberProfiles(matchedProfilesToRemember);
      setBackendActiveMatchIds((prev) =>
        sameStringSet(prev, activeBackendMatchIds) ? prev : activeBackendMatchIds
      );
      setLikedIds((prev) => {
        const localOnlyLikedIds = prev.filter((id) => !isBackendProfileId(id));
        const next = [...matchedLocalProfileIds, ...localOnlyLikedIds];
        if (sameStringSet(prev, next)) return prev;
        return next;
      });

      setNewMatchIds((prev) => {
        const currentSeenMatchIds = new Set(
          seenMatchIdsRef.current[userId] ?? []
        );
        const nextNewMatchIds = [...matchedLocalProfileIds].filter(
          (id) => !currentSeenMatchIds.has(id)
        );
        const localOnlyNewMatchIds = prev.filter(
          (id) => !isBackendProfileId(id)
        );
        const next = [...new Set([...nextNewMatchIds, ...localOnlyNewMatchIds])];
        if (sameStringSet(prev, next)) return prev;
        return next;
      });

      setConversations((prev) => {
        const filtered = prev.filter(
          (conversation) =>
            matchedLocalProfileIds.has(conversation.profileId) ||
            !isBackendProfileId(conversation.profileId)
        );
        let next = filtered.length === prev.length ? prev : filtered;
        for (const backendConversation of backendConversations) {
          const hostedReadThrough = backendConversation.readThrough ?? 0;
          const localReadThrough =
            readWatermarksRef.current[userId]?.[
              backendConversation.profileId
            ] ?? 0;
          const readThrough = Math.max(hostedReadThrough, localReadThrough);
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
      console.log("[profile-provider] backend match bootstrap applied", {
        backendConversations: backendConversations.length,
        matchedLocalProfileIds: [...matchedLocalProfileIds],
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
          void refreshBackendMatches();
        }, 0);
      }
    }
  }, [
    appServices,
    backendProfileHydrated,
    hydrated,
    mode,
    profile,
    rememberProfiles,
    refetchBackendMatchesQuery,
    saveConvosMutation,
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

  useEffect(() => {
    if (mode !== "supabase") return;
    if (appServices.capabilities.realtime !== "supabase") return;
    if (!hydrated || !backendProfileHydrated) return;
    if (!profile || !userId || profile.id !== userId) return;

    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
    const subscriptionResult =
      appServices.realtime.subscribeToMatchAndMessageChanges({
        profileId: userId,
        matchIds: backendActiveMatchIds,
        onChange: () => {
          if (refreshTimeout) return;
          refreshTimeout = setTimeout(() => {
            refreshTimeout = null;
            void refreshBackendMatches();
          }, BACKEND_REALTIME_REFRESH_DELAY_MS);
        },
      });

    if (!subscriptionResult.ok) {
      console.log("[profile-provider] backend realtime unavailable", {
        code: subscriptionResult.error.code,
        message: subscriptionResult.error.message,
      });
      return;
    }

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      subscriptionResult.value.unsubscribe();
    };
  }, [
    appServices,
    backendActiveMatchIds,
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
    setConversations([]);
    setNewMatchIds([]);
    resetInteractions();
    setExtraSlots(0);
    setBoostedUntil(null);
    setSuperLikeBalance(DEFAULT_SUPER_LIKES);
    setSuperLikeLastUseAt(null);
    setSubscription(null);
    setBackendProfileHydrated(false);
    setBackendMatchesHydrated(false);
    lastBackendProfileSessionKey.current = null;
    lastBackendMatchHydrationKey.current = null;
    inFlightBackendMatchHydrationKey.current = null;
    pendingBackendMatchRefreshRef.current = false;
    saveProfileMutation.mutate(null);
    saveConvosMutation.mutate([]);
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
    resetInteractions,
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
    [saveConvosMutation, setLikedIds]
  );

  const markMatchSeen = useCallback(async (profileId: string) => {
    setNewMatchIds((prev) => removeId(prev, profileId));
    const ownerId = profile?.id;
    if (!ownerId) return;
    const ownerSeen = seenMatchIdsRef.current[ownerId] ?? [];
    const nextOwnerSeen = addUniqueId(ownerSeen, profileId);
    if (nextOwnerSeen === ownerSeen) return;

    const next = {
      ...seenMatchIdsRef.current,
      [ownerId]: nextOwnerSeen,
    };
    seenMatchIdsRef.current = next;
    setSeenMatchIds(next);
  }, [profile?.id]);

  const persistBackendChatMessage = useCallback(
    (
      targetId: string,
      text: string,
      options: { appendLocalEcho?: boolean } = {}
    ) => {
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

          if (options.appendLocalEcho === false) return;

          setConversations((prev) => {
            const next = mergeBackendConversation(prev, targetId, [result.value]);
            if (next === prev) return prev;
            saveConvosMutation.mutate(next);
            return next;
          });
        });
    },
    [appServices, mode, profile, saveConvosMutation, setLikedIds, userId]
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
    [appServices, mode, profile, saveConvosMutation, setLikedIds, userId]
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
        return next;
      });
      setPassedIds((prev) => {
        const next = addUniqueId(prev, blockedProfileId);
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
      setLikedIds,
      setPassedIds,
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
      saveSuperLikeBalanceMutation,
      saveSuperLikeLastUseMutation,
      setSuperLikedIds,
    ]
  );

  const passProfile = useCallback(
    (id: string) => {
      setPassedIds((prev) => {
        const next = addUniqueId(prev, id);
        if (next === prev) return prev;
        return next;
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

      persistBackendChatMessage(profileId, text, {
        appendLocalEcho: !localMockProfile,
      });

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
      const readThrough = newestMessageAt(conversations, profileId);
      if (profile?.id) {
        if (readThrough > 0) {
          const current = readWatermarksRef.current;
          const ownerWatermarks = current[profile.id] ?? {};
          if ((ownerWatermarks[profileId] ?? 0) < readThrough) {
            const next = {
              ...current,
              [profile.id]: {
                ...ownerWatermarks,
                [profileId]: readThrough,
              },
            };
            readWatermarksRef.current = next;
            setReadWatermarks(next);
          }
        }
      }
      if (
        readThrough > 0 &&
        mode === "supabase" &&
        appServices.capabilities.matches === "supabase" &&
        appServices.capabilities.chat === "supabase" &&
        profile?.id &&
        userId &&
        profile.id === userId
      ) {
        const targetProfileId = toBackendProfileId(profileId);
        if (isBackendProfileId(targetProfileId)) {
          void appServices.matches.listMatches(userId).then((matchResult) => {
            if (!matchResult.ok) {
              console.log("[profile-provider] backend mark read match lookup failed", {
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
            if (!match) return;

            void appServices.chat.markRead(match.id, userId, readThrough).then(
              (result) => {
                if (!result.ok) {
                  console.log("[profile-provider] backend mark read failed", {
                    code: result.error.code,
                    message: result.error.message,
                  });
                }
              }
            );
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
    [
      appServices,
      conversations,
      mode,
      profile?.id,
      saveConvosMutation,
      userId,
    ]
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

  const getProfileById = useCallback(
    (profileId: string) => {
      const profile =
        knownProfiles.find((item) => item.id === profileId) ??
        knownProfilesRef.current.find((item) => item.id === profileId) ??
        displayProfilesRef.current[profileId] ??
        lastResolvedProfilesRef.current[profileId] ??
        MOCK_PROFILES.find((item) => item.id === profileId);
      if (isIncompleteBackendProfile(profile)) return undefined;
      if (profile) {
        lastResolvedProfilesRef.current = {
          ...lastResolvedProfilesRef.current,
          [profile.id]: profile,
        };
      }
      return profile;
    },
    [knownProfiles]
  );

  const getConversation = useCallback(
    (profileId: string) =>
      conversations.find((conversation) => conversation.profileId === profileId),
    [conversations]
  );

  const hasActiveMatch = useCallback(
    (profileId: string) => likedIds.includes(profileId),
    [likedIds]
  );

  const rawMatchedProfiles = useMemo(
    () =>
      likedIds
        .map((profileId) => getProfileById(profileId))
        .filter((item): item is Profile => !!item),
    [getProfileById, likedIds]
  );
  const matchedProfiles = useTransientEmptyList(rawMatchedProfiles, !!profile);

  const rawInboxItems = useMemo(
    () =>
      conversations
        .map<InboxListItem | null>((conversation) => {
          const other = getProfileById(conversation.profileId);
          if (!other) return null;
          const messages = Array.isArray(conversation.messages)
            ? conversation.messages
            : [];
          const lastMessage = messages[messages.length - 1] ?? null;
          return {
            conversation: { ...conversation, messages },
            other,
            lastMessage,
          };
        })
        .filter((item): item is InboxListItem => !!item)
        .sort((a, b) => {
          const aTime = a.lastMessage?.at ?? 0;
          const bTime = b.lastMessage?.at ?? 0;
          return bTime - aTime;
        }),
    [conversations, getProfileById]
  );
  const inboxItems = useTransientEmptyList(rawInboxItems, !!profile);

  const newMatchCount = useMemo(() => newMatchIds.length, [newMatchIds]);

  const unreadMessageCount = useMemo(
    () =>
      conversations.reduce(
        (total, conversation) => total + Math.max(0, conversation.unread),
        0
      ),
    [conversations]
  );

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
      refreshBackendMatches,
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
      refreshBackendMatches,
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

import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MOCK_PROFILES } from "@/mocks/profiles";
import {
  BOOST_DURATION_MS,
  Conversation,
  DEFAULT_MATCH_SLOTS,
  DEFAULT_SUPER_LIKES,
  LinkedPartner,
  Message,
  Profile,
  PurchaseId,
  SUBSCRIPTION_OPTIONS,
  SUPER_LIKE_RECHARGE_MS,
  SubscriptionId,
} from "@/types";

function makeInviteCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

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

export interface SubscriptionState {
  id: SubscriptionId;
  startedAt: number;
  renewsAt: number;
  lastGrantAt: number;
}

interface Stored {
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
}

async function loadAll(): Promise<Stored> {
  try {
    const [p, c, l, s, sl, es, b, slb, slu, sub] = await Promise.all([
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
    };
  } catch (e) {
    console.log("[profile-provider] load error", e);
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
    };
  }
}

export const [ProfileProvider, useProfile] = createContextHook(() => {
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

  const loadQuery = useQuery({
    queryKey: ["duet-storage"],
    queryFn: loadAll,
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
    mutationFn: async (p: Profile | null) => {
      if (p) await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
      else await AsyncStorage.removeItem(PROFILE_KEY);
      return p;
    },
  });

  const saveConvosMutation = useMutation({
    mutationFn: async (c: Conversation[]) => {
      await AsyncStorage.setItem(CONVOS_KEY, JSON.stringify(c));
      return c;
    },
  });

  const saveLikesMutation = useMutation({
    mutationFn: async (v: string[]) => {
      await AsyncStorage.setItem(LIKES_KEY, JSON.stringify(v));
      return v;
    },
  });

  const savePassesMutation = useMutation({
    mutationFn: async (v: string[]) => {
      await AsyncStorage.setItem(PASSES_KEY, JSON.stringify(v));
      return v;
    },
  });

  const saveSuperLikesMutation = useMutation({
    mutationFn: async (v: string[]) => {
      await AsyncStorage.setItem(SUPERLIKES_KEY, JSON.stringify(v));
      return v;
    },
  });

  const saveExtraSlotsMutation = useMutation({
    mutationFn: async (v: number) => {
      await AsyncStorage.setItem(EXTRA_SLOTS_KEY, JSON.stringify(v));
      return v;
    },
  });

  const saveBoostMutation = useMutation({
    mutationFn: async (v: number | null) => {
      if (v === null) await AsyncStorage.removeItem(BOOST_KEY);
      else await AsyncStorage.setItem(BOOST_KEY, JSON.stringify(v));
      return v;
    },
  });

  const saveSuperLikeBalanceMutation = useMutation({
    mutationFn: async (v: number) => {
      await AsyncStorage.setItem(SUPERLIKE_BALANCE_KEY, JSON.stringify(v));
      return v;
    },
  });

  const saveSuperLikeLastUseMutation = useMutation({
    mutationFn: async (v: number | null) => {
      if (v === null) await AsyncStorage.removeItem(SUPERLIKE_LAST_USE_KEY);
      else
        await AsyncStorage.setItem(
          SUPERLIKE_LAST_USE_KEY,
          JSON.stringify(v)
        );
      return v;
    },
  });

  const saveSubscriptionMutation = useMutation({
    mutationFn: async (v: SubscriptionState | null) => {
      if (v === null) await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
      else await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(v));
      return v;
    },
  });

  const completeOnboarding = useCallback(
    (p: Profile) => {
      console.log("[profile-provider] completeOnboarding", p.id);
      setProfile(p);
      saveProfileMutation.mutate(p);
    },
    [saveProfileMutation]
  );

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const next: Profile = { ...prev, ...patch };
        saveProfileMutation.mutate(next);
        return next;
      });
    },
    [saveProfileMutation]
  );

  const signOut = useCallback(() => {
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

  const totalSlots = DEFAULT_MATCH_SLOTS + extraSlots;
  const slotsUsed = likedIds.length;
  const slotsRemaining = Math.max(0, totalSlots - slotsUsed);
  const isAtMatchLimit = slotsRemaining <= 0;

  const likeProfile = useCallback(
    (id: string): { ok: boolean; reason?: "limit" } => {
      if (likedIds.includes(id)) return { ok: true };
      if (slotsUsed >= totalSlots) {
        console.log("[profile-provider] like blocked: match limit");
        return { ok: false, reason: "limit" };
      }

      setLikedIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        saveLikesMutation.mutate(next);
        return next;
      });

      setConversations((prev) => {
        if (prev.find((c) => c.profileId === id)) return prev;
        const other = MOCK_PROFILES.find((p) => p.id === id);
        if (!other) return prev;
        const greeting: Message = {
          id: `m-${Date.now()}`,
          fromMe: false,
          authorName: other.people[0]?.name,
          text:
            other.accountType === "couple"
              ? `Hey! ${other.people[0]?.name} & ${other.people[1]?.name} here. Loved your profile \u2014 how's your week going?`
              : `Hi! I really liked your profile. What brings you to Orchard?`,
          at: Date.now(),
        };
        const convo: Conversation = {
          id: `c-${id}`,
          profileId: id,
          messages: [greeting],
          unread: 1,
        };
        const next = [convo, ...prev];
        saveConvosMutation.mutate(next);
        return next;
      });

      return { ok: true };
    },
    [likedIds, slotsUsed, totalSlots, saveLikesMutation, saveConvosMutation]
  );

  const unmatch = useCallback(
    (id: string) => {
      setLikedIds((prev) => {
        const next = prev.filter((x) => x !== id);
        saveLikesMutation.mutate(next);
        return next;
      });
      setConversations((prev) => {
        const next = prev.filter((c) => c.profileId !== id);
        saveConvosMutation.mutate(next);
        return next;
      });
    },
    [saveLikesMutation, saveConvosMutation]
  );

  const superLikeProfile = useCallback(
    (id: string): { ok: boolean; reason?: "limit" | "superlikes" } => {
      if (superLikedIds.includes(id) && likedIds.includes(id)) return { ok: true };
      if (!likedIds.includes(id) && slotsUsed >= totalSlots) {
        console.log("[profile-provider] superLike blocked: match limit");
        return { ok: false, reason: "limit" };
      }
      if (superLikeBalance <= 0) {
        console.log("[profile-provider] superLike blocked: no balance");
        return { ok: false, reason: "superlikes" };
      }

      const nextBalance = superLikeBalance - 1;
      setSuperLikeBalance(nextBalance);
      saveSuperLikeBalanceMutation.mutate(nextBalance);
      const now = Date.now();
      setSuperLikeLastUseAt(now);
      saveSuperLikeLastUseMutation.mutate(now);

      setSuperLikedIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        saveSuperLikesMutation.mutate(next);
        return next;
      });

      setLikedIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        saveLikesMutation.mutate(next);
        return next;
      });

      setConversations((prev) => {
        if (prev.find((c) => c.profileId === id)) return prev;
        const other = MOCK_PROFILES.find((p) => p.id === id);
        if (!other) return prev;
        const greeting: Message = {
          id: `m-${Date.now()}`,
          fromMe: false,
          authorName: other.people[0]?.name,
          text:
            other.accountType === "couple"
              ? `Whoa, a super like! ${other.people[0]?.name} & ${other.people[1]?.name} here \u2014 you definitely caught our eye.`
              : `A super like?! You've got my attention. What's your story?`,
          at: Date.now(),
        };
        const convo: Conversation = {
          id: `c-${id}`,
          profileId: id,
          messages: [greeting],
          unread: 1,
        };
        const next = [convo, ...prev];
        saveConvosMutation.mutate(next);
        return next;
      });

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
    ]
  );

  const passProfile = useCallback(
    (id: string) => {
      setPassedIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        savePassesMutation.mutate(next);
        return next;
      });
    },
    [savePassesMutation]
  );

  const sendMessage = useCallback(
    (profileId: string, text: string, authorName?: string) => {
      console.log("[profile-provider] sendMessage", { profileId, length: text.length });
      setConversations((prev) => {
        const msg: Message = {
          id: `m-${Date.now()}`,
          fromMe: true,
          authorName,
          text,
          at: Date.now(),
          kind: "text",
        };
        const exists = prev.find((c) => c.profileId === profileId);
        let next: Conversation[];
        if (exists) {
          next = prev.map((c) =>
            c.profileId === profileId
              ? { ...c, messages: [...c.messages, msg] }
              : c
          );
        } else {
          console.log(
            "[profile-provider] sendMessage: creating missing convo",
            profileId
          );
          const convo: Conversation = {
            id: `c-${profileId}`,
            profileId,
            messages: [msg],
            unread: 0,
          };
          next = [convo, ...prev];
        }
        saveConvosMutation.mutate(next);
        return next;
      });

      const other = MOCK_PROFILES.find((p) => p.id === profileId);
      if (!other) return;
      const replies = [
        `Ha, love that — tell me more!`,
        `Okay that's a vibe. What's your go-to weekend move?`,
        `Totally feel you. Coffee or cocktails first?`,
        `You're funny. What are you up to this week?`,
        `Same energy. Favorite spot in ${other.location.city}?`,
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const delay = 1800 + Math.floor(Math.random() * 2500);
      setTimeout(() => {
        setConversations((prev) => {
          const replyMsg: Message = {
            id: `m-${Date.now()}-r`,
            fromMe: false,
            authorName: other.people[0]?.name,
            text: reply,
            at: Date.now(),
            kind: "text",
          };
          const next = prev.map((c) =>
            c.profileId === profileId
              ? { ...c, messages: [...c.messages, replyMsg], unread: c.unread + 1 }
              : c
          );
          saveConvosMutation.mutate(next);
          return next;
        });
      }, delay);
    },
    [saveConvosMutation]
  );

  const deleteMessage = useCallback(
    (profileId: string, messageId: string) => {
      console.log("[profile-provider] deleteMessage", { profileId, messageId });
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.profileId === profileId
            ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
            : c
        );
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
      const msgId = `m-${Date.now()}`;
      setConversations((prev) => {
        const msg: Message = {
          id: msgId,
          fromMe: true,
          authorName,
          text: "Photo request",
          at: Date.now(),
          kind: "photo",
          photoUri,
          photoStatus: "pending",
        };
        const exists = prev.find((c) => c.profileId === profileId);
        let next: Conversation[];
        if (exists) {
          next = prev.map((c) =>
            c.profileId === profileId
              ? { ...c, messages: [...c.messages, msg] }
              : c
          );
        } else {
          const convo: Conversation = {
            id: `c-${profileId}`,
            profileId,
            messages: [msg],
            unread: 0,
          };
          next = [convo, ...prev];
        }
        saveConvosMutation.mutate(next);
        return next;
      });

      const delay = 2500 + Math.floor(Math.random() * 3500);
      setTimeout(() => {
        console.log("[profile-provider] simulated photo approval", msgId);
        setConversations((prev) => {
          const next = prev.map((c) =>
            c.profileId === profileId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === msgId && m.photoStatus === "pending"
                      ? { ...m, photoStatus: "approved" as const }
                      : m
                  ),
                }
              : c
          );
          saveConvosMutation.mutate(next);
          return next;
        });
      }, delay);
    },
    [saveConvosMutation]
  );

  const respondToPhoto = useCallback(
    (profileId: string, messageId: string, decision: "approved" | "declined") => {
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.profileId === profileId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId && m.kind === "photo"
                    ? { ...m, photoStatus: decision }
                    : m
                ),
              }
            : c
        );
        saveConvosMutation.mutate(next);
        return next;
      });
    },
    [saveConvosMutation]
  );

  const markRead = useCallback(
    (profileId: string) => {
      setConversations((prev) => {
        const next = prev.map((c) =>
          c.profileId === profileId ? { ...c, unread: 0 } : c
        );
        saveConvosMutation.mutate(next);
        return next;
      });
    },
    [saveConvosMutation]
  );

  const purchase = useCallback(
    (id: PurchaseId) => {
      console.log("[profile-provider] purchase", id);
      if (id === "slots_5") {
        setExtraSlots((v) => {
          const n = v + 5;
          saveExtraSlotsMutation.mutate(n);
          return n;
        });
      } else if (id === "slots_15") {
        setExtraSlots((v) => {
          const n = v + 15;
          saveExtraSlotsMutation.mutate(n);
          return n;
        });
      } else if (id === "boost") {
        const until = Date.now() + BOOST_DURATION_MS;
        setBoostedUntil(until);
        saveBoostMutation.mutate(until);
      } else if (id === "superlikes_refill") {
        setSuperLikeBalance((v) => {
          const n = Math.max(v, DEFAULT_SUPER_LIKES);
          saveSuperLikeBalanceMutation.mutate(n);
          return n;
        });
        setSuperLikeLastUseAt(null);
        saveSuperLikeLastUseMutation.mutate(null);
      } else if (id === "superlikes_10") {
        setSuperLikeBalance((v) => {
          const n = v + 10;
          saveSuperLikeBalanceMutation.mutate(n);
          return n;
        });
      }
    },
    [
      saveExtraSlotsMutation,
      saveBoostMutation,
      saveSuperLikeBalanceMutation,
      saveSuperLikeLastUseMutation,
    ]
  );

  const subscribe = useCallback(
    (id: SubscriptionId) => {
      console.log("[profile-provider] subscribe", id);
      const plan = SUBSCRIPTION_OPTIONS.find((o) => o.id === id);
      if (!plan) return;
      const now = Date.now();
      const renews = now + 30 * 24 * 60 * 60 * 1000;
      const next: SubscriptionState = {
        id,
        startedAt: now,
        renewsAt: renews,
        lastGrantAt: now,
      };
      setSubscription(next);
      saveSubscriptionMutation.mutate(next);

      setExtraSlots((v) => {
        const n = v + plan.monthlySlots;
        saveExtraSlotsMutation.mutate(n);
        return n;
      });
      setSuperLikeBalance((v) => {
        const n = v + plan.monthlySuperLikes;
        saveSuperLikeBalanceMutation.mutate(n);
        return n;
      });
      if (plan.includesBoost) {
        const until = now + BOOST_DURATION_MS;
        setBoostedUntil(until);
        saveBoostMutation.mutate(until);
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
        if (!prev) return prev;
        const lp: LinkedPartner = {
          id: `lp-${Date.now()}`,
          email: email.trim(),
          displayName,
          inviteCode: makeInviteCode(),
          status: "pending",
          invitedAt: Date.now(),
          role: "partner",
        };
        const next: Profile = {
          ...prev,
          linkedPartners: [...(prev.linkedPartners ?? []), lp],
        };
        saveProfileMutation.mutate(next);
        return next;
      });
    },
    [saveProfileMutation]
  );

  const resendPartnerInvite = useCallback(
    (partnerId: string) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const linked = (prev.linkedPartners ?? []).map((lp) =>
          lp.id === partnerId
            ? { ...lp, inviteCode: makeInviteCode(), invitedAt: Date.now() }
            : lp
        );
        const next: Profile = { ...prev, linkedPartners: linked };
        saveProfileMutation.mutate(next);
        return next;
      });
    },
    [saveProfileMutation]
  );

  const acceptPartnerLink = useCallback(
    (partnerId: string) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const linked = (prev.linkedPartners ?? []).map((lp) =>
          lp.id === partnerId
            ? { ...lp, status: "linked" as const, linkedAt: Date.now() }
            : lp
        );
        const next: Profile = { ...prev, linkedPartners: linked };
        saveProfileMutation.mutate(next);
        return next;
      });
    },
    [saveProfileMutation]
  );

  const removePartnerLink = useCallback(
    (partnerId: string) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const linked = (prev.linkedPartners ?? []).filter(
          (lp) => lp.id !== partnerId
        );
        const next: Profile = {
          ...prev,
          linkedPartners: linked.length > 0 ? linked : undefined,
        };
        saveProfileMutation.mutate(next);
        return next;
      });
    },
    [saveProfileMutation]
  );

  const isBoosted = useMemo(() => {
    if (!boostedUntil) return false;
    return boostedUntil > Date.now();
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

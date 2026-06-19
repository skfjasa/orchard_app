import {
  BOOST_DURATION_MS,
  DEFAULT_SUPER_LIKES,
  PurchaseId,
  SUBSCRIPTION_OPTIONS,
  SubscriptionId,
} from "@/types";

import type { SubscriptionState } from "./local-profile-storage";

export interface LocalPurchaseResult {
  extraSlotsDelta?: number;
  boostedUntil?: number;
  superLikeBalance?: number;
  superLikeBalanceDelta?: number;
  superLikeLastUseAt?: number | null;
}

export interface LocalSubscriptionResult {
  subscription: SubscriptionState;
  extraSlotsDelta: number;
  superLikeBalanceDelta: number;
  boostedUntil?: number;
}

export function applyLocalPurchase(
  id: PurchaseId,
  currentSuperLikeBalance: number,
  now = Date.now()
): LocalPurchaseResult {
  if (id === "slots_5") {
    return { extraSlotsDelta: 5 };
  }
  if (id === "slots_15") {
    return { extraSlotsDelta: 15 };
  }
  if (id === "boost") {
    return { boostedUntil: now + BOOST_DURATION_MS };
  }
  if (id === "superlikes_refill") {
    return {
      superLikeBalance: Math.max(currentSuperLikeBalance, DEFAULT_SUPER_LIKES),
      superLikeLastUseAt: null,
    };
  }
  if (id === "superlikes_10") {
    return { superLikeBalanceDelta: 10 };
  }
  return {};
}

export function createLocalSubscription(
  id: SubscriptionId,
  now = Date.now()
): LocalSubscriptionResult | null {
  const plan = SUBSCRIPTION_OPTIONS.find((option) => option.id === id);
  if (!plan) return null;

  const subscription: SubscriptionState = {
    id,
    startedAt: now,
    renewsAt: now + 30 * 24 * 60 * 60 * 1000,
    lastGrantAt: now,
  };

  return {
    subscription,
    extraSlotsDelta: plan.monthlySlots,
    superLikeBalanceDelta: plan.monthlySuperLikes,
    boostedUntil: plan.includesBoost ? now + BOOST_DURATION_MS : undefined,
  };
}

export function isLocalBoostActive(boostedUntil: number | null, now = Date.now()) {
  if (!boostedUntil) return false;
  return boostedUntil > now;
}

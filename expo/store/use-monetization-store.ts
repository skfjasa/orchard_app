import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  BOOST_KEY,
  EXTRA_SLOTS_KEY,
  SUBSCRIPTION_KEY,
  SUPERLIKE_BALANCE_KEY,
  SUPERLIKE_LAST_USE_KEY,
  type SubscriptionState,
} from "@/services/local-profile-storage";
import { DEFAULT_SUPER_LIKES } from "@/types";

type Updater<T> = T | ((current: T) => T);

interface MonetizationStoreState {
  extraSlots: number;
  boostedUntil: number | null;
  superLikeBalance: number;
  superLikeLastUseAt: number | null;
  subscription: SubscriptionState | null;
  hydrateMonetization(
    extraSlots: number,
    boostedUntil: number | null,
    superLikeBalance: number,
    superLikeLastUseAt: number | null,
    subscription: SubscriptionState | null
  ): void;
  resetMonetization(): void;
  setExtraSlots(extraSlots: Updater<number>): void;
  setBoostedUntil(boostedUntil: number | null): void;
  setSuperLikeBalance(superLikeBalance: Updater<number>): void;
  setSuperLikeLastUseAt(superLikeLastUseAt: number | null): void;
  setSubscription(subscription: SubscriptionState | null): void;
}

function resolveValue<T>(next: Updater<T>, current: T): T {
  return typeof next === "function" ? (next as (value: T) => T)(current) : next;
}

function createMonetizationStorage<
  StateKey extends keyof MonetizationStoreState,
>(storageKey: string, stateKey: StateKey, removeNull = false) {
  return {
    getItem: async () => {
      const value = await AsyncStorage.getItem(storageKey);
      if (!value) return null;
      return {
        state: {
          [stateKey]: JSON.parse(value),
        } as Pick<MonetizationStoreState, StateKey>,
      };
    },
    setItem: async (
      _name: string,
      value: { state: Pick<MonetizationStoreState, StateKey> }
    ) => {
      const nextValue = value.state[stateKey];
      if (removeNull && nextValue === null) {
        await AsyncStorage.removeItem(storageKey);
        return;
      }
      await AsyncStorage.setItem(storageKey, JSON.stringify(nextValue));
    },
    removeItem: async () => {
      await AsyncStorage.removeItem(storageKey);
    },
  };
}

const useExtraSlotsStore = create<
  Pick<MonetizationStoreState, "extraSlots" | "setExtraSlots">
>()(
  persist(
    (set) => ({
      extraSlots: 0,
      setExtraSlots: (extraSlots) =>
        set((state) => ({
          extraSlots: resolveValue(extraSlots, state.extraSlots),
        })),
    }),
    {
      name: EXTRA_SLOTS_KEY,
      storage: createMonetizationStorage(EXTRA_SLOTS_KEY, "extraSlots"),
    }
  )
);

const useBoostedUntilStore = create<
  Pick<MonetizationStoreState, "boostedUntil" | "setBoostedUntil">
>()(
  persist(
    (set) => ({
      boostedUntil: null,
      setBoostedUntil: (boostedUntil) => set({ boostedUntil }),
    }),
    {
      name: BOOST_KEY,
      storage: createMonetizationStorage(BOOST_KEY, "boostedUntil", true),
    }
  )
);

const useSuperLikeBalanceStore = create<
  Pick<MonetizationStoreState, "superLikeBalance" | "setSuperLikeBalance">
>()(
  persist(
    (set) => ({
      superLikeBalance: DEFAULT_SUPER_LIKES,
      setSuperLikeBalance: (superLikeBalance) =>
        set((state) => ({
          superLikeBalance: resolveValue(
            superLikeBalance,
            state.superLikeBalance
          ),
        })),
    }),
    {
      name: SUPERLIKE_BALANCE_KEY,
      storage: createMonetizationStorage(
        SUPERLIKE_BALANCE_KEY,
        "superLikeBalance"
      ),
    }
  )
);

const useSuperLikeLastUseAtStore = create<
  Pick<MonetizationStoreState, "superLikeLastUseAt" | "setSuperLikeLastUseAt">
>()(
  persist(
    (set) => ({
      superLikeLastUseAt: null,
      setSuperLikeLastUseAt: (superLikeLastUseAt) =>
        set({ superLikeLastUseAt }),
    }),
    {
      name: SUPERLIKE_LAST_USE_KEY,
      storage: createMonetizationStorage(
        SUPERLIKE_LAST_USE_KEY,
        "superLikeLastUseAt",
        true
      ),
    }
  )
);

const useSubscriptionStore = create<
  Pick<MonetizationStoreState, "subscription" | "setSubscription">
>()(
  persist(
    (set) => ({
      subscription: null,
      setSubscription: (subscription) => set({ subscription }),
    }),
    {
      name: SUBSCRIPTION_KEY,
      storage: createMonetizationStorage(
        SUBSCRIPTION_KEY,
        "subscription",
        true
      ),
    }
  )
);

export function useMonetizationStore(): MonetizationStoreState {
  const extraSlots = useExtraSlotsStore((state) => state.extraSlots);
  const setExtraSlots = useExtraSlotsStore((state) => state.setExtraSlots);
  const boostedUntil = useBoostedUntilStore((state) => state.boostedUntil);
  const setBoostedUntil = useBoostedUntilStore(
    (state) => state.setBoostedUntil
  );
  const superLikeBalance = useSuperLikeBalanceStore(
    (state) => state.superLikeBalance
  );
  const setSuperLikeBalance = useSuperLikeBalanceStore(
    (state) => state.setSuperLikeBalance
  );
  const superLikeLastUseAt = useSuperLikeLastUseAtStore(
    (state) => state.superLikeLastUseAt
  );
  const setSuperLikeLastUseAt = useSuperLikeLastUseAtStore(
    (state) => state.setSuperLikeLastUseAt
  );
  const subscription = useSubscriptionStore((state) => state.subscription);
  const setSubscription = useSubscriptionStore(
    (state) => state.setSubscription
  );

  return {
    boostedUntil,
    extraSlots,
    superLikeBalance,
    superLikeLastUseAt,
    subscription,
    hydrateMonetization(
      nextExtraSlots,
      nextBoostedUntil,
      nextSuperLikeBalance,
      nextSuperLikeLastUseAt,
      nextSubscription
    ) {
      setExtraSlots(nextExtraSlots);
      setBoostedUntil(nextBoostedUntil);
      setSuperLikeBalance(nextSuperLikeBalance);
      setSuperLikeLastUseAt(nextSuperLikeLastUseAt);
      setSubscription(nextSubscription);
    },
    resetMonetization() {
      setExtraSlots(0);
      setBoostedUntil(null);
      setSuperLikeBalance(DEFAULT_SUPER_LIKES);
      setSuperLikeLastUseAt(null);
      setSubscription(null);
    },
    setBoostedUntil,
    setExtraSlots,
    setSubscription,
    setSuperLikeBalance,
    setSuperLikeLastUseAt,
  };
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  LIKES_KEY,
  PASSES_KEY,
  SUPERLIKES_KEY,
} from "@/services/local-profile-storage";

type InteractionIds = string[];
type InteractionIdsUpdater =
  | InteractionIds
  | ((current: InteractionIds) => InteractionIds);

interface InteractionStoreState {
  likedIds: InteractionIds;
  passedIds: InteractionIds;
  superLikedIds: InteractionIds;
  hydrateInteractions(
    likedIds: InteractionIds,
    passedIds: InteractionIds,
    superLikedIds: InteractionIds
  ): void;
  setLikedIds(likedIds: InteractionIdsUpdater): void;
  setPassedIds(passedIds: InteractionIdsUpdater): void;
  setSuperLikedIds(superLikedIds: InteractionIdsUpdater): void;
  resetInteractions(): void;
}

function resolveIds(
  next: InteractionIdsUpdater,
  current: InteractionIds
): InteractionIds {
  return typeof next === "function" ? next(current) : next;
}

function createInteractionStorage<StateKey extends keyof InteractionStoreState>(
  storageKey: string,
  stateKey: StateKey
) {
  return {
    getItem: async () => {
      const value = await AsyncStorage.getItem(storageKey);
      if (!value) return null;
      return {
        state: {
          [stateKey]: JSON.parse(value) as InteractionIds,
        } as Pick<InteractionStoreState, StateKey>,
      };
    },
    setItem: async (
      _name: string,
      value: { state: Pick<InteractionStoreState, StateKey> }
    ) => {
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify(value.state[stateKey])
      );
    },
    removeItem: async () => {
      await AsyncStorage.removeItem(storageKey);
    },
  };
}

const useLikedIdsStore = create<
  Pick<InteractionStoreState, "likedIds" | "setLikedIds">
>()(
  persist(
    (set) => ({
      likedIds: [],
      setLikedIds: (likedIds) =>
        set((state) => {
          const next = resolveIds(likedIds, state.likedIds);
          return next === state.likedIds ? state : { likedIds: next };
        }),
    }),
    {
      name: LIKES_KEY,
      storage: createInteractionStorage(LIKES_KEY, "likedIds"),
    }
  )
);

const usePassedIdsStore = create<
  Pick<InteractionStoreState, "passedIds" | "setPassedIds">
>()(
  persist(
    (set) => ({
      passedIds: [],
      setPassedIds: (passedIds) =>
        set((state) => {
          const next = resolveIds(passedIds, state.passedIds);
          return next === state.passedIds ? state : { passedIds: next };
        }),
    }),
    {
      name: PASSES_KEY,
      storage: createInteractionStorage(PASSES_KEY, "passedIds"),
    }
  )
);

const useSuperLikedIdsStore = create<
  Pick<InteractionStoreState, "superLikedIds" | "setSuperLikedIds">
>()(
  persist(
    (set) => ({
      superLikedIds: [],
      setSuperLikedIds: (superLikedIds) =>
        set((state) => {
          const next = resolveIds(superLikedIds, state.superLikedIds);
          return next === state.superLikedIds
            ? state
            : { superLikedIds: next };
        }),
    }),
    {
      name: SUPERLIKES_KEY,
      storage: createInteractionStorage(SUPERLIKES_KEY, "superLikedIds"),
    }
  )
);

export function useInteractionStore(): InteractionStoreState {
  const likedIds = useLikedIdsStore((state) => state.likedIds);
  const setLikedIds = useLikedIdsStore((state) => state.setLikedIds);
  const passedIds = usePassedIdsStore((state) => state.passedIds);
  const setPassedIds = usePassedIdsStore((state) => state.setPassedIds);
  const superLikedIds = useSuperLikedIdsStore(
    (state) => state.superLikedIds
  );
  const setSuperLikedIds = useSuperLikedIdsStore(
    (state) => state.setSuperLikedIds
  );

  return {
    likedIds,
    passedIds,
    superLikedIds,
    hydrateInteractions(nextLikedIds, nextPassedIds, nextSuperLikedIds) {
      setLikedIds(nextLikedIds);
      setPassedIds(nextPassedIds);
      setSuperLikedIds(nextSuperLikedIds);
    },
    setLikedIds,
    setPassedIds,
    setSuperLikedIds,
    resetInteractions() {
      setLikedIds([]);
      setPassedIds([]);
      setSuperLikedIds([]);
    },
  };
}

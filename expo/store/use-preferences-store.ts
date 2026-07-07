import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  READ_WATERMARKS_KEY,
  SEEN_MATCHES_KEY,
} from "@/services/local-profile-storage";

type ReadWatermarks = Record<string, Record<string, number>>;
type SeenMatchIds = Record<string, string[]>;

interface PreferencesStoreState {
  readWatermarks: ReadWatermarks;
  seenMatchIds: SeenMatchIds;
  hydratePreferences(
    readWatermarks: ReadWatermarks,
    seenMatchIds: SeenMatchIds
  ): void;
  setReadWatermarks(readWatermarks: ReadWatermarks): void;
  setSeenMatchIds(seenMatchIds: SeenMatchIds): void;
}

const readWatermarksStorage = {
  getItem: async () => {
    const value = await AsyncStorage.getItem(READ_WATERMARKS_KEY);
    if (!value) return null;
    return {
      state: {
        readWatermarks: JSON.parse(value) as ReadWatermarks,
      },
    };
  },
  setItem: async (
    _name: string,
    value: { state: Pick<PreferencesStoreState, "readWatermarks"> }
  ) => {
    await AsyncStorage.setItem(
      READ_WATERMARKS_KEY,
      JSON.stringify(value.state.readWatermarks)
    );
  },
  removeItem: async () => {
    await AsyncStorage.removeItem(READ_WATERMARKS_KEY);
  },
};

const seenMatchIdsStorage = {
  getItem: async () => {
    const value = await AsyncStorage.getItem(SEEN_MATCHES_KEY);
    if (!value) return null;
    return {
      state: {
        seenMatchIds: JSON.parse(value) as SeenMatchIds,
      },
    };
  },
  setItem: async (
    _name: string,
    value: { state: Pick<PreferencesStoreState, "seenMatchIds"> }
  ) => {
    await AsyncStorage.setItem(
      SEEN_MATCHES_KEY,
      JSON.stringify(value.state.seenMatchIds)
    );
  },
  removeItem: async () => {
    await AsyncStorage.removeItem(SEEN_MATCHES_KEY);
  },
};

const useReadWatermarksStore = create<
  Pick<PreferencesStoreState, "readWatermarks" | "setReadWatermarks">
>()(
  persist(
    (set) => ({
      readWatermarks: {},
      setReadWatermarks: (readWatermarks) => set({ readWatermarks }),
    }),
    {
      name: READ_WATERMARKS_KEY,
      storage: readWatermarksStorage,
    }
  )
);

const useSeenMatchIdsStore = create<
  Pick<PreferencesStoreState, "seenMatchIds" | "setSeenMatchIds">
>()(
  persist(
    (set) => ({
      seenMatchIds: {},
      setSeenMatchIds: (seenMatchIds) => set({ seenMatchIds }),
    }),
    {
      name: SEEN_MATCHES_KEY,
      storage: seenMatchIdsStorage,
    }
  )
);

export function usePreferencesStore(): PreferencesStoreState {
  const readWatermarks = useReadWatermarksStore((state) => state.readWatermarks);
  const setReadWatermarks = useReadWatermarksStore(
    (state) => state.setReadWatermarks
  );
  const seenMatchIds = useSeenMatchIdsStore((state) => state.seenMatchIds);
  const setSeenMatchIds = useSeenMatchIdsStore((state) => state.setSeenMatchIds);

  return {
    readWatermarks,
    seenMatchIds,
    hydratePreferences(nextReadWatermarks, nextSeenMatchIds) {
      setReadWatermarks(nextReadWatermarks);
      setSeenMatchIds(nextSeenMatchIds);
    },
    setReadWatermarks,
    setSeenMatchIds,
  };
}

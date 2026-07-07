import { create } from "zustand";

type DraftsByProfileId = Record<string, string>;
type TypingProfileIds = string[];
type TypingProfileIdsUpdater =
  | TypingProfileIds
  | ((current: TypingProfileIds) => TypingProfileIds);

interface ChatUiStoreState {
  drafts: DraftsByProfileId;
  typingProfileIds: TypingProfileIds;
  setDraft(profileId: string, text: string): void;
  setTypingProfileIds(typingProfileIds: TypingProfileIdsUpdater): void;
}

function resolveTypingProfileIds(
  next: TypingProfileIdsUpdater,
  current: TypingProfileIds
): TypingProfileIds {
  return typeof next === "function" ? next(current) : next;
}

export const useChatUiStore = create<ChatUiStoreState>((set) => ({
  drafts: {},
  typingProfileIds: [],
  setDraft: (profileId, text) =>
    set((state) => {
      if ((state.drafts[profileId] ?? "") === text) return state;
      return {
        drafts: {
          ...state.drafts,
          [profileId]: text,
        },
      };
    }),
  setTypingProfileIds: (typingProfileIds) =>
    set((state) => {
      const next = resolveTypingProfileIds(
        typingProfileIds,
        state.typingProfileIds
      );
      return next === state.typingProfileIds
        ? state
        : { typingProfileIds: next };
    }),
}));

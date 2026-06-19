import { MOCK_PROFILES } from "@/mocks/profiles";
import type { MatchRecord } from "@/services";
import type { Conversation, Message, Profile } from "@/types";

export interface MockSwipeRecord {
  swiperId: string;
  targetId: string;
  decision: "like" | "pass" | "super_like";
  createdAt: number;
}

export interface MockReportRecord {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportedMessageId?: string;
  reason: string;
  details?: string;
  createdAt: number;
}

export interface MockServiceState {
  currentProfile: Profile | null;
  profiles: Profile[];
  swipes: MockSwipeRecord[];
  matches: MatchRecord[];
  conversations: Record<string, Conversation>;
  blocks: { blockerId: string; blockedId: string; createdAt: number }[];
  reports: MockReportRecord[];
  uploads: { storagePath: string; localUri: string; createdAt: number }[];
  analyticsEvents: { eventName: string; properties?: Record<string, unknown> }[];
  hiddenProfileIds: string[];
}

export function createMockServiceState(
  currentProfile: Profile | null = null
): MockServiceState {
  return {
    currentProfile,
    profiles: [...MOCK_PROFILES],
    swipes: [],
    matches: [],
    conversations: {},
    blocks: [],
    reports: [],
    uploads: [],
    analyticsEvents: [],
    hiddenProfileIds: [],
  };
}

export function findProfile(
  state: MockServiceState,
  profileId: string
): Profile | undefined {
  if (state.currentProfile?.id === profileId) return state.currentProfile;
  return state.profiles.find((profile) => profile.id === profileId);
}

export function isBlockedPair(
  state: MockServiceState,
  userA: string,
  userB: string
): boolean {
  return state.blocks.some(
    (block) =>
      (block.blockerId === userA && block.blockedId === userB) ||
      (block.blockerId === userB && block.blockedId === userA)
  );
}

export function makeMessage(input: {
  id?: string;
  fromMe: boolean;
  text: string;
  authorName?: string;
}): Message {
  return {
    id: input.id ?? `mock-message-${Date.now()}`,
    fromMe: input.fromMe,
    authorName: input.authorName,
    text: input.text,
    at: Date.now(),
    kind: "text",
  };
}

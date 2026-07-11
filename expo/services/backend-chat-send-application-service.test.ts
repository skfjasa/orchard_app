import { describe, expect, test } from "bun:test";

import type { Conversation } from "@/types";

import { applyBackendChatSendResult } from "./backend-chat-send-application-service";

const TARGET_ID = "target-profile";
const OTHER_ID = "other-profile";

function createState() {
  let likedIds = [TARGET_ID, OTHER_ID];
  let conversations: Conversation[] = [
    {
      id: "target-conversation",
      profileId: TARGET_ID,
      messages: [
        { id: "old-target-message", fromMe: false, text: "old", at: 1 },
      ],
      unread: 0,
    },
    {
      id: "other-conversation",
      profileId: OTHER_ID,
      messages: [
        { id: "other-message", fromMe: false, text: "keep", at: 2 },
      ],
      unread: 1,
    },
  ];

  return {
    getConversations: () => conversations,
    getLikedIds: () => likedIds,
    setLikedIds: (updater: (prev: string[]) => string[]) => {
      likedIds = updater(likedIds);
    },
    updateConversations: (
      updater: (prev: Conversation[]) => Conversation[]
    ) => {
      conversations = updater(conversations);
    },
  };
}

describe("applyBackendChatSendResult", () => {
  test("removes only stale target state after authoritative match_not_found", () => {
    const state = createState();

    applyBackendChatSendResult({
      result: { status: "match_not_found", targetProfileId: TARGET_ID },
      setLikedIds: state.setLikedIds,
      targetId: TARGET_ID,
      updateConversations: state.updateConversations,
    });

    expect(state.getLikedIds()).toEqual([OTHER_ID]);
    expect(state.getConversations()).toEqual([
      {
        id: "other-conversation",
        profileId: OTHER_ID,
        messages: [
          { id: "other-message", fromMe: false, text: "keep", at: 2 },
        ],
        unread: 1,
      },
    ]);
  });

  test("does not append a local message or clean up on transport failure", () => {
    const state = createState();
    const originalConversations = state.getConversations();

    applyBackendChatSendResult({
      result: {
        status: "failed",
        stage: "send",
        error: { code: "send_message_failed", message: "Network unavailable." },
      },
      setLikedIds: state.setLikedIds,
      targetId: TARGET_ID,
      updateConversations: state.updateConversations,
    });

    expect(state.getLikedIds()).toEqual([TARGET_ID, OTHER_ID]);
    expect(state.getConversations()).toBe(originalConversations);
  });

  test("appends a successful backend message exactly once", () => {
    const state = createState();

    applyBackendChatSendResult({
      result: {
        status: "sent",
        message: {
          id: "new-message",
          fromMe: true,
          text: "hello",
          at: 3,
          status: "sent",
        },
      },
      setLikedIds: state.setLikedIds,
      targetId: TARGET_ID,
      updateConversations: state.updateConversations,
    });

    const target = state
      .getConversations()
      .find((conversation) => conversation.profileId === TARGET_ID);
    expect(target?.messages.map((message) => message.id)).toEqual([
      "old-target-message",
      "new-message",
    ]);
    expect(state.getLikedIds()).toEqual([TARGET_ID, OTHER_ID]);
  });
});

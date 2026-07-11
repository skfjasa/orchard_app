import { describe, expect, test } from "bun:test";

import type { AppServices } from "./app-services";
import { sendBackendChatMessage } from "./backend-chat-action-service";
import { resolveBackendSwipeVisibleMatch } from "./backend-swipe-action-service";
import type { MatchRecord } from "./match-service";
import { fail, ok } from "./supabase-service-response";

const USER_ID = "20000000-0000-4000-8000-000000000001";
const TARGET_ID = "20000000-0000-4000-8000-000000000002";

const ACTIVE_MATCH: MatchRecord = {
  id: "30000000-0000-4000-8000-000000000001",
  userA: USER_ID,
  userB: TARGET_ID,
  status: "active",
  createdAt: 1,
};

interface FakeServiceOptions {
  matches?: MatchRecord[];
  matchFailureCode?: string;
  mode?: "mock" | "supabase";
  sendFailureCode?: string;
}

function createFakeServices(options: FakeServiceOptions = {}) {
  let chatSendCalls = 0;
  let swipeCalls = 0;

  const services = {
    mode: options.mode ?? "supabase",
    capabilities: {
      chat: options.mode === "mock" ? "mock" : "supabase",
      matches: options.mode === "mock" ? "mock" : "supabase",
      swipes: options.mode === "mock" ? "mock" : "supabase",
    },
    matches: {
      async listMatches() {
        if (options.matchFailureCode) {
          return fail(options.matchFailureCode, "Match lookup failed.");
        }
        return ok(options.matches ?? []);
      },
    },
    chat: {
      async sendMessage() {
        chatSendCalls += 1;
        if (options.sendFailureCode) {
          return fail(options.sendFailureCode, "Message send failed.");
        }
        return ok({
          id: "message-1",
          fromMe: true,
          text: "hello",
          at: 10,
          kind: "text" as const,
          status: "sent" as const,
        });
      },
    },
    swipes: {
      async recordSwipe() {
        swipeCalls += 1;
        return ok({ decision: "like" as const, matched: true, matchId: ACTIVE_MATCH.id });
      },
    },
  } as unknown as AppServices;

  return {
    services,
    getChatSendCalls: () => chatSendCalls,
    getSwipeCalls: () => swipeCalls,
  };
}

describe("sendBackendChatMessage", () => {
  test("returns match_not_found without repairing a swipe or inactive match", async () => {
    const fake = createFakeServices();

    const result = await sendBackendChatMessage({
      body: "hello",
      currentProfileId: USER_ID,
      services: fake.services,
      targetId: TARGET_ID,
      userId: USER_ID,
    });

    expect(result).toEqual({
      status: "match_not_found",
      targetProfileId: TARGET_ID,
    });
    expect(fake.getSwipeCalls()).toBe(0);
    expect(fake.getChatSendCalls()).toBe(0);
  });

  test("rejects an inactive match without sending or swiping", async () => {
    const fake = createFakeServices({
      matches: [{ ...ACTIVE_MATCH, status: "unmatched" }],
    });

    const result = await sendBackendChatMessage({
      body: "hello",
      currentProfileId: USER_ID,
      services: fake.services,
      targetId: TARGET_ID,
      userId: USER_ID,
    });

    expect(result).toEqual({
      status: "match_not_found",
      targetProfileId: TARGET_ID,
    });
    expect(fake.getSwipeCalls()).toBe(0);
    expect(fake.getChatSendCalls()).toBe(0);
  });

  test("sends exactly once through an existing active match", async () => {
    const fake = createFakeServices({ matches: [ACTIVE_MATCH] });

    const result = await sendBackendChatMessage({
      body: "hello",
      currentProfileId: USER_ID,
      services: fake.services,
      targetId: TARGET_ID,
      userId: USER_ID,
    });

    expect(result.status).toBe("sent");
    expect(fake.getChatSendCalls()).toBe(1);
    expect(fake.getSwipeCalls()).toBe(0);
  });

  test("keeps match lookup transport failures distinct from match_not_found", async () => {
    const fake = createFakeServices({ matchFailureCode: "matches_timeout" });

    const result = await sendBackendChatMessage({
      body: "hello",
      currentProfileId: USER_ID,
      services: fake.services,
      targetId: TARGET_ID,
      userId: USER_ID,
    });

    expect(result).toEqual({
      status: "failed",
      stage: "lookup",
      error: { code: "matches_timeout", message: "Match lookup failed." },
    });
    expect(fake.getSwipeCalls()).toBe(0);
    expect(fake.getChatSendCalls()).toBe(0);
  });

  test("keeps RLS send failures distinct from match_not_found", async () => {
    const fake = createFakeServices({
      matches: [ACTIVE_MATCH],
      sendFailureCode: "message_forbidden",
    });

    const result = await sendBackendChatMessage({
      body: "hello",
      currentProfileId: USER_ID,
      services: fake.services,
      targetId: TARGET_ID,
      userId: USER_ID,
    });

    expect(result).toEqual({
      status: "failed",
      stage: "send",
      error: { code: "message_forbidden", message: "Message send failed." },
    });
    expect(fake.getChatSendCalls()).toBe(1);
    expect(fake.getSwipeCalls()).toBe(0);
  });

  test("leaves mock chat on its existing local path", async () => {
    const fake = createFakeServices({ mode: "mock" });

    const result = await sendBackendChatMessage({
      body: "hello",
      currentProfileId: USER_ID,
      services: fake.services,
      targetId: TARGET_ID,
      userId: USER_ID,
    });

    expect(result).toEqual({ status: "skipped" });
    expect(fake.getChatSendCalls()).toBe(0);
    expect(fake.getSwipeCalls()).toBe(0);
  });
});

describe("explicit swipe actions", () => {
  test("continue to use the swipe service", async () => {
    const fake = createFakeServices();

    const result = await resolveBackendSwipeVisibleMatch({
      currentProfileId: USER_ID,
      decision: "like",
      profileId: TARGET_ID,
      services: fake.services,
      userId: USER_ID,
    });

    expect(result).toEqual({ status: "activate_local_match" });
    expect(fake.getSwipeCalls()).toBe(1);
  });
});

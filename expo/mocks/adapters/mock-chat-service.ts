import type { ChatService } from "@/services";

import { fail, ok } from "./mock-service-response";
import { makeMessage } from "./mock-service-state";
import type { MockServiceState } from "./mock-service-state";

export function createMockChatService(state: MockServiceState): ChatService {
  return {
    async getThread(matchId) {
      const match = state.matches.find((item) => item.id === matchId);
      if (!match || match.status !== "active") {
        return fail("match_not_active", "Chat is only available for active matches.");
      }
      const convo = state.conversations[matchId] ?? {
        id: matchId,
        profileId: matchId,
        messages: [],
        unread: 0,
      };
      state.conversations[matchId] = convo;
      return ok({ matchId, messages: convo.messages });
    },

    async sendMessage(input) {
      const match = state.matches.find((item) => item.id === input.matchId);
      if (!match || match.status !== "active") {
        return fail("match_not_active", "Messages require an active match.");
      }
      if (match.userA !== input.senderId && match.userB !== input.senderId) {
        return fail("not_match_member", "Sender is not part of this match.");
      }
      const msg = makeMessage({
        fromMe: true,
        text: input.body,
      });
      const convo = state.conversations[input.matchId] ?? {
        id: input.matchId,
        profileId: input.matchId,
        messages: [],
        unread: 0,
      };
      convo.messages.push(msg);
      state.conversations[input.matchId] = convo;
      return ok(msg);
    },

    async markRead() {
      return ok(undefined);
    },
  };
}

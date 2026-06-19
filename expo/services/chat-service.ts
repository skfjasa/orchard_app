import type { Message } from "@/types";

import type { ServiceResponse } from "./service-types";

export interface ChatThread {
  matchId: string;
  messages: Message[];
}

export interface SendMessageInput {
  matchId: string;
  senderId: string;
  body: string;
}

export interface ChatService {
  getThread(matchId: string): Promise<ServiceResponse<ChatThread>>;
  sendMessage(input: SendMessageInput): Promise<ServiceResponse<Message>>;
  markRead(matchId: string, profileId: string): Promise<ServiceResponse<void>>;
}

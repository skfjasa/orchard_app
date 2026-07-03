import { supabase } from "@/lib/supabase";

import type { Database } from "@/lib/supabase";
import type { Message } from "@/types";

import type { ChatService } from "./chat-service";
import { fail, ok, requireSupabase } from "./supabase-service-response";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

function toTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Date.now() : timestamp;
}

function toMessage(row: MessageRow, currentProfileId?: string): Message {
  return {
    id: row.id,
    fromMe: currentProfileId ? row.sender_id === currentProfileId : false,
    text: row.body,
    at: toTimestamp(row.created_at),
    kind: "text",
    status: "sent",
  };
}

async function getCurrentProfileId(): Promise<string | undefined> {
  if (!supabase) return undefined;
  const { data, error } = await supabase.auth.getUser();
  if (error) return undefined;
  return data.user?.id;
}

export function createSupabaseChatService(): ChatService {
  return {
    async getThread(matchId) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const { data, error } = await client.value
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) {
        return fail("messages_failed", "Could not load messages.", error);
      }

      const currentProfileId = await getCurrentProfileId();
      return ok({
        matchId,
        messages: (data ?? []).map((row) => toMessage(row, currentProfileId)),
      });
    },

    async sendMessage(input) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const body = input.body.trim();
      if (!body) {
        return fail("empty_message", "Message body is required.");
      }

      const { data, error } = await client.value
        .from("messages")
        .insert({
          match_id: input.matchId,
          sender_id: input.senderId,
          body,
        })
        .select("*")
        .single();

      if (error) {
        return fail("send_message_failed", "Could not send message.", error);
      }

      return ok(toMessage(data, input.senderId));
    },

    async markRead() {
      return ok(undefined);
    },
  };
}

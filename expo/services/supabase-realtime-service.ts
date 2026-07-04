import type { RealtimeChannel } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

import type {
  MatchMessageRealtimeInput,
  RealtimeService,
  RealtimeSubscription,
} from "./realtime-service";
import { fail, ok, requireSupabase } from "./supabase-service-response";

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function toTopicKey(values: string[]) {
  return values.map((value) => value.slice(0, 8)).join("-");
}

function makeSubscription(channels: RealtimeChannel[]): RealtimeSubscription {
  return {
    unsubscribe: () => {
      for (const channel of channels) {
        void supabase?.removeChannel(channel);
      }
    },
  };
}

export function createSupabaseRealtimeService(): RealtimeService {
  return {
    subscribeToMatchAndMessageChanges(input: MatchMessageRealtimeInput) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const matchIds = uniqueValues(input.matchIds);
      const channels: RealtimeChannel[] = [];

      const matchChannel = client.value
        .channel(`profile-matches:${input.profileId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "matches",
            filter: `user_a=eq.${input.profileId}`,
          },
          () => input.onChange("match")
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "matches",
            filter: `user_b=eq.${input.profileId}`,
          },
          () => input.onChange("match")
        );

      matchChannel.subscribe((status, error) => {
        if (error) {
          console.log("[supabase-realtime-service] match subscription failed", {
            status,
            message: error.message,
          });
        }
      });
      channels.push(matchChannel);

      if (matchIds.length > 0) {
        const messageChannel = client.value.channel(
          `profile-messages:${input.profileId}:${toTopicKey(matchIds)}`
        );

        for (const matchId of matchIds) {
          messageChannel.on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `match_id=eq.${matchId}`,
            },
            () => input.onChange("message")
          );
        }

        messageChannel.subscribe((status, error) => {
          if (error) {
            console.log("[supabase-realtime-service] message subscription failed", {
              status,
              message: error.message,
            });
          }
        });
        channels.push(messageChannel);
      }

      if (channels.length === 0) {
        return fail("realtime_unavailable", "No realtime channels were created.");
      }

      return ok(makeSubscription(channels));
    },
  };
}

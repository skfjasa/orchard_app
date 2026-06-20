import { supabase } from "@/lib/supabase";

import type { SafetyService } from "./safety-service";
import { fail, ok, requireSupabase } from "./supabase-service-response";

export function createSupabaseSafetyService(): SafetyService {
  return {
    async blockUser(input) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const { error } = await client.value.rpc("block_profile", {
        blocked_profile_id: input.blockedId,
      });

      if (error) {
        return fail("block_failed", "Could not block user.", error);
      }

      return ok(undefined);
    },

    async reportUser(input) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const { error } = await client.value.from("reports").insert({
        reporter_id: input.reporterId,
        reported_user_id: input.reportedUserId,
        reported_message_id: input.reportedMessageId ?? null,
        reason: input.reason,
        details: input.details ?? null,
      });

      if (error) {
        return fail("report_failed", "Could not submit report.", error);
      }

      return ok(undefined);
    },

    async requestAccountDeletion(input) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const { error } = await client.value
        .from("account_deletion_requests")
        .insert({
          profile_id: input.profileId,
          reason: input.reason ?? null,
        });

      if (error) {
        return fail(
          "account_deletion_failed",
          "Could not request account deletion.",
          error
        );
      }

      return ok(undefined);
    },
  };
}

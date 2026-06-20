import { supabase } from "@/lib/supabase";

import type { SwipeDecision, SwipeService } from "./swipe-service";
import { fail, ok, requireSupabase } from "./supabase-service-response";

function toBackendDecision(decision: SwipeDecision): "like" | "pass" {
  return decision === "pass" ? "pass" : "like";
}

export function createSupabaseSwipeService(): SwipeService {
  return {
    async recordSwipe(input) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const { data, error } = await client.value.rpc("create_swipe", {
        target_profile_id: input.targetId,
        swipe_decision: toBackendDecision(input.decision),
      });

      if (error) {
        return fail("swipe_failed", "Could not record swipe.", error);
      }

      const result = data?.[0];
      if (!result) {
        return fail("swipe_failed", "Swipe did not return a result.");
      }

      return ok({
        decision: input.decision,
        matched: result.did_match,
        matchId: result.match_id ?? undefined,
      });
    },
  };
}

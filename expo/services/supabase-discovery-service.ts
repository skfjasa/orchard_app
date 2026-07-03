import { MOCK_PROFILES } from "@/mocks/profiles";
import {
  fromBackendProfileId,
  toBackendProfileId,
} from "@/constants/mock-profile-ids";
import { supabase } from "@/lib/supabase";
import { rankProfiles } from "@/utils/match";

import type { DiscoveryService } from "./discovery-service";
import { fail, ok, requireSupabase } from "./supabase-service-response";

export function createSupabaseDiscoveryService(): DiscoveryService {
  return {
    async listProfiles(filters) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const excludedBackendIds = new Set(
        (filters.excludedProfileIds ?? []).map(toBackendProfileId)
      );
      const swipedBackendIds = new Set<string>();

      if (!filters.includePassed) {
        const { data: swipes, error: swipesError } = await client.value
          .from("swipes")
          .select("target_id")
          .eq("swiper_id", filters.profileId);

        if (swipesError) {
          return fail(
            "discovery_swipes_failed",
            "Could not load previous swipes.",
            swipesError
          );
        }

        for (const swipe of swipes ?? []) {
          swipedBackendIds.add(swipe.target_id);
        }
      }

      const limit = filters.limit ?? 50;
      const { data, error } = await client.value
        .from("profiles")
        .select("id")
        .neq("id", filters.profileId)
        .limit(Math.max(limit * 3, 50));

      if (error) {
        return fail("discovery_failed", "Could not load profiles.", error);
      }

      const profiles = (data ?? [])
        .filter((row) => {
          if (excludedBackendIds.has(row.id)) return false;
          if (!filters.includePassed && swipedBackendIds.has(row.id)) {
            return false;
          }
          return true;
        })
        .map((row) => {
          const localId = fromBackendProfileId(row.id);
          return MOCK_PROFILES.find((profile) => profile.id === localId);
        })
        .filter((profile): profile is (typeof MOCK_PROFILES)[number] => !!profile);

      const ranked = filters.viewerProfile
        ? rankProfiles(filters.viewerProfile, profiles)
        : profiles.map((profile) => ({ profile, score: undefined }));

      return ok(ranked.slice(0, limit));
    },
  };
}

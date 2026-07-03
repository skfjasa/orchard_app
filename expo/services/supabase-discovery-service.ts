import { MOCK_PROFILES } from "@/mocks/profiles";
import {
  fromBackendProfileId,
  toBackendProfileId,
} from "@/constants/mock-profile-ids";
import { supabase, type Database } from "@/lib/supabase";
import { rankProfiles } from "@/utils/match";

import type { DiscoveryService } from "./discovery-service";
import {
  buildPhotosByMemberId,
  toAppProfile,
} from "./supabase-profile-service";
import { fail, ok, requireSupabase } from "./supabase-service-response";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileMemberRow = Database["public"]["Tables"]["profile_members"]["Row"];
type ProfilePhotoRow = Database["public"]["Tables"]["profile_photos"]["Row"];

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
        .select("*")
        .neq("id", filters.profileId)
        .limit(Math.max(limit * 3, 50));

      if (error) {
        return fail("discovery_failed", "Could not load profiles.", error);
      }

      const profileRows = (data ?? []).filter((row) => {
        if (excludedBackendIds.has(row.id)) return false;
        if (!filters.includePassed && swipedBackendIds.has(row.id)) {
          return false;
        }
        return true;
      }) as ProfileRow[];

      const profileIds = profileRows.map((row) => row.id);
      let memberRows: ProfileMemberRow[] = [];
      let photoRows: ProfilePhotoRow[] = [];

      if (profileIds.length > 0) {
        const { data: members, error: membersError } = await client.value
          .from("profile_members")
          .select("*")
          .in("profile_id", profileIds)
          .order("sort_order", { ascending: true });

        if (membersError) {
          return fail(
            "discovery_members_failed",
            "Could not load profile members.",
            membersError
          );
        }

        const { data: photos, error: photosError } = await client.value
          .from("profile_photos")
          .select("*")
          .in("profile_id", profileIds)
          .order("sort_order", { ascending: true });

        if (photosError) {
          return fail(
            "discovery_photos_failed",
            "Could not load profile photos.",
            photosError
          );
        }

        memberRows = (members ?? []) as ProfileMemberRow[];
        photoRows = (photos ?? []) as ProfilePhotoRow[];
      }

      const membersByProfileId = memberRows.reduce<Record<string, ProfileMemberRow[]>>(
        (acc, row) => {
          acc[row.profile_id] = [...(acc[row.profile_id] ?? []), row];
          return acc;
        },
        {}
      );
      const photosByMemberId = await buildPhotosByMemberId(photoRows);

      const profiles = profileRows.map((row) => {
        const localId = fromBackendProfileId(row.id);
        const mockProfile = MOCK_PROFILES.find((profile) => profile.id === localId);
        if (mockProfile) return mockProfile;

        return toAppProfile(
          row,
          membersByProfileId[row.id] ?? [],
          photosByMemberId
        );
      });

      const ranked = filters.viewerProfile
        ? rankProfiles(filters.viewerProfile, profiles)
        : profiles.map((profile) => ({ profile, score: undefined }));

      return ok(ranked.slice(0, limit));
    },
  };
}

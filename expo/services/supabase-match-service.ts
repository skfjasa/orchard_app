import { supabase } from "@/lib/supabase";

import type { Database } from "@/lib/supabase";

import type { MatchRecord, MatchService } from "./match-service";
import {
  buildPhotosByMemberId,
  toAppProfile,
} from "./supabase-profile-service";
import { fail, ok, requireSupabase } from "./supabase-service-response";

type MatchRow = Database["public"]["Tables"]["matches"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileMemberRow = Database["public"]["Tables"]["profile_members"]["Row"];
type ProfilePhotoRow = Database["public"]["Tables"]["profile_photos"]["Row"];

function toTimestamp(value: string | null): number | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function toMatchRecord(
  row: MatchRow,
  otherProfilesById: Record<string, MatchRecord["otherProfile"]> = {}
): MatchRecord {
  return {
    id: row.id,
    userA: row.user_a,
    userB: row.user_b,
    status: row.status,
    createdAt: toTimestamp(row.created_at) ?? Date.now(),
    unmatchedBy: row.unmatched_by ?? undefined,
    unmatchedAt: toTimestamp(row.unmatched_at),
    otherProfile: otherProfilesById[row.user_a] ?? otherProfilesById[row.user_b],
  };
}

async function loadProfilesById(
  profileIds: string[]
): Promise<Record<string, MatchRecord["otherProfile"]>> {
  if (!supabase || profileIds.length === 0) return {};

  const uniqueIds = [...new Set(profileIds)];
  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .in("id", uniqueIds);

  if (profileError) return {};

  const { data: memberRows, error: memberError } = await supabase
    .from("profile_members")
    .select("*")
    .in("profile_id", uniqueIds)
    .order("sort_order", { ascending: true });

  if (memberError) return {};

  const { data: photoRows, error: photoError } = await supabase
    .from("profile_photos")
    .select("*")
    .in("profile_id", uniqueIds)
    .order("sort_order", { ascending: true });

  if (photoError) return {};

  const membersByProfileId = ((memberRows ?? []) as ProfileMemberRow[]).reduce<
    Record<string, ProfileMemberRow[]>
  >((acc, row) => {
    acc[row.profile_id] = [...(acc[row.profile_id] ?? []), row];
    return acc;
  }, {});
  const photosByMemberId = await buildPhotosByMemberId(
    (photoRows ?? []) as ProfilePhotoRow[]
  );

  return ((profileRows ?? []) as ProfileRow[]).reduce<
    Record<string, MatchRecord["otherProfile"]>
  >((acc, row) => {
    acc[row.id] = toAppProfile(
      row,
      membersByProfileId[row.id] ?? [],
      photosByMemberId
    );
    return acc;
  }, {});
}

export function createSupabaseMatchService(): MatchService {
  return {
    async listMatches(profileId) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const { data, error } = await client.value
        .from("matches")
        .select("*")
        .eq("status", "active")
        .or(`user_a.eq.${profileId},user_b.eq.${profileId}`)
        .order("created_at", { ascending: false });

      if (error) {
        return fail("matches_failed", "Could not load matches.", error);
      }

      const rows = data ?? [];
      const otherProfileIds = rows.map((row) =>
        row.user_a === profileId ? row.user_b : row.user_a
      );
      const otherProfilesById = await loadProfilesById(otherProfileIds);

      return ok(rows.map((row) => toMatchRecord(row, otherProfilesById)));
    },

    async getMatch(matchId) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const { data, error } = await client.value
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .maybeSingle();

      if (error) {
        return fail("match_failed", "Could not load match.", error);
      }

      return ok(data ? toMatchRecord(data) : null);
    },

    async unmatch(matchId) {
      const client = requireSupabase(supabase);
      if (!client.ok) return client;

      const { data, error } = await client.value.rpc("unmatch_match", {
        target_match_id: matchId,
      });

      if (error) {
        return fail("unmatch_failed", "Could not unmatch.", error);
      }

      return ok(toMatchRecord(data));
    },
  };
}

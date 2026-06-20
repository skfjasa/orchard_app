import { supabase } from "@/lib/supabase";

import type { Database } from "@/lib/supabase";

import type { MatchRecord, MatchService } from "./match-service";
import { fail, ok, requireSupabase } from "./supabase-service-response";

type MatchRow = Database["public"]["Tables"]["matches"]["Row"];

function toTimestamp(value: string | null): number | undefined {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : timestamp;
}

function toMatchRecord(row: MatchRow): MatchRecord {
  return {
    id: row.id,
    userA: row.user_a,
    userB: row.user_b,
    status: row.status,
    createdAt: toTimestamp(row.created_at) ?? Date.now(),
    unmatchedBy: row.unmatched_by ?? undefined,
    unmatchedAt: toTimestamp(row.unmatched_at),
  };
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

      return ok((data ?? []).map(toMatchRecord));
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

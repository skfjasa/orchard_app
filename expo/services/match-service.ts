import type { Profile } from "@/types";

import type { ServiceResponse } from "./service-types";

export type MatchStatus = "active" | "unmatched" | "blocked";

export interface MatchRecord {
  id: string;
  userA: string;
  userB: string;
  status: MatchStatus;
  createdAt: number;
  unmatchedBy?: string;
  unmatchedAt?: number;
  otherProfile?: Profile;
}

export interface MatchService {
  listMatches(profileId: string): Promise<ServiceResponse<MatchRecord[]>>;
  getMatch(matchId: string): Promise<ServiceResponse<MatchRecord | null>>;
  unmatch(matchId: string, profileId: string): Promise<ServiceResponse<MatchRecord>>;
}

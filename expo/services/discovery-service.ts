import type { MatchScore, Profile } from "@/types";

import type { ServiceResponse } from "./service-types";

export interface DiscoveryFilters {
  profileId: string;
  limit?: number;
  includePassed?: boolean;
}

export interface DiscoveryProfile {
  profile: Profile;
  score?: MatchScore;
}

export interface DiscoveryService {
  listProfiles(
    filters: DiscoveryFilters
  ): Promise<ServiceResponse<DiscoveryProfile[]>>;
}

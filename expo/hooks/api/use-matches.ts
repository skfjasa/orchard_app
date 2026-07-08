import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { createAppServices, type AppServices } from "@/services/app-services";
import type { MatchRecord } from "@/services/match-service";
import type { ServiceResponse } from "@/services/service-types";

import { backendQueryKeys } from "./query-keys";

interface UseMatchesQueryOptions {
  enabled?: boolean;
  profileId?: string | null;
  refetchIntervalMs?: number;
  services?: AppServices;
  staleTime?: number;
}

export function useMatchesQuery({
  enabled = true,
  profileId,
  refetchIntervalMs = 10_000,
  services,
  staleTime = 5_000,
}: UseMatchesQueryOptions) {
  const defaultServices = useMemo(() => createAppServices(), []);
  const appServices = services ?? defaultServices;

  return useQuery<ServiceResponse<MatchRecord[]>>({
    enabled: enabled && appServices.mode === "supabase" && !!profileId,
    queryFn: () => {
      if (!profileId) return Promise.resolve({ ok: true, value: [] });
      return appServices.matches.listMatches(profileId);
    },
    queryKey: backendQueryKeys.matches.list(appServices.mode, profileId),
    refetchInterval:
      appServices.mode === "supabase" ? refetchIntervalMs : false,
    refetchOnWindowFocus: true,
    staleTime,
  });
}

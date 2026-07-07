import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { createAppServices, type AppServices } from "@/services/app-services";
import type {
  DiscoveryFilters,
  DiscoveryProfile,
} from "@/services/discovery-service";
import type { ServiceResponse } from "@/services/service-types";

import { backendQueryKeys } from "./query-keys";

interface UseDiscoveryProfilesQueryOptions {
  enabled?: boolean;
  filters?: DiscoveryFilters | null;
  services?: AppServices;
  staleTime?: number;
}

export function useDiscoveryProfilesQuery({
  enabled = true,
  filters,
  services,
  staleTime = 5_000,
}: UseDiscoveryProfilesQueryOptions) {
  const defaultServices = useMemo(() => createAppServices(), []);
  const appServices = services ?? defaultServices;

  return useQuery<ServiceResponse<DiscoveryProfile[]>>({
    enabled: enabled && !!filters?.profileId,
    queryFn: () => {
      if (!filters?.profileId) {
        return Promise.resolve({ ok: true, value: [] });
      }
      return appServices.discovery.listProfiles(filters);
    },
    queryKey: backendQueryKeys.discovery.list(appServices.mode, filters),
    staleTime,
  });
}

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { createAppServices, type AppServices } from "@/services/app-services";

import { backendQueryKeys } from "./query-keys";

const REALTIME_INVALIDATION_DELAY_MS = 250;

interface UseMatchRealtimeOptions {
  enabled?: boolean;
  matchIds: string[];
  profileId?: string | null;
  services?: AppServices;
}

export function useMatchRealtime({
  enabled = true,
  matchIds,
  profileId,
  services,
}: UseMatchRealtimeOptions) {
  const defaultServices = useMemo(() => createAppServices(), []);
  const appServices = services ?? defaultServices;
  const queryClient = useQueryClient();
  const matchIdsKey = useMemo(() => [...matchIds].sort().join("|"), [matchIds]);
  const stableMatchIds = useMemo(
    () => (matchIdsKey ? matchIdsKey.split("|") : []),
    [matchIdsKey]
  );

  useEffect(() => {
    if (!enabled) return;
    if (appServices.mode !== "supabase") return;
    if (appServices.capabilities.realtime !== "supabase") return;
    if (!profileId) return;

    let invalidateTimeout: ReturnType<typeof setTimeout> | null = null;
    const subscriptionResult =
      appServices.realtime.subscribeToMatchAndMessageChanges({
        profileId,
        matchIds: stableMatchIds,
        onChange: () => {
          if (invalidateTimeout) return;
          invalidateTimeout = setTimeout(() => {
            invalidateTimeout = null;
            void queryClient.invalidateQueries({
              queryKey: backendQueryKeys.matches.all(appServices.mode),
            });
          }, REALTIME_INVALIDATION_DELAY_MS);
        },
      });

    if (!subscriptionResult.ok) {
      console.log("[use-match-realtime] backend realtime unavailable", {
        code: subscriptionResult.error.code,
        message: subscriptionResult.error.message,
      });
      return;
    }

    return () => {
      if (invalidateTimeout) {
        clearTimeout(invalidateTimeout);
      }
      subscriptionResult.value.unsubscribe();
    };
  }, [appServices, enabled, profileId, queryClient, stableMatchIds]);
}

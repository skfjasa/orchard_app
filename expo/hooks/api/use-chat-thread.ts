import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { createAppServices, type AppServices } from "@/services/app-services";
import type { ChatThread } from "@/services/chat-service";
import type { ServiceResponse } from "@/services/service-types";

import { backendQueryKeys } from "./query-keys";

interface UseChatThreadQueryOptions {
  enabled?: boolean;
  matchId?: string | null;
  profileId?: string | null;
  services?: AppServices;
  staleTime?: number;
}

export function useChatThreadQuery({
  enabled = true,
  matchId,
  profileId,
  services,
  staleTime = 5_000,
}: UseChatThreadQueryOptions) {
  const defaultServices = useMemo(() => createAppServices(), []);
  const appServices = services ?? defaultServices;

  return useQuery<ServiceResponse<ChatThread>>({
    enabled: enabled && !!matchId,
    queryFn: () => {
      if (!matchId) {
        return Promise.resolve({
          ok: true,
          value: { matchId: "", messages: [] },
        });
      }
      return appServices.chat.getThread(matchId);
    },
    queryKey: backendQueryKeys.chat.thread(appServices.mode, profileId, matchId),
    staleTime,
  });
}

import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";

import { backendQueryKeys } from "@/hooks/api/query-keys";
import { createAppServices } from "@/services/app-services";

export function useRefreshMatchesOnFocus(enabled = true) {
  const appServices = useMemo(() => createAppServices(), []);
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      if (!enabled || appServices.mode !== "supabase") return;
      void queryClient.invalidateQueries({
        queryKey: backendQueryKeys.matches.all(appServices.mode),
      });
    }, [appServices.mode, enabled, queryClient])
  );
}

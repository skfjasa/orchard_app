import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { saveStoredConversations } from "@/services/local-profile-storage";
import type { Conversation } from "@/types";

type ConversationUpdater = (current: Conversation[]) => Conversation[];

export function usePersistedConversations() {
  const [conversations, setConversationsState] = useState<Conversation[]>([]);
  const saveConversationsMutation = useMutation({
    mutationFn: saveStoredConversations,
  });

  const hydrateConversations = useCallback((next: Conversation[]) => {
    setConversationsState(next);
  }, []);

  const replaceConversations = useCallback(
    (next: Conversation[]) => {
      setConversationsState(next);
      saveConversationsMutation.mutate(next);
    },
    [saveConversationsMutation]
  );

  const updateConversations = useCallback(
    (updater: ConversationUpdater) => {
      setConversationsState((current) => {
        const next = updater(current);
        if (next !== current) {
          saveConversationsMutation.mutate(next);
        }
        return next;
      });
    },
    [saveConversationsMutation]
  );

  return {
    conversations,
    hydrateConversations,
    replaceConversations,
    updateConversations,
  };
}

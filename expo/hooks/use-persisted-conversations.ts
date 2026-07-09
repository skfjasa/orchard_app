import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { saveStoredConversations } from "@/services/local-profile-storage";
import type { Conversation } from "@/types";

type ConversationUpdater = (current: Conversation[]) => Conversation[];

export function usePersistedConversations() {
  const [conversations, setConversationsState] = useState<Conversation[]>([]);
  const saveConversationsMutation = useMutation({
    mutationFn: saveStoredConversations,
  });
  const saveConversationsRef = useRef(saveConversationsMutation.mutate);

  useEffect(() => {
    saveConversationsRef.current = saveConversationsMutation.mutate;
  }, [saveConversationsMutation.mutate]);

  const hydrateConversations = useCallback((next: Conversation[]) => {
    setConversationsState(next);
  }, []);

  const replaceConversations = useCallback(
    (next: Conversation[]) => {
      setConversationsState(next);
      saveConversationsRef.current(next);
    },
    []
  );

  const updateConversations = useCallback(
    (updater: ConversationUpdater) => {
      setConversationsState((current) => {
        const next = updater(current);
        if (next !== current) {
          saveConversationsRef.current(next);
        }
        return next;
      });
    },
    []
  );

  return {
    conversations,
    hydrateConversations,
    replaceConversations,
    updateConversations,
  };
}

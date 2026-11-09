"use client";

import { useEffect, useState } from "react";
import { getMentorConversationsAction } from "@/lib/api/mentor-conversations-actions";
import type { ConversationListItem } from "@/lib/api/mentor-conversations";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";

const POLL_INTERVAL_MS = 30000;

export function MessagesPanel({
  initialConversations,
  initialSelectedId,
}: {
  initialConversations: ConversationListItem[];
  /** From `?conversatie=` (a message notification's link); falls back to the first conversation. */
  initialSelectedId?: string;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const pickInitial = () =>
    initialConversations.find((c) => c.documentId === initialSelectedId)?.documentId ??
    initialConversations[0]?.documentId ??
    null;
  const [selectedId, setSelectedId] = useState<string | null>(pickInitial);

  // A notification opened while this page is already mounted only changes the
  // query string: the panel keeps its state, so follow the new target.
  const [target, setTarget] = useState(initialSelectedId);
  if (initialSelectedId !== target) {
    setTarget(initialSelectedId);
    if (initialSelectedId && conversations.some((c) => c.documentId === initialSelectedId)) {
      setSelectedId(initialSelectedId);
    }
  }

  const refresh = async () => {
    const result = await getMentorConversationsAction();
    if (result.data) {
      setConversations(result.data);
    }
  };

  useEffect(() => {
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const selected = conversations.find((c) => c.documentId === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
      <ConversationList conversations={conversations} selectedId={selectedId} onSelect={setSelectedId} />
      {selected ? (
        <ConversationThread key={selected.documentId} conversation={selected} onMessageSent={refresh} />
      ) : (
        <div className="bg-white rounded-2xl border border-border flex items-center justify-center h-[65vh]">
          <p className="text-sm text-muted-foreground">Selectează o conversație pentru a vedea mesajele.</p>
        </div>
      )}
    </div>
  );
}

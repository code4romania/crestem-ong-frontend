"use client";

import type { ConversationListItem } from "@/lib/api/mentor-conversations";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: ConversationListItem[];
  selectedId: string | null;
  onSelect: (documentId: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-bold text-base" style={{ color: "#1c1c81" }}>
          Conversații
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {conversations.length} {conversations.length === 1 ? "organizație" : "organizații"}
        </p>
      </div>
      <div className="divide-y divide-border max-h-[65vh] overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            Nu ai încă organizații alocate.
          </p>
        ) : (
          conversations.map((conversation) => {
            const ong = conversation.ong;
            if (!ong) return null;
            const isSelected = conversation.documentId === selectedId;
            return (
              <button
                key={conversation.documentId}
                type="button"
                onClick={() => onSelect(conversation.documentId)}
                className="w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-50"
                style={{ background: isSelected ? "#e5f9e5" : "transparent" }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: "#1c1c81" }}
                >
                  {initials(ong.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate" style={{ color: "#1c1c81" }}>
                      {ong.name}
                    </p>
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {(ong.admin || conversation.program) && (
                    <p
                      className="text-xs truncate"
                      style={{ color: isSelected ? "#007d58" : "#5b6779", fontWeight: isSelected ? 600 : 400 }}
                    >
                      {[ong.admin?.nume, conversation.program?.name].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {conversation.unread && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#00d495" }} />
                    )}
                    <p className="text-xs truncate" style={{ color: conversation.unread ? "#1c1c81" : "#5b6779" }}>
                      {conversation.lastMessage?.content ?? "Fără mesaje încă"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

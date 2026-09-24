"use client";

import { X } from "lucide-react";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

/** Read-only view of an affiliation request message, opened from the requests table. */
export function JoinRequestMessageModal({
  authorName,
  message,
  onClose,
}: {
  authorName: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <ModalOverlay labelledBy="join-request-message-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="join-request-message-title"
              className="font-heading font-extrabold text-lg"
              style={{ color: "#1c1c81" }}
            >
              Mesaj
            </h2>
            <p className="mt-1 text-sm text-muted-foreground truncate">de la {authorName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Închide"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          <p className="text-sm whitespace-pre-wrap break-words" style={{ color: "#334155" }}>
            {message}
          </p>
        </div>

        <div className="px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569]"
          >
            Închide
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

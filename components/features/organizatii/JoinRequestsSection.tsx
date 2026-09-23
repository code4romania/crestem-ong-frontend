"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { rejectJoinRequestAction } from "@/lib/api/ongs-actions";
import type { OngJoinRequest } from "@/lib/api/membership";
import { AcceptJoinRequestModal } from "./AcceptJoinRequestModal";
import { JoinRequestMessageModal } from "./JoinRequestMessageModal";

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Above this length the 2-line cell is likely truncated, so offer the full-text modal. */
const MESSAGE_PREVIEW_LENGTH = 120;

export function JoinRequestsSection({
  initialRequests,
}: {
  initialRequests: OngJoinRequest[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<OngJoinRequest | null>(null);
  const [messageTarget, setMessageTarget] = useState<OngJoinRequest | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (requests.length === 0) return null;

  const handleAccepted = (documentId: string) => {
    setAcceptTarget(null);
    toast.success("Cererea de afiliere a fost acceptată.");
    setRequests((prev) => prev.filter((r) => r.documentId !== documentId));
  };

  const handleReject = (documentId: string) => {
    setError(null);
    setPendingId(documentId);
    startTransition(async () => {
      const result = await rejectJoinRequestAction(documentId);
      setPendingId(null);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Cererea de afiliere a fost respinsă.");
      setRequests((prev) => prev.filter((r) => r.documentId !== documentId));
    });
  };

  return (
    <div className="mb-8">
      <h2
        className="font-heading font-bold text-base mb-3 flex items-center gap-2"
        style={{ color: "#162040" }}
      >
        Cereri de afiliere în așteptare
        <span
          className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full text-xs font-semibold"
          style={{ background: "#fee2e2", color: "#dc2626" }}
        >
          {requests.length}
        </span>
      </h2>

      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#ef4444]"
        >
          {error}
        </p>
      )}

      <div
        className="rounded-xl overflow-hidden overflow-x-auto"
        style={{ border: "1.5px solid #fecaca" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "#fef2f2",
                borderBottom: "1px solid #fecaca",
              }}
            >
              {["Utilizator", "Data cererii", "Mesaj", "Acțiuni"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#b91c1c" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => {
              const initials = request.user.nume
                .trim()
                .slice(0, 2)
                .toUpperCase();
              const rowPending = isPending && pendingId === request.documentId;
              const message = request.message?.trim() ?? "";
              return (
                <tr
                  key={request.documentId}
                  className="border-b last:border-0"
                  style={{ borderColor: "#fecaca", background: "#fffbfb" }}
                >
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                        style={{ background: "#dc2626" }}
                      >
                        {initials}
                      </div>
                      <div>
                        <p
                          className="font-semibold"
                          style={{ color: "#162040" }}
                        >
                          {request.user.nume}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-4 py-3.5 align-middle whitespace-nowrap"
                    style={{ color: "#475569" }}
                  >
                    {dateFormatter.format(new Date(request.createdAt))}
                  </td>
                  <td
                    className="px-4 py-3.5 align-middle max-w-xs"
                    style={{ color: "#334155" }}
                  >
                    {message ? (
                      <>
                        <p className="line-clamp-2 whitespace-pre-wrap break-words">
                          {message}
                        </p>
                        {message.length > MESSAGE_PREVIEW_LENGTH && (
                          <button
                            type="button"
                            onClick={() => setMessageTarget(request)}
                            className="mt-1 text-xs font-semibold underline hover:opacity-80"
                            style={{ color: "#2dbe8f" }}
                          >
                            Vezi mesajul
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Fără mesaj</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setAcceptTarget(request);
                        }}
                        disabled={rowPending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
                        style={{ background: "#2dbe8f" }}
                      >
                        <CheckCircle2 size={14} />
                        Confirmă
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(request.documentId)}
                        disabled={rowPending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-60"
                        style={{ color: "#ef4444" }}
                      >
                        <XCircle size={14} />
                        Respinge
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {acceptTarget && (
        <AcceptJoinRequestModal
          request={acceptTarget}
          onClose={() => setAcceptTarget(null)}
          onAccepted={handleAccepted}
        />
      )}

      {messageTarget && messageTarget.message && (
        <JoinRequestMessageModal
          authorName={messageTarget.user.nume}
          message={messageTarget.message}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { acceptJoinRequestAction } from "@/lib/api/ongs-actions";
import type { OngJoinRequest } from "@/lib/api/membership";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

/** Mirrors `ngoRoleSchema` on the backend. */
const ROLE_MIN_LENGTH = 2;
const ROLE_MAX_LENGTH = 100;

export function AcceptJoinRequestModal({
  request,
  onClose,
  onAccepted,
}: {
  request: OngJoinRequest;
  onClose: () => void;
  onAccepted: (documentId: string) => void;
}) {
  const [rol, setRol] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmedRol = rol.trim();
  const canSubmit = trimmedRol.length >= ROLE_MIN_LENGTH;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError("Completează rolul în organizație înainte de a confirma cererea.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await acceptJoinRequestAction(request.documentId, trimmedRol);
      if (result.error) {
        setError(result.error);
        return;
      }
      onAccepted(request.documentId);
    });
  };

  return (
    <ModalOverlay labelledBy="accept-join-request-title">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="accept-join-request-title"
              className="font-heading font-extrabold text-lg"
              style={{ color: "#1c1c81" }}
            >
              Confirmă cererea de afiliere
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Stabilește rolul pe care utilizatorul îl va avea în organizație.
            </p>
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

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          {error && (
            <p
              role="alert"
              className="rounded-lg px-3 py-2 text-sm bg-[#fff5f5] border-[1.5px] border-[#fca5a5] text-[#b91c1c]"
            >
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 border border-border rounded-xl px-4 py-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
              style={{ background: "#1c1c81" }}
            >
              {request.user.nume.trim().slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#1c1c81" }}>
                {request.user.nume}
              </p>
              <p className="text-xs text-muted-foreground truncate">{request.user.email}</p>
            </div>
          </div>

          <div>
            <p className="block text-sm font-semibold mb-1.5" style={{ color: "#1c1c81" }}>
              Mesaj
            </p>
            {request.message ? (
              <div className="rounded-xl border border-border bg-slate-50 px-4 py-3 max-h-48 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap break-words" style={{ color: "#334155" }}>
                  {request.message}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Fără mesaj</p>
            )}
          </div>

          <div>
            <label
              htmlFor="accept-join-request-rol"
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "#1c1c81" }}
            >
              Rol în organizație
            </label>
            <input
              id="accept-join-request-rol"
              type="text"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              maxLength={ROLE_MAX_LENGTH}
              disabled={isPending}
              placeholder="ex. Voluntar"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors bg-white text-sm disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-right text-muted-foreground" aria-live="polite">
              {rol.length}/{ROLE_MAX_LENGTH}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors text-[#475569] disabled:opacity-60"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !canSubmit}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity disabled:opacity-60"
            style={{ background: "#00d495" }}
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {isPending ? "Se confirmă..." : "Confirmă"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

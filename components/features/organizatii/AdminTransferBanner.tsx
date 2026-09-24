"use client";

import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Loader2, RotateCw, XCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { AdminTransfer } from "@/lib/api/admin-transfer";
import { formatTransferDate, transferRecipientLabel } from "@/lib/admin-transfer-format";
import {
  cancelAdminTransferAction,
  fdscCancelAdminTransferAction,
  fdscResendAdminTransferAction,
  resendAdminTransferAction,
} from "@/lib/api/admin-transfer-actions";

/**
 * „Transfer în așteptare către …” with Anulează / Retrimite (US-1 step 9,
 * US-4). A transfer FDSC started is shown to the ONG admin without actions
 * (US-5 AC1); `transfer.canManage` already says so.
 */
export function AdminTransferBanner({
  transfer,
  mode,
  ongDocumentId,
}: {
  transfer: AdminTransfer;
  mode: "ngo-admin" | "fdsc";
  /** Required in `fdsc` mode. */
  ongDocumentId?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelling, startCancel] = useTransition();
  const [isResending, startResend] = useTransition();

  const recipient = transferRecipientLabel(transfer);
  const byFdsc = transfer.initiatedBy === "fdsc";
  const initiatorNote = byFdsc
    ? "Inițiat de FDSC"
    : mode === "fdsc"
      ? `Inițiat de administratorul organizației${transfer.initiatorName ? `, ${transfer.initiatorName}` : ""}`
      : null;

  const cancel = () => {
    setCancelError(null);
    startCancel(async () => {
      const result =
        mode === "fdsc"
          ? await fdscCancelAdminTransferAction(ongDocumentId as string)
          : await cancelAdminTransferAction(transfer.documentId);
      if (result.error) {
        setCancelError(result.error);
        return;
      }
      setConfirming(false);
      toast.success("Transferul a fost anulat.");
      router.refresh();
    });
  };

  const resend = () => {
    startResend(async () => {
      const result =
        mode === "fdsc"
          ? await fdscResendAdminTransferAction(ongDocumentId as string)
          : await resendAdminTransferAction(transfer.documentId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Emailul a fost retrimis.");
    });
  };

  return (
    <div
      role="status"
      className="rounded-xl border px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      style={{ background: "#fffbeb", borderColor: "#fde68a" }}
    >
      <div className="flex items-start gap-3">
        <Clock size={18} className="mt-0.5 shrink-0" style={{ color: "#b45309" }} aria-hidden />
        <div className="text-sm">
          <p className="font-semibold" style={{ color: "#1c1c81" }}>
            Transfer în așteptare către {recipient}
          </p>
          <p className="text-muted-foreground">
            Expiră pe {formatTransferDate(transfer.expiresAt)}.
            {initiatorNote && <> {initiatorNote}.</>}
          </p>
          {!transfer.canManage && (
            <p className="mt-1 text-muted-foreground">
              Doar echipa FDSC poate anula sau retrimite această propunere.
            </p>
          )}
        </div>
      </div>

      {transfer.canManage && (
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={resend}
            disabled={isResending || isCancelling}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-border bg-white hover:bg-slate-50 transition-colors disabled:opacity-60"
            style={{ color: "#1c1c81" }}
          >
            {isResending ? <Loader2 size={14} className="animate-spin" /> : <RotateCw size={14} />}
            Retrimite
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={isResending || isCancelling}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-border bg-white hover:bg-slate-50 transition-colors disabled:opacity-60 text-[#dc2626]"
          >
            <XCircle size={14} />
            Anulează
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        title="Anulezi transferul?"
        description={`Propunerea către ${recipient} nu va mai fi valabilă, iar linkul din email nu va mai funcționa.`}
        confirmLabel="Anulează transferul"
        cancelLabel="Înapoi"
        loading={isCancelling}
        loadingLabel="Se anulează..."
        error={cancelError}
        onConfirm={cancel}
        onCancel={() => {
          setConfirming(false);
          setCancelError(null);
        }}
      />
    </div>
  );
}

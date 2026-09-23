"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ModalOverlay } from "@/components/ui/ModalOverlay";
import { deleteContactAction } from "@/lib/api/contact-actions";
import type { ContactMessage } from "@/lib/api/contact-types";
import { formatDate } from "@/lib/utils/date";
import { ContactStatusSelect } from "./ContactStatusSelect";

export function MesajContactModal({
  message,
  onClose,
}: {
  message: ContactMessage | null;
  onClose: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  if (!message) return null;

  function onConfirmDelete() {
    if (!message) return;
    setDeleteError(null);

    startDelete(async () => {
      try {
        const result = await deleteContactAction(message.documentId);
        if (result.error) {
          setDeleteError(result.error);
          return;
        }
        setConfirmOpen(false);
        onClose();
        toast.success("Mesajul a fost șters.");
      } catch {
        setDeleteError("A apărut o eroare neașteptată. Încearcă din nou.");
      }
    });
  }

  return (
    <>
      <ModalOverlay labelledBy="mesaj-contact-title">
        <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
          <h2
            id="mesaj-contact-title"
            className="font-heading text-lg font-extrabold text-[#162040]"
          >
            {message.name}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            <a href={`mailto:${message.email}`} className="text-[#2563eb] hover:underline">
              {message.email}
            </a>
            {" · "}
            {message.organization || "Fără organizație"}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-y border-border py-3 text-sm">
            <span className="font-semibold text-[#162040]">{message.subject}</span>
            <span className="text-muted-foreground">{formatDate(message.createdAt)}</span>
            <span className="ml-auto">
              <ContactStatusSelect documentId={message.documentId} status={message.status} />
            </span>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-semibold text-[#162040]">Acord GDPR:</span>{" "}
            {formatDate(message.consentedAt)}
          </p>

          {/* `whitespace-pre-wrap`: rândurile scrise de vizitator s-ar lipi altfel. */}
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#162040]">
            {message.message}
          </p>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="text-sm font-semibold text-[#dc2626] hover:underline"
            >
              Șterge mesajul
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-[#162040] hover:border-slate-300"
            >
              Închide
            </button>
          </div>
        </div>
      </ModalOverlay>

      <ConfirmDialog
        open={confirmOpen}
        title="Șterge mesajul"
        description={`Mesajul de la ${message.name} din ${formatDate(message.createdAt)} va fi șters definitiv. Acțiunea nu poate fi anulată.`}
        confirmLabel="Șterge"
        confirmVariant="danger"
        loading={deleting}
        loadingLabel="Se șterge..."
        error={deleteError}
        onConfirm={onConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteError(null);
        }}
      />
    </>
  );
}

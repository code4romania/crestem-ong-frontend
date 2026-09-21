"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteOngAction } from "@/lib/api/ongs-actions";
import { buildOngDeletionWarning } from "./ong-deletion-copy";

export function DeleteOngButton({
  documentId,
  ongName,
  onDeleted,
}: {
  documentId: string;
  ongName: string;
  /** Runs after a successful deletion, once the dialog is closed. */
  onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteOngAction(documentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success("Organizația a fost ștearsă.");
      onDeleted?.();
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label={`Șterge organizația ${ongName}`}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <Trash2 size={16} />
      </button>
      <ConfirmDialog
        open={open}
        title="Șterge organizația"
        description={buildOngDeletionWarning(ongName)}
        confirmLabel="Șterge"
        loading={isPending}
        loadingLabel="Se șterge..."
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

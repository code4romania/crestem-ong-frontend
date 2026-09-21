// components/features/organizatii/DeleteFdscReportButton.tsx
"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteFdscReportAction } from "@/lib/api/ongs-actions";

export function DeleteFdscReportButton({
  ongDocumentId,
  reportDocumentId,
  reportName,
}: {
  ongDocumentId: string;
  reportDocumentId: string;
  reportName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteFdscReportAction(ongDocumentId, reportDocumentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success("Raportul a fost șters.");
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-red-50 hover:border-red-200 transition-colors"
        style={{ color: "#dc2626" }}
        aria-label={`Șterge raportul ${reportName}`}
      >
        <Trash2 size={13} />
      </button>
      <ConfirmDialog
        open={open}
        title="Șterge raportul"
        description={`Ești sigur că vrei să ștergi raportul „${reportName}”? Fișierul încărcat va fi eliminat definitiv.`}
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

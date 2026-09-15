"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { removeReportMemberAction } from "@/lib/api/reports-actions";

export function RemoveReportMemberButton({
  reportId,
  evaluationId,
  nume,
}: {
  reportId: string;
  evaluationId: string;
  nume: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeReportMemberAction(reportId, evaluationId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-red-50 hover:border-[#fca5a5] transition-colors"
        style={{ color: "#ef4444" }}
      >
        <X size={11} /> Elimină
      </button>
      <ConfirmDialog
        open={open}
        title="Elimină din evaluare"
        description={`Ești sigur că vrei să elimini utilizatorul „${nume}” din această rundă de evaluare? Va pierde accesul la acest chestionar, iar invitația va fi ștearsă definitiv.`}
        confirmLabel="Elimină"
        loading={isPending}
        loadingLabel="Se elimină..."
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

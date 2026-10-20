// components/features/programe/DeleteProgramButton.tsx
"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteProgramAction } from "@/lib/api/programs-actions";

export function DeleteProgramButton({
  documentId,
  programName,
}: {
  documentId: string;
  programName: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteProgramAction(documentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success("Programul a fost șters.");
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-red-50 hover:border-red-200 transition-colors"
        style={{ color: "#dc2626", borderColor: "#e2e8f0" }}
      >
        <Trash2 size={12} /> Șterge
      </button>
      <ConfirmDialog
        open={open}
        title="Șterge programul"
        description={`Ești sigur că vrei să ștergi programul „${programName}”?`}
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

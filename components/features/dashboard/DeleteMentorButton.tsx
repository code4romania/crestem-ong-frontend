"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteMentorAction } from "@/lib/api/users-actions";

export function DeleteMentorButton({
  documentId,
  nume,
  accountStatus,
  variant = "icon",
}: {
  documentId: string;
  nume: string;
  accountStatus: "pending" | "active";
  variant?: "icon" | "button";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isInvite = accountStatus === "pending";

  const openDialog = () => {
    setError(null);
    setOpen(true);
  };

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteMentorAction(documentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success(
        result.mode === "deleted"
          ? "Invitația a fost ștearsă."
          : "Persoana resursă a fost ștearsă.",
      );
      // A hard-deleted record no longer exists, so the detail page cannot be
      // re-fetched; leave it for the list.
      if (variant === "button" && result.mode === "deleted") {
        router.replace("/dashboard/persoane-resursa");
        return;
      }
      router.refresh();
    });
  };

  return (
    <>
      {variant === "button" ? (
        <button
          type="button"
          onClick={openDialog}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-red-50 hover:border-[#fca5a5] transition-colors"
          style={{ color: "#b91c1c" }}
        >
          <Trash2 size={14} />
          Șterge persoana resursă
        </button>
      ) : (
        <button
          type="button"
          onClick={openDialog}
          title={`Șterge ${nume}`}
          aria-label={`Șterge ${nume}`}
          className="hover:opacity-70 transition-opacity"
          style={{ color: "#b91c1c" }}
        >
          <Trash2 size={16} />
        </button>
      )}
      <ConfirmDialog
        open={open}
        title="Șterge persoana resursă"
        description={
          isInvite
            ? `Ești sigur că vrei să ștergi invitația pentru ${nume}? Contul nu a fost activat, așa că va fi șters definitiv.`
            : `Ești sigur că vrei să ștergi contul lui ${nume}? Datele personale vor fi anonimizate. Conversațiile, ședințele și rapoartele cu ONG-urile rămân. Acțiunea nu poate fi anulată.`
        }
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

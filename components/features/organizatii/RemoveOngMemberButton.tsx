"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { removeOngMemberAction } from "@/lib/api/ongs-actions";

export function RemoveOngMemberButton({
  documentId,
  nume,
  accountStatus,
}: {
  documentId: string;
  nume: string;
  accountStatus: "pending" | "active";
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isInvite = accountStatus === "pending";

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeOngMemberAction(documentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      toast.success(
        isInvite ? "Invitația a fost anulată." : "Utilizatorul a fost marcat ca neafiliat.",
      );
    });
  };

  const buttonLabel = isInvite
    ? "Anulează invitația"
    : "Marchează ca neafiliat";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-border hover:bg-red-50 hover:border-[#fca5a5] transition-colors"
        style={{ color: "#b91c1c" }}
      >
        {buttonLabel}
      </button>
      <ConfirmDialog
        open={open}
        title={isInvite ? "Anulează invitația" : "Elimină utilizatorul"}
        description={
          isInvite
            ? `Ești sigur că vrei să anulezi invitația pentru ${nume}? Nu a activat contul încă, așa că va fi șters definitiv.`
            : `Ești sigur că vrei să marchezi „${nume}” ca neafiliat? Contul rămâne activ, dar va pierde accesul la această organizație.`
        }
        confirmLabel={buttonLabel}
        loading={isPending}
        loadingLabel="Se elimină..."
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

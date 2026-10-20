"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { deleteMyOngAction } from "@/lib/api/ongs-actions";
import { buildOngDeletionWarning } from "./ong-deletion-copy";

/**
 * `Șterge ONG` for the Admin ONG's own organization ("Business rules.txt": the
 * option is theirs, from their own Acțiuni menu, with no approval step).
 *
 * Same shape as `DeleteOngButton`, which serves the FDSC organizations table,
 * with two differences: it is mounted by the menu instead of owning a trigger
 * of its own — so it survives the dropdown closing — and it redirects
 * afterwards. Deleting the organization ends the admin's membership, so
 * `/dashboard/profil` is a page they may no longer be allowed to load;
 * `deleteMyOngAction` reads their post-deletion role back from the API and
 * returns where they belong (`/dashboard` for a demoted admin,
 * `/dashboard` for one who still runs another organization).
 *
 * Deliberately no typed confirmation: the confirm dialog stands on its own.
 */
export function DeleteOwnOngDialog({
  documentId,
  ongName,
  onClose,
}: {
  documentId: string;
  ongName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteMyOngAction(documentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Organizația a fost ștearsă.");
      router.replace(result.redirectTo ?? "/dashboard");
      router.refresh();
    });
  };

  return (
    <ConfirmDialog
      open
      title="Șterge organizația"
      description={buildOngDeletionWarning(ongName)}
      confirmLabel="Șterge"
      loading={isPending}
      loadingLabel="Se șterge..."
      error={error}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}

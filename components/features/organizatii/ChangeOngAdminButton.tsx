"use client";

import { useState } from "react";
import { UserCog } from "lucide-react";
import type { TransferCandidate } from "@/lib/api/admin-transfer";
import { TransferOngDialog } from "./TransferOngDialog";

/**
 * „Schimbă administratorul” for the FDSC Admin (US-5). Disabled while a
 * transfer is pending — they cancel it first (US-5 A1) — and on an ONG that is
 * not active (US-5 precondition).
 */
export function ChangeOngAdminButton({
  ongDocumentId,
  ongName,
  members,
  disabledReason,
}: {
  ongDocumentId: string;
  ongName: string;
  members: TransferCandidate[];
  disabledReason: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabledReason !== null}
        title={disabledReason ?? undefined}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        style={{ color: "#162040" }}
      >
        <UserCog size={16} style={{ color: "#2dbe8f" }} />
        Schimbă administratorul
      </button>
      {open && (
        <TransferOngDialog
          mode="fdsc"
          ongDocumentId={ongDocumentId}
          ongName={ongName}
          members={members}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

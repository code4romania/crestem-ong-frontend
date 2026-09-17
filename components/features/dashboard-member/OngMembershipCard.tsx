"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { leaveOngAction } from "@/lib/api/membership-actions";
import type { MyOng } from "@/lib/api/evaluations";

function formatYear(iso: string | null) {
  if (!iso) return null;
  const year = new Date(iso).getFullYear();
  return Number.isNaN(year) ? null : String(year);
}

export function OngMembershipCard({ ong }: { ong: MyOng }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const initial = ong.name.trim().charAt(0).toUpperCase() || "?";

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await leaveOngAction(ong.documentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white shrink-0"
          style={{ background: "#162040" }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#162040" }}>
            {ong.name}
          </p>
          <p className="text-xs text-muted-foreground">CUI: {ong.cui}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>
            Adresă
          </p>
          <p className="break-words" style={{ color: "#334155" }}>{ong.adresa ?? "—"}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>
            Website
          </p>
          <p className="break-words" style={{ color: "#334155" }}>{ong.website ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>
            An înființare
          </p>
          <p style={{ color: "#334155" }}>{formatYear(ong.dataInfiintare) ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>
            Domeniu
          </p>
          <p style={{ color: "#334155" }}>{ong.domeniuActivitate ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>
            Rolul tău
          </p>
          <p style={{ color: "#334155" }}>{ong.rol ?? "—"}</p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className="text-sm font-semibold hover:underline"
          style={{ color: "#ef4444" }}
        >
          Părăsește ONG-ul →
        </button>
      </div>

      <ConfirmDialog
        open={open}
        title="Părăsește ONG-ul"
        description={`Ești sigur că vrei să părăsești „${ong.name}”? Vei pierde accesul la evaluările și programele acestei organizații.`}
        confirmLabel="Părăsește ONG-ul"
        loading={isPending}
        loadingLabel="Se procesează..."
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}

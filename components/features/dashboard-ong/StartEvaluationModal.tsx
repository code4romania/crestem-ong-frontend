"use client";

import { toast } from "sonner";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { startEvaluationAction } from "@/lib/api/reports-actions";
import type { OngMember } from "@/lib/api/reports";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

export function StartEvaluationModal({
  members,
  program,
  onClose,
}: {
  members: OngMember[];
  program?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeMembers = useMemo(() => members.filter((m) => m.accountStatus === "active"), [members]);

  const toggle = (documentId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(documentId)) next.delete(documentId);
      else next.add(documentId);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === 0) return;
    setError(null);
    startTransition(async () => {
      const result = await startEvaluationAction([...selected], program);
      if (result.error || !result.reportId) {
        setError(result.error ?? "Nu am putut porni evaluarea.");
        return;
      }
      toast.success("Evaluarea a fost pornită.");
      onClose();
      router.push(`/dashboard/evaluari/${result.reportId}`);
    });
  };

  return (
    <ModalOverlay labelledBy="start-evaluation-title">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <div>
            <h2 id="start-evaluation-title" className="font-heading font-extrabold text-lg" style={{ color: "#162040" }}>
              Adaugă utilizatori la evaluare
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Selectează membrii ONG-ului care nu au fost încă invitați.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            style={{ color: "#94a3b8" }}
            aria-label="Închide"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeMembers.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">Organizația nu are membri activi de invitat.</p>
          ) : (
            activeMembers.map((member) => {
              const checked = selected.has(member.documentId);
              return (
                <label
                  key={member.documentId}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: "#162040" }}
                  >
                    {member.nume.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: "#162040" }}>{member.nume}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(member.documentId)}
                    className="h-4 w-4 rounded border-border shrink-0"
                  />
                </label>
              );
            })
          )}
        </div>

        {error && (
          <p className="px-6 py-2 text-xs" style={{ color: "#ef4444" }}>
            {error}
          </p>
        )}

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50"
            style={{ color: "#475569" }}
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || selected.size === 0}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:opacity-90"
            style={{ background: "#2dbe8f" }}
          >
            {isPending ? "Se pornește..." : "Începe evaluarea"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

"use client";

import { toast } from "sonner";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { addReportMembersAction } from "@/lib/api/reports-actions";
import type { OngMember } from "@/lib/api/reports";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

export function AddReportMembersModal({
  reportId,
  candidates,
  onClose,
}: {
  reportId: string;
  candidates: OngMember[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () =>
      candidates.filter(
        (m) =>
          m.nume.toLowerCase().includes(search.toLowerCase()) ||
          m.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [candidates, search],
  );

  const toggle = (documentId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(documentId)) next.delete(documentId);
      else next.add(documentId);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === 0) {
      setError("Selectează cel puțin un membru.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await addReportMembersAction(reportId, [...selected]);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Utilizatorii au fost adăugați la evaluare.");
      onClose();
    });
  };

  return (
    <ModalOverlay labelledBy="add-report-members-title">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-border flex items-start justify-between gap-4">
          <h2 id="add-report-members-title" className="font-heading font-extrabold text-lg" style={{ color: "#1c1c81" }}>
            Adaugă membri
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
            style={{ color: "#5b6779" }}
            aria-label="Închide"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#5b6779" }} />
            <input
              autoFocus
              type="text"
              placeholder="Caută membri..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-accent-strong transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filtered.length === 0 ? (
            candidates.length === 0 ? (
              <div className="px-6 py-6 flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-muted-foreground">Toți membrii activi sunt deja invitați.</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/dashboard/ong/utilizatori");
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors"
                  style={{ color: "#1c1c81" }}
                >
                  Invită utilizatori
                </button>
              </div>
            ) : (
              <p className="px-6 py-6 text-sm text-muted-foreground">Niciun membru găsit.</p>
            )
          ) : (
            filtered.map((member) => {
              const checked = selected.has(member.documentId);
              return (
                <label
                  key={member.documentId}
                  className="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(member.documentId)}
                    className="h-4 w-4 rounded border-border shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#1c1c81" }}>{member.nume}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {error && (
          <p className="px-6 py-2 text-xs" style={{ color: "#b91c1c" }}>
            {error}
          </p>
        )}

        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {selected.size} {selected.size === 1 ? "membru selectat" : "membri selectați"}
          </p>
          <div className="flex items-center gap-2">
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
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity disabled:opacity-70"
              style={{ background: "#00d495" }}
            >
              {isPending ? "Se adaugă..." : "Adaugă"}
            </button>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

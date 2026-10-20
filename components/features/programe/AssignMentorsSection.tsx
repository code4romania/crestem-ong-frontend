"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Search, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { assignMentorAction, removeMentorAction } from "@/lib/api/programs-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DeletedAccountBadge } from "@/components/ui/DeletedAccountBadge";
import type { AssignedMentor } from "@/lib/api/programs";
import type { ActiveMentor } from "@/lib/api/mentors";

export function AssignMentorsSection({
  programId,
  assigned,
  activeMentors,
  readOnly = false,
}: {
  programId: string;
  assigned: AssignedMentor[];
  activeMentors: ActiveMentor[];
  readOnly?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<AssignedMentor | null>(null);
  const [isPending, startTransition] = useTransition();

  const assignedIds = useMemo(() => new Set(assigned.map((mentor) => mentor.documentId)), [assigned]);
  const candidates = useMemo(
    () =>
      activeMentors.filter(
        (mentor) =>
          !assignedIds.has(mentor.documentId) &&
          (mentor.nume.toLowerCase().includes(search.toLowerCase()) ||
            mentor.email.toLowerCase().includes(search.toLowerCase())),
      ),
    [activeMentors, assignedIds, search],
  );

  const handleAdd = (documentId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await assignMentorAction(programId, documentId);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Persoana resursă a fost alocată.");
    });
  };

  const handleConfirmRemove = () => {
    if (!pendingRemove) return;
    setRemoveError(null);
    startTransition(async () => {
      const result = await removeMentorAction(programId, pendingRemove.documentId);
      if (result.error) {
        setRemoveError(result.error);
        return;
      }
      setPendingRemove(null);
      toast.success("Persoana resursă a fost eliminată din program.");
    });
  };

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold font-heading" style={{ fontSize: "1.0625rem", color: "#1c1c81" }}>
            Alocă persoane resursă în acest program
          </h2>
          <p className="text-sm mt-0.5 text-muted-foreground">
            {assigned.length} {assigned.length === 1 ? "persoană resursă alocată" : "persoane resursă alocate"}
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              setAdding((prev) => !prev);
              setSearch("");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0"
            style={{ background: adding ? "#475569" : "#5656e5" }}
          >
            {adding ? <X size={14} /> : <Plus size={14} />} {adding ? "Închide" : "Adaugă persoană resursă"}
          </button>
        )}
      </div>

      {error && (
        <p className="px-6 py-3 text-xs border-b border-border" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      {adding && !readOnly && (
        <div style={{ borderBottom: "1px solid #e2e8f0" }}>
          <div className="px-6 py-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#5b6779" }} />
              <input
                autoFocus
                type="text"
                placeholder="Caută persoane resursă..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-accent-strong transition-colors"
              />
            </div>
          </div>
          <div className="divide-y divide-border max-h-64 overflow-y-auto" style={{ background: "#fafafa" }}>
            {candidates.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">
                {search ? "Nicio persoană găsită." : "Toate persoanele sunt deja alocate."}
              </p>
            ) : (
              candidates.map((mentor) => (
                <button
                  key={mentor.documentId}
                  type="button"
                  disabled={isPending}
                  onClick={() => handleAdd(mentor.documentId)}
                  className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-blue-50 transition-colors disabled:opacity-60"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#e2e8f0" }}>
                    <Users size={13} style={{ color: "#5b6779" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-600 truncate">{mentor.nume}</p>
                    <p className="text-xs text-muted-foreground truncate">{mentor.email}</p>
                  </div>
                  <Plus size={13} className="flex-shrink-0" style={{ color: "#5656e5" }} />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {assigned.length === 0 && !adding ? (
        <div className="px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">Nicio persoană resursă alocată încă.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {assigned.map((mentor) => (
            <div
              key={mentor.documentId}
              className={`flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors ${
                mentor.isDeleted ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: mentor.isDeleted ? "#f1f5f9" : "#dcfafb" }}
                >
                  <Users size={14} style={{ color: mentor.isDeleted ? "#5b6779" : "#5656e5" }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate" style={{ color: "#1c1c81" }}>{mentor.nume}</p>
                    {mentor.isDeleted && <DeletedAccountBadge />}
                  </div>
                  {mentor.email && (
                    <p className="text-xs text-muted-foreground truncate">{mentor.email}</p>
                  )}
                </div>
              </div>
              {/* Removing a deleted account would detach the assignment its
                  conversations, meetings and reports hang off (BR-34), so the
                  organization would lose the history. Nothing to act on. */}
              {!readOnly && !mentor.isDeleted && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setRemoveError(null);
                    setPendingRemove(mentor);
                  }}
                  aria-label={`Elimină ${mentor.nume}`}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60 shrink-0"
                  style={{ color: "#5b6779" }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Elimină persoana resursă din program"
        description={`Ești sigur că vrei să elimini persoana „${pendingRemove?.nume}” din acest program?`}
        confirmLabel="Elimină"
        loading={isPending}
        loadingLabel="Se elimină..."
        error={removeError}
        onConfirm={handleConfirmRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AddReportMembersModal } from "./AddReportMembersModal";
import { finishReportAction } from "@/lib/api/reports-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { OngMember } from "@/lib/api/reports";

export function ReportDetailActions({
  reportId,
  candidates,
  canFinish,
  canAddMembers,
}: {
  reportId: string;
  candidates: OngMember[];
  canFinish: boolean;
  canAddMembers: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [isFinishPending, startFinishTransition] = useTransition();

  const handleFinish = () => {
    setFinishError(null);
    startFinishTransition(async () => {
      try {
        const result = await finishReportAction(reportId);
        if (result?.error) {
          setFinishError(result.error);
          return;
        }
        setFinishing(false);
        toast.success("Evaluarea a fost finalizată.");
      } catch {
        setFinishError("Nu am putut finaliza evaluarea. Încearcă din nou.");
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {canAddMembers && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors"
          style={{ color: "#475569" }}
        >
          <UserPlus size={14} /> Adaugă utilizatori
        </button>
      )}
      {canFinish && (
        <button
          type="button"
          onClick={() => setFinishing(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: "#2dbe8f", boxShadow: "0 4px 16px rgba(45,190,143,0.3)" }}
        >
          <CheckCircle2 size={14} /> Finalizează evaluare
        </button>
      )}

      {adding && (
        <AddReportMembersModal reportId={reportId} candidates={candidates} onClose={() => setAdding(false)} />
      )}

      <ConfirmDialog
        open={finishing}
        title="Finalizează evaluarea"
        description="Ești sigur că vrei să finalizezi evaluarea? După finalizare nu vei mai putea aduce modificări acestei evaluări, iar membrii invitați care nu au completat chestionarul până acum nu vor mai putea să o facă."
        confirmLabel="Finalizează evaluarea"
        confirmVariant="accent"
        loading={isFinishPending}
        loadingLabel="Se finalizează..."
        error={finishError}
        onConfirm={handleFinish}
        onCancel={() => setFinishing(false)}
      />
    </div>
  );
}

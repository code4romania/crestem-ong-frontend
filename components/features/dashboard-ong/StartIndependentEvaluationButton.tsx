"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StartEvaluationModal } from "./StartEvaluationModal";
import type { EvaluationLock, OngMember } from "@/lib/api/reports";

export function StartIndependentEvaluationButton({
  ongMembers,
  lock,
  showActivePhaseHint = true,
}: {
  ongMembers: OngMember[];
  lock: EvaluationLock | null;
  showActivePhaseHint?: boolean;
}) {
  const [starting, setStarting] = useState(false);

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        disabled={!!lock}
        onClick={() => setStarting(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:brightness-90"
        style={{ background: "#00d495" }}
      >
        <Plus size={14} /> Evaluare independentă
      </button>

      {lock?.reason === "active-report" && (
        <p className="text-xs" style={{ color: "#5b6779" }}>
          Ai deja o evaluare în desfășurare —{" "}
          <Link
            href={`/dashboard/evaluari/${lock.report.documentId}`}
            className="font-semibold hover:underline"
            style={{ color: "#007d58" }}
          >
            vezi evaluarea
          </Link>
        </p>
      )}
      {lock?.reason === "active-phase" && (
        <p className="text-xs" style={{ color: "#5b6779" }}>
          Ai o fază de evaluare activă în programul {lock.programName}
          {showActivePhaseHint ? ". Pornește evaluarea din pagina programului." : "."}
        </p>
      )}

      {starting && <StartEvaluationModal members={ongMembers} onClose={() => setStarting(false)} />}
    </div>
  );
}

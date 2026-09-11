"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { addReportMembersAction } from "@/lib/api/reports-actions";
import type { ReportMember } from "@/lib/api/reports";

/**
 * Lets the ONG admin also respond to their own organization's evaluation round,
 * from the same account they manage it with — no second ngo-member account
 * needed. Mirrors the member-facing PendingEvaluationBanner, but the admin's
 * own respondent row (if any) comes from the round's `invited` list rather
 * than a per-dimension progress payload, so the copy stays status-based
 * instead of "x of y dimensions".
 */
export function SelfEvaluationBanner({
  reportId,
  currentUserDocumentId,
  myEntry,
  canSelfInvite,
}: {
  reportId: string;
  currentUserDocumentId: string;
  myEntry: ReportMember | null;
  canSelfInvite: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!myEntry) {
    if (!canSelfInvite) return null;
    return (
      <div className="rounded-2xl p-6 mb-6 flex items-center justify-between gap-4" style={{ background: "#162040" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#2dbe8f" }}>
            Matricea ta
          </p>
          <p className="text-sm text-white/80 max-w-xl">
            Poți completa și tu matricea de evaluare pentru organizație, direct din acest cont.
          </p>
          {error && (
            <p className="text-sm mt-2" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await addReportMembersAction(reportId, [currentUserDocumentId]);
              if (result.error) {
                setError(result.error);
              }
            });
          }}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ background: "#2dbe8f", boxShadow: "0 4px 16px rgba(45,190,143,0.3)" }}
        >
          <UserPlus size={14} /> {isPending ? "Se adaugă..." : "Completează și tu matricea"}
        </button>
      </div>
    );
  }

  const done = myEntry.status === "completat" || myEntry.status === "nefinalizat";
  const started = myEntry.status !== "neinceput";

  return (
    <div className="rounded-2xl p-6 mb-6 flex items-center justify-between gap-4" style={{ background: "#162040" }}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#2dbe8f" }}>
          Matricea ta
        </p>
        <p className="text-sm text-white/80 max-w-xl">
          {done
            ? "Ai finalizat completarea matricei tale pentru această rundă."
            : started
              ? "Ai început completarea matricei tale. Reia de unde ai rămas pentru a o finaliza."
              : "Ai fost adăugat ca respondent pentru propria organizație. Dă click pe butonul de pornire pentru a începe."}
        </p>
      </div>
      <Link
        href={`/dashboard/evaluari/mea/${myEntry.documentId}`}
        className="shrink-0 inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        style={{ background: "#2dbe8f", boxShadow: "0 4px 16px rgba(45,190,143,0.3)" }}
      >
        {done ? "Vezi rezultatele" : started ? "Continuă evaluarea" : "Pornește evaluarea"}
      </Link>
    </div>
  );
}

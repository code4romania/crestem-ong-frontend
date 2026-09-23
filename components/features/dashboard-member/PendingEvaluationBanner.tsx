import Link from "next/link";
import type { OngEvaluationListItem } from "@/lib/api/evaluations";

/**
 * The "Evaluare în așteptare" card a member sees on both their Overview and
 * Evaluări tabs. The copy follows the evaluation's own progress: someone who
 * has not opened it yet gets the invitation, someone who has gets how far
 * along they already are.
 */
export function PendingEvaluationBanner({
  evaluation,
  ongDocumentId,
  dimensionCount,
}: {
  evaluation: OngEvaluationListItem;
  ongDocumentId: string;
  dimensionCount: number;
}) {
  const started = evaluation.progress.status !== "neinceput";
  const completedCount = evaluation.progress.completedDimensions.length;

  return (
    <div
      className="rounded-2xl p-6 mb-6 flex flex-wrap items-center justify-between gap-4"
      style={{ background: "#162040" }}
    >
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "#2dbe8f" }}
        >
          Evaluare în așteptare
        </p>
        <p className="text-sm text-white/80 max-w-xl">
          {started
            ? `Ai completat ${completedCount} din ${dimensionCount} dimensiuni. Reia evaluarea de unde ai rămas pentru a o finaliza.`
            : "Ai fost adăugat de organizație în procesul de evaluare organizațională. Dă click pe butonul de pornire pentru a începe."}
        </p>
      </div>
      <Link
        href={`/dashboard/${ongDocumentId}/evaluari/${evaluation.documentId}`}
        className="shrink-0 inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        style={{
          background: "#2dbe8f",
          boxShadow: "0 4px 16px rgba(45,190,143,0.3)",
        }}
      >
        {started ? "Continuă evaluarea" : "Pornește evaluarea"}
      </Link>
    </div>
  );
}

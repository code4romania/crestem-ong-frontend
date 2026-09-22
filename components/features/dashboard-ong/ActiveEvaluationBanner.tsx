import Link from "next/link";
import type { ActiveEvaluationContext } from "@/lib/api/reports";

export function ActiveEvaluationBanner({ context }: { context: ActiveEvaluationContext }) {
  const { report, programName, phaseTitle } = context;

  const description = programName
    ? `Ai o evaluare activă în desfășurare în programul ${programName}${phaseTitle ? ` — faza ${phaseTitle}` : ""}.`
    : "Ai o evaluare independentă activă în desfășurare.";

  return (
    <div className="rounded-2xl p-6 mb-6 flex items-center justify-between gap-4" style={{ background: "#162040" }}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#2dbe8f" }}>
          Sesiune de evaluare activă
        </p>
        <p className="text-sm text-white/80 max-w-xl">{description}</p>
      </div>
      <Link
        href={`/dashboard/evaluari/${report.documentId}`}
        className="shrink-0 inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        style={{ background: "#2dbe8f", boxShadow: "0 4px 16px rgba(45,190,143,0.3)" }}
      >
        Vezi evaluarea
      </Link>
    </div>
  );
}

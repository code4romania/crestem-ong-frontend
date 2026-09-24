import Link from "next/link";
import type { OngEvaluation } from "@/lib/api/ongs";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function completionPeriod(evaluation: OngEvaluation) {
  const phase = evaluation.phases?.[0];
  if (phase)
    return `${formatDate(phase.startDate)} – ${formatDate(phase.endDate)}`;
  if (evaluation.finished && evaluation.finishedAt) {
    return `${formatDate(evaluation.createdAt)} – ${formatDate(evaluation.finishedAt)}`;
  }
  return `${formatDate(evaluation.createdAt)} – prezent`;
}

export function OngEvaluationsTable({
  ongDocumentId,
  evaluations,
}: {
  ongDocumentId: string;
  evaluations: OngEvaluation[];
}) {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nu există nicio evaluare pentru această organizație.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
          >
            {[
              "Evaluare",
              "Perioada de completare",
              "Număr completări",
              "Scor obținut",
              "Status",
              "",
            ].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ color: "#5b6779" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {evaluations.map((evaluation) => (
            <tr
              key={evaluation.documentId}
              className="border-b border-border last:border-0 transition-colors"
              style={
                evaluation.finished ? undefined : { background: "#e5f9e5" }
              }
            >
              <td className="px-5 py-3.5">
                <span
                  className="inline-flex items-center gap-2 font-semibold"
                  style={{ color: "#1c1c81" }}
                >
                  {evaluation.name}
                  {!evaluation.finished && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ background: "#e5f9e5", color: "#007d58" }}
                    >
                      curentă
                    </span>
                  )}
                </span>
              </td>
              <td
                className="px-5 py-3.5 whitespace-nowrap"
                style={{ color: "#5b6779" }}
              >
                {completionPeriod(evaluation)}
              </td>
              <td className="px-5 py-3.5" style={{ color: "#475569" }}>
                {evaluation.completedCount}/{evaluation.invitedCount}
              </td>
              <td
                className="px-5 py-3.5 font-semibold"
                style={{ color: "#1c1c81" }}
              >
                {evaluation.scores?.overall != null
                  ? `${evaluation.scores.overall}%`
                  : "—"}
              </td>
              <td className="px-5 py-3.5">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={
                    evaluation.finished
                      ? { background: "#f0fdf4", color: "#15803d" }
                      : { background: "#dcfafb", color: "#5656e5" }
                  }
                >
                  {evaluation.finished ? "Încheiată" : "În desfășurare"}
                </span>
              </td>
              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                <Link
                  href={`/dashboard/organizatii/${ongDocumentId}/evaluari/${evaluation.documentId}`}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: "#007d58" }}
                >
                  {evaluation.finished
                    ? "Vezi rezultatele →"
                    : "Vezi evaluarea →"}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

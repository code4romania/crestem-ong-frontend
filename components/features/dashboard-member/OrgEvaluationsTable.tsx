import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import type { OngEvaluationListItem } from "@/lib/api/evaluations";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

const STATUS_LABELS: Record<string, string> = {
  neinceput: "Neînceput",
  in_lucru: "În progres",
  completat: "Completat",
  nefinalizat: "Nefinalizat",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  neinceput: { bg: "#f8fafc", color: "#5b6779" },
  in_lucru: { bg: "#fefce8", color: "#a16207" },
  completat: { bg: "#f0fdf4", color: "#15803d" },
  nefinalizat: { bg: "#fff5f5", color: "#b91c1c" },
};

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  neinceput: AlertCircle,
  in_lucru: Clock,
  completat: CheckCircle2,
  nefinalizat: XCircle,
};

export function OrgEvaluationsTable({
  ongDocumentId,
  evaluations,
}: {
  ongDocumentId: string;
  evaluations: OngEvaluationListItem[];
}) {
  if (evaluations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nu ai nicio evaluare încă.
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
              "Program",
              "Completat la",
              "Scorul meu",
              "Status",
              "",
            ].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#5b6779" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {evaluations.map((evaluation) => {
            const statusColor =
              STATUS_COLORS[evaluation.progress.status] ??
              STATUS_COLORS.neinceput;
            const StatusIcon =
              STATUS_ICONS[evaluation.progress.status] ?? AlertCircle;
            const isDone =
              evaluation.progress.status === "completat" ||
              evaluation.report?.finished;
            return (
              <tr
                key={evaluation.documentId}
                className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors"
              >
                <td
                  className="px-5 py-3.5 font-semibold"
                  style={{ color: "#1c1c81" }}
                >
                  {evaluation.name ?? "Evaluare"}
                </td>
                <td className="px-5 py-3.5" style={{ color: "#475569" }}>
                  {evaluation.report?.phases[0]?.program?.name ??
                    "Independentă"}
                </td>
                <td className="px-5 py-3.5" style={{ color: "#5b6779" }}>
                  {formatDate(evaluation.completedAt)}
                </td>
                <td
                  className="px-5 py-3.5 font-semibold"
                  style={{ color: "#1c1c81" }}
                >
                  {evaluation.scores.overall != null
                    ? `${evaluation.scores.overall}%`
                    : "—"}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: statusColor.bg,
                      color: statusColor.color,
                    }}
                  >
                    <StatusIcon size={11} />{" "}
                    {STATUS_LABELS[evaluation.progress.status] ??
                      evaluation.progress.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/dashboard/${ongDocumentId}/evaluari/${evaluation.documentId}`}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: "#007d58" }}
                  >
                    {isDone ? "Vezi evaluarea →" : "Continuă evaluarea →"}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

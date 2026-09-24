import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import type { AdminEvaluationRow } from "@/lib/api/evaluations";
import {
  MEMBER_STATUS_COLORS,
  MEMBER_STATUS_ICONS,
  MEMBER_STATUS_LABELS,
} from "@/components/features/evaluari/evaluation-status";
import { formatDate } from "@/lib/utils/date";

const COLUMNS = [
  "Organizație",
  "Utilizator",
  "Program(e)",
  "Status",
  "Scor",
  "Data finalizării",
  "Acțiuni",
];

export function EvaluariTable({ evaluations }: { evaluations: AdminEvaluationRow[] }) {
  if (evaluations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Nicio evaluare găsită.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: "#5b6779" }}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evaluations.map((evaluation) => {
              const statusColor =
                MEMBER_STATUS_COLORS[evaluation.status] ?? MEMBER_STATUS_COLORS.neinceput;
              const StatusIcon = MEMBER_STATUS_ICONS[evaluation.status] ?? AlertCircle;
              // The respondent's matrix lives under Istoric evaluări, addressed by
              // the evaluation's own documentId — the id the round's "Utilizatori
              // invitați" table links with. It exists only once every dimension is
              // submitted, so an unfinished response has nothing to open.
              const href =
                evaluation.ong && evaluation.report && evaluation.status === "completat"
                  ? `/dashboard/organizatii/${evaluation.ong.documentId}/evaluari/${evaluation.report.documentId}/membru/${evaluation.documentId}`
                  : null;
              return (
                <tr
                  key={evaluation.documentId}
                  className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3.5 font-semibold" style={{ color: "#1c1c81" }}>
                    {evaluation.ong?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium" style={{ color: "#1c1c81" }}>
                      {evaluation.user?.nume ?? "—"}
                    </div>
                    {evaluation.user?.email && (
                      <div className="text-xs" style={{ color: "#5b6779" }}>
                        {evaluation.user.email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                    {evaluation.independent
                      ? "Independentă"
                      : evaluation.programs.map((program) => program.name).join(", ")}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                      style={{ background: statusColor.bg, color: statusColor.color }}
                    >
                      <StatusIcon size={11} />{" "}
                      {MEMBER_STATUS_LABELS[evaluation.status] ?? evaluation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold" style={{ color: "#1c1c81" }}>
                    {evaluation.score != null ? `${evaluation.score}%` : "—"}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: "#5b6779" }}>
                    {formatDate(evaluation.completedAt)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {href ? (
                      <Link
                        href={href}
                        className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                        style={{ color: "#007d58" }}
                      >
                        Vezi evaluarea <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="Evaluarea nu este completată"
                        className="inline-flex items-center gap-1 text-xs font-semibold cursor-not-allowed opacity-50"
                        style={{ color: "#5b6779" }}
                      >
                        Vezi evaluarea <ArrowRight size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

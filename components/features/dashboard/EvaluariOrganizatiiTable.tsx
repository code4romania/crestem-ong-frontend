import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import type { AdminReportRow } from "@/lib/api/evaluations";
import { formatDate } from "@/lib/utils/date";

const COLUMNS = [
  "Organizație",
  "Program(e)",
  "Status",
  "Completări",
  "Scor",
  "Data finalizării",
  "Acțiuni",
];

/** Keyed by the backend `roundStatus`; the status filter of this tab offers the same labels. */
export const ROUND_STATUS = {
  in_desfasurare: {
    label: "În desfășurare",
    icon: Clock,
    bg: "#fefce8",
    color: "#a16207",
  },
  finalizata: {
    label: "Finalizată",
    icon: CheckCircle2,
    bg: "#f0fdf4",
    color: "#15803d",
  },
} as const;

export function EvaluariOrganizatiiTable({ reports }: { reports: AdminReportRow[] }) {
  if (reports.length === 0) {
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
            {reports.map((report) => {
              const status = ROUND_STATUS[report.roundStatus] ?? ROUND_STATUS.in_desfasurare;
              const StatusIcon = status.icon;
              const href = report.ong
                ? `/dashboard/organizatii/${report.ong.documentId}/evaluari/${report.documentId}`
                : null;
              return (
                <tr
                  key={report.documentId}
                  className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <div className="font-semibold" style={{ color: "#1c1c81" }}>
                      {report.ong?.name ?? "—"}
                    </div>
                    <div className="text-xs" style={{ color: "#5b6779" }}>
                      {report.name}
                    </div>
                  </td>
                  <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                    {report.independent
                      ? "Independentă"
                      : report.programs.map((program) => program.name).join(", ")}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                      style={{ background: status.bg, color: status.color }}
                    >
                      <StatusIcon size={11} /> {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: "#475569" }}>
                    {report.completedCount}/{report.invitedCount}
                  </td>
                  <td className="px-4 py-3.5 font-semibold" style={{ color: "#1c1c81" }}>
                    {report.score != null ? `${report.score}%` : "—"}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: "#5b6779" }}>
                    {formatDate(report.finishedAt)}
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
                      <span className="text-xs text-muted-foreground">—</span>
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

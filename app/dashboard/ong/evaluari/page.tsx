import Link from "next/link";
import { Layers } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import { findActiveReport, getIndependentStartLock } from "@/lib/api/reports";
import type {
  ReportListItem,
  ReportsCurrent,
  OngMember,
} from "@/lib/api/reports";
import { StartIndependentEvaluationButton } from "@/components/features/dashboard-ong/StartIndependentEvaluationButton";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";

function formatDate(iso: string) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

function reportStatus(report: ReportListItem) {
  if (report.finished)
    return { bg: "#f0fdf4", color: "#15803d", label: "Finalizat" };
  return { bg: "#dcfafb", color: "#5656e5", label: "În desfășurare" };
}

export default async function OngEvaluariPage() {
  const [listRes, currentRes, membersRes] = await Promise.all([
    serverApiFetch<{ data: ReportListItem[] }>("/api/reports"),
    serverApiFetch<{ data: ReportsCurrent }>("/api/reports/current"),
    serverApiFetch<{ data: OngMember[] }>("/api/ongs/members"),
  ]);
  const independentLock = getIndependentStartLock(
    currentRes.data.programRounds,
    currentRes.data.standaloneReports,
  );
  const activeReport = findActiveReport(
    currentRes.data.programRounds,
    currentRes.data.standaloneReports,
  );

  return (
    <div>
      <EvaluationTabs
        active="evaluations"
        basePath="/dashboard/evaluari"
        currentEvaluationHref={
          activeReport
            ? `/dashboard/evaluari/${activeReport.documentId}`
            : "/dashboard/evaluari/curenta"
        }
        comparisonHref="/dashboard/evaluari/comparatie"
      />

      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
        <StartIndependentEvaluationButton
          ongMembers={membersRes.data}
          lock={independentLock}
        />

        <Link
          href="/dashboard/evaluari/model"
          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-slate-50 transition-colors"
          style={{ color: "#475569" }}
        >
          <Layers size={13} /> Vezi modelul matricei
        </Link>
      </div>

      <div>
        {listRes.data.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nu există nicio evaluare pornită încă.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {[
                    "Evaluare",
                    "Program",
                    "Invitați",
                    "Completate",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#5b6779" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listRes.data.map((report) => {
                  const status = reportStatus(report);
                  const programName =
                    report.phases[0]?.program?.name ?? "Independentă";
                  return (
                    <tr
                      key={report.documentId}
                      className="border-b border-border last:border-0 hover:bg-slate-50 transition-colors"
                    >
                      <td
                        className="px-4 py-3.5 font-semibold"
                        style={{ color: "#1c1c81" }}
                      >
                        {report.name}
                        <p className="text-xs font-normal text-muted-foreground mt-0.5">
                          {formatDate(report.createdAt.slice(0, 10))}
                        </p>
                      </td>
                      <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                        {programName}
                      </td>
                      <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                        {report.invitedCount}
                      </td>
                      <td className="px-4 py-3.5" style={{ color: "#475569" }}>
                        {report.completedCount}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/dashboard/evaluari/${report.documentId}`}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: "#007d58" }}
                        >
                          Vezi detalii →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

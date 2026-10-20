import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import { findActiveReport } from "@/lib/api/reports";
import type { ReportListItem, ReportsCurrent } from "@/lib/api/reports";
import type { Dimension } from "@/lib/api/dimensions";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";
import { EvaluationComparisonTable } from "@/components/features/overview/EvaluationComparisonTable";
import { ExportPdfButton } from "@/components/features/overview/ExportPdfButton";

const BASE_PATH = "/dashboard/evaluari";

export default async function OngComparatiePage() {
  const [listRes, currentRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: ReportListItem[] }>("/api/reports"),
    serverApiFetch<{ data: ReportsCurrent }>("/api/reports/current"),
    serverApiFetch<Dimension[]>("/api/dimensions"),
  ]);

  // Only finished evaluations are comparable: an open one keeps taking answers,
  // so its averages would move under the reader between two page loads. Same
  // rule the FDSC comparison page applies.
  const finishedEvaluations = listRes.data.filter((report) => report.finished);
  const activeReport = findActiveReport(
    currentRes.data.programRounds,
    currentRes.data.standaloneReports,
  );

  return (
    <div>
      <div className="print:hidden">
        <EvaluationTabs
          active="comparison"
          basePath={BASE_PATH}
          currentEvaluationHref={
            activeReport ? `${BASE_PATH}/${activeReport.documentId}` : `${BASE_PATH}/curenta`
          }
          comparisonHref={`${BASE_PATH}/comparatie`}
        />
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Comparație evaluări
        </h2>
        <div className="flex items-center gap-3 print:hidden">
          <ExportPdfButton />
          <Link
            href={BASE_PATH}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50 transition-colors"
            style={{ color: "#334155" }}
          >
            <ArrowLeft size={14} /> Înapoi la istoric
          </Link>
        </div>
      </div>

      <EvaluationComparisonTable evaluations={finishedEvaluations} dimensions={dimensionsRes} />
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { OngEvaluation } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { EvaluationComparisonTable } from "@/components/features/overview/EvaluationComparisonTable";
import { ExportPdfButton } from "@/components/features/overview/ExportPdfButton";

export default async function MentorOrganizatieComparatiePage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [evaluationsRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: OngEvaluation[] }>(`/api/ongs/${documentId}/evaluations`),
    serverApiFetch<Dimension[]>("/api/dimensions"),
  ]);

  const finishedEvaluations = evaluationsRes.data.filter((evaluation) => evaluation.finished);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Comparație evaluări
        </h2>
        <div className="flex items-center gap-3 print:hidden">
          <ExportPdfButton />
          <Link
            href={`/dashboard/organizatii/${documentId}/evaluari`}
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

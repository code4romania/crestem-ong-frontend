import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import { findActiveEvaluation } from "@/lib/api/evaluations";
import type { MyOng, OngEvaluationListItem } from "@/lib/api/evaluations";
import type { Dimension } from "@/lib/api/dimensions";
import { MemberOngHeader } from "@/components/features/dashboard-member/MemberOngHeader";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";
import { EvaluationComparisonTable } from "@/components/features/overview/EvaluationComparisonTable";
import type { ComparableEvaluation } from "@/components/features/overview/EvaluationComparisonTable";
import { ExportPdfButton } from "@/components/features/overview/ExportPdfButton";

/**
 * The member's own evaluations across rounds, side by side. The ngo-admin page
 * of the same name compares organization-wide averages; this one never leaves
 * the caller's own answers, because `/api/evaluations/ong/:id` is already
 * scoped to them.
 */
export default async function MemberComparatiePage({
  params,
}: {
  params: Promise<{ ongDocumentId: string }>;
}) {
  const { ongDocumentId } = await params;
  const basePath = `/dashboard/${ongDocumentId}`;

  const [ongsRes, evaluationsRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: MyOng[] }>("/api/me/ongs"),
    serverApiFetch<{ data: OngEvaluationListItem[] }>(
      `/api/evaluations/ong/${ongDocumentId}`,
    ),
    serverApiFetch<Dimension[]>("/api/dimensions"),
  ]);

  const ong = ongsRes.data.find((entry) => entry.documentId === ongDocumentId);
  if (!ong) {
    notFound();
  }

  // Only evaluations the member actually finished are comparable: an unfinished
  // one still has dimensions without answers, so its scores would read as a
  // drop rather than as missing data. Same rule the ngo-admin page applies to
  // open reports.
  const comparable: ComparableEvaluation[] = evaluationsRes.data
    .filter((evaluation) => evaluation.completedAt !== null)
    .map((evaluation) => ({
      documentId: evaluation.documentId,
      createdAt: evaluation.completedAt as string,
      finishedAt: evaluation.completedAt,
      scores: evaluation.scores,
    }));

  const active = findActiveEvaluation(evaluationsRes.data);

  return (
    <div>
      <div className="print:hidden">
        <MemberOngHeader ongName={ong.name} />

        <EvaluationTabs
          active="comparison"
          basePath={basePath}
          currentEvaluationHref={
            active ? `${basePath}/evaluari/${active.documentId}` : `${basePath}/curenta`
          }
          comparisonHref={`${basePath}/comparatie`}
        />
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Comparație evaluări
        </h2>
        <div className="flex items-center gap-3 print:hidden">
          <ExportPdfButton />
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50 transition-colors"
            style={{ color: "#334155" }}
          >
            <ArrowLeft size={14} /> Înapoi la istoric
          </Link>
        </div>
      </div>

      <EvaluationComparisonTable
        evaluations={comparable}
        dimensions={dimensionsRes}
        emptyMessage="Nu ai nicio evaluare finalizată în această organizație."
      />
    </div>
  );
}

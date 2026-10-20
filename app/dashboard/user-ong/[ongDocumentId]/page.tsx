import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers, Rows3 } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import { findActiveEvaluation } from "@/lib/api/evaluations";
import type { MyOng, OngEvaluationListItem } from "@/lib/api/evaluations";
import type { Dimension } from "@/lib/api/dimensions";
import { OrgEvaluationsTable } from "@/components/features/dashboard-member/OrgEvaluationsTable";
import { PendingEvaluationBanner } from "@/components/features/dashboard-member/PendingEvaluationBanner";
import { MemberOngHeader } from "@/components/features/dashboard-member/MemberOngHeader";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";

export default async function MemberOngPage({
  params,
}: {
  params: Promise<{ ongDocumentId: string }>;
}) {
  const { ongDocumentId } = await params;

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

  const evaluations = evaluationsRes.data;
  const activeEvaluation = findActiveEvaluation(evaluations);

  return (
    <div>
      <MemberOngHeader ongName={ong.name} />

      <EvaluationTabs
        active="evaluations"
        basePath={`/dashboard/${ongDocumentId}`}
        currentEvaluationHref={
          activeEvaluation
            ? `/dashboard/${ongDocumentId}/evaluari/${activeEvaluation.documentId}`
            : `/dashboard/${ongDocumentId}/curenta`
        }
        comparisonHref={`/dashboard/${ongDocumentId}/comparatie`}
      />

      {activeEvaluation && (
        <PendingEvaluationBanner
          evaluation={activeEvaluation}
          ongDocumentId={ongDocumentId}
          dimensionCount={dimensionsRes.length}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Evaluările la care ai participat personal ca membru al ONG-ului.
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/${ongDocumentId}/model`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-slate-50 transition-colors"
            style={{ color: "#475569" }}
          >
            <Layers size={13} /> Vezi modelul matricei
          </Link>
          <button
            type="button"
            disabled
            title="Disponibil în curând"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white opacity-40 cursor-not-allowed"
            style={{ background: "#1c1c81" }}
          >
            <Rows3 size={13} /> Compară evaluări
          </button>
        </div>
      </div>

      <OrgEvaluationsTable
        ongDocumentId={ongDocumentId}
        evaluations={evaluations}
      />
    </div>
  );
}

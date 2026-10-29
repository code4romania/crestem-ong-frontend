import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/api/session-server";
import type { OngEvaluationDetail } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { EvaluationDetailContent } from "@/components/features/organizatii/EvaluationDetailContent";
import { AdminReportAction } from "@/components/features/organizatii/AdminReportAction";
import {
  EVALUARI_FROM_PARAM,
  evaluariFromParam,
} from "@/components/features/dashboard/evaluari-from";

export default async function OrganizatieEvaluareDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ documentId: string; reportDocumentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { documentId, reportDocumentId } = await params;
  // Opened from the Evaluări list: going back returns there, not into the
  // organization's own evaluations tab.
  const from = evaluariFromParam((await searchParams)[EVALUARI_FROM_PARAM]);

  const [evaluationRes, dimensionsRes, user] = await Promise.all([
    serverApiFetch<{ data: OngEvaluationDetail }>(
      `/api/ongs/${documentId}/evaluations/${reportDocumentId}`,
    ),
    serverApiFetch<Dimension[]>("/api/dimensions"),
    getCurrentUser(),
  ]);

  const evaluation = evaluationRes.data;
  // FDSC Admin only, and only while a phase of the round still runs.
  const canReopen = user?.role?.type === "super-admin" && evaluation.reopenable;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link
          href={from ?? `/dashboard/organizatii/${documentId}/evaluari`}
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "#5b6779" }}
        >
          <ArrowLeft size={14} /> Înapoi la evaluări
        </Link>
        {canReopen && (
          <AdminReportAction
            mode="reopen"
            ongId={documentId}
            ongName={evaluation.ong.name}
            reportId={evaluation.documentId}
          />
        )}
      </div>

      <EvaluationDetailContent
        evaluation={evaluation}
        dimensions={dimensionsRes}
        from={from}
      />
    </div>
  );
}

import { serverApiFetch } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/api/session-server";
import type { OngEvaluation, OngEvaluationDetail } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { EvaluationDetailContent } from "@/components/features/organizatii/EvaluationDetailContent";
import { AdminReportAction } from "@/components/features/organizatii/AdminReportAction";

export default async function OrganizatieEvaluareCurentaPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [evaluationsRes, user] = await Promise.all([
    serverApiFetch<{ data: OngEvaluation[] }>(`/api/ongs/${documentId}/evaluations`),
    getCurrentUser(),
  ]);

  const current = (evaluationsRes.data ?? []).find((evaluation) => !evaluation.finished) ?? null;

  const [evaluationDetail, dimensions] = current
    ? await Promise.all([
        serverApiFetch<{ data: OngEvaluationDetail }>(
          `/api/ongs/${documentId}/evaluations/${current.documentId}`,
        ),
        serverApiFetch<Dimension[]>("/api/dimensions"),
      ])
    : [null, null];

  // Only the FDSC Admin closes a round early; the editor reads this page too.
  const canClose = user?.role?.type === "super-admin";

  return (
    <div>
      {evaluationDetail && dimensions ? (
        <EvaluationDetailContent
          evaluation={evaluationDetail.data}
          dimensions={dimensions}
          actions={
            canClose ? (
              <AdminReportAction
                mode="close"
                ongId={documentId}
                ongName={evaluationDetail.data.ong.name}
                reportId={evaluationDetail.data.documentId}
              />
            ) : null
          }
        />
      ) : (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nu există nicio evaluare în desfășurare pentru această organizație.
          </p>
        </div>
      )}
    </div>
  );
}

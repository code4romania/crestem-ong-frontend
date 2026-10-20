import { serverApiFetch } from "@/lib/api/server";
import type { OngEvaluation } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { OngEvaluationsTable } from "@/components/features/organizatii/OngEvaluationsTable";
import { MatrixModelButton } from "@/components/features/evaluari/MatrixModelButton";

export default async function OrganizatieDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [evaluationsRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: OngEvaluation[] }>(`/api/ongs/${documentId}/evaluations`),
    serverApiFetch<Dimension[]>("/api/dimensions"),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          Evaluare organizațională
        </h2>
        <MatrixModelButton dimensions={dimensionsRes} />
      </div>

      <OngEvaluationsTable ongDocumentId={documentId} evaluations={evaluationsRes.data} />
    </div>
  );
}

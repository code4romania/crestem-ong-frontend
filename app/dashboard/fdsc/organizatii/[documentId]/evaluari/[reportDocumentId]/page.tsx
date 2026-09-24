import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverApiFetch } from "@/lib/api/server";
import type { OngEvaluationDetail } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { EvaluationDetailContent } from "@/components/features/organizatii/EvaluationDetailContent";

export default async function OrganizatieEvaluareDetailPage({
  params,
}: {
  params: Promise<{ documentId: string; reportDocumentId: string }>;
}) {
  const { documentId, reportDocumentId } = await params;

  const [evaluationRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: OngEvaluationDetail }>(
      `/api/ongs/${documentId}/evaluations/${reportDocumentId}`,
    ),
    serverApiFetch<Dimension[]>("/api/dimensions"),
  ]);

  return (
    <div>
      <Link
        href={`/dashboard/organizatii/${documentId}/evaluari`}
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
        style={{ color: "#5b6779" }}
      >
        <ArrowLeft size={14} /> Înapoi la evaluări
      </Link>

      <EvaluationDetailContent evaluation={evaluationRes.data} dimensions={dimensionsRes} />
    </div>
  );
}

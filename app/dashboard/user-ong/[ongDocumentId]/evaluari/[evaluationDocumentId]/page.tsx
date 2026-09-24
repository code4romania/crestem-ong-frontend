import Link from "next/link";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";
import type { Dimension } from "@/lib/api/dimensions";
import type { EvaluationDetail } from "@/lib/api/evaluations";
import { EvaluationWizard } from "@/components/features/dashboard-member/EvaluationWizard";

export default async function MemberEvaluationWizardPage({
  params,
}: {
  params: Promise<{ ongDocumentId: string; evaluationDocumentId: string }>;
}) {
  const { ongDocumentId, evaluationDocumentId } = await params;

  const dimensionsRes = await serverApiFetch<Dimension[]>("/api/dimensions");

  let evaluation: EvaluationDetail;
  try {
    const res = await serverApiFetch<{ data: EvaluationDetail }>(`/api/evaluations/${evaluationDocumentId}`);
    evaluation = res.data;
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Nu am putut încărca evaluarea.";
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm mb-4" style={{ color: "#b91c1c" }}>
          {message}
        </p>
        <Link
          href={`/dashboard/${ongDocumentId}`}
          className="text-sm font-semibold hover:underline"
          style={{ color: "#007d58" }}
        >
          Înapoi la evaluările mele
        </Link>
      </div>
    );
  }

  return (
    <EvaluationWizard
      ongDocumentId={ongDocumentId}
      evaluationDocumentId={evaluationDocumentId}
      dimensions={dimensionsRes}
      initialEvaluation={evaluation}
    />
  );
}

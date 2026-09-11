import Link from "next/link";
import { serverApiFetch } from "@/lib/api/server";
import { ApiError } from "@/lib/api/client";
import type { Dimension } from "@/lib/api/dimensions";
import type { EvaluationDetail } from "@/lib/api/evaluations";
import { EvaluationWizard } from "@/components/features/dashboard-member/EvaluationWizard";

const BACK_HREF = "/dashboard/evaluari";

/**
 * The ONG admin's own respondent view of an evaluation — reached after they
 * add themselves via SelfEvaluationBanner on the round detail page. Mirrors
 * app/dashboard/user-ong/[ongDocumentId]/evaluari/[evaluationDocumentId]/page.tsx
 * (the ngo-member equivalent), reusing the same wizard; admin routes never
 * carry an ongDocumentId segment, so backHref is overridden instead.
 */
export default async function OngSelfEvaluationPage({
  params,
}: {
  params: Promise<{ evaluationDocumentId: string }>;
}) {
  const { evaluationDocumentId } = await params;

  const dimensionsRes = await serverApiFetch<Dimension[]>("/api/dimensions");

  let evaluation: EvaluationDetail;
  try {
    const res = await serverApiFetch<{ data: EvaluationDetail }>(`/api/evaluations/${evaluationDocumentId}`);
    evaluation = res.data;
  } catch (err) {
    const message = err instanceof ApiError ? err.message : "Nu am putut încărca evaluarea.";
    return (
      <div className="bg-white rounded-xl border border-border p-8 text-center">
        <p className="text-sm mb-4" style={{ color: "#ef4444" }}>
          {message}
        </p>
        <Link href={BACK_HREF} className="text-sm font-semibold hover:underline" style={{ color: "#2dbe8f" }}>
          Înapoi la evaluări
        </Link>
      </div>
    );
  }

  return (
    <EvaluationWizard
      evaluationDocumentId={evaluationDocumentId}
      dimensions={dimensionsRes}
      initialEvaluation={evaluation}
      backHref={BACK_HREF}
    />
  );
}

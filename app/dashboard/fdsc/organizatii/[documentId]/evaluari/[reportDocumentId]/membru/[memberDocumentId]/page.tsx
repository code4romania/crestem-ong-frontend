import { notFound } from "next/navigation";
import { serverApiFetch } from "@/lib/api/server";
import type { OngEvaluationDetail } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { EvaluationRespondentContent } from "@/components/features/organizatii/EvaluationRespondentContent";
import {
  EVALUARI_FROM_PARAM,
  evaluariFromParam,
  evaluariFromTab,
  withEvaluariFrom,
} from "@/components/features/dashboard/evaluari-from";

export default async function OrganizatieEvaluareMembruPage({
  params,
  searchParams,
}: {
  params: Promise<{ documentId: string; reportDocumentId: string; memberDocumentId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { documentId, reportDocumentId, memberDocumentId } = await params;
  const from = evaluariFromParam((await searchParams)[EVALUARI_FROM_PARAM]);

  const [evaluationRes, dimensionsRes] = await Promise.all([
    serverApiFetch<{ data: OngEvaluationDetail }>(
      `/api/ongs/${documentId}/evaluations/${reportDocumentId}`,
    ),
    serverApiFetch<Dimension[]>("/api/dimensions"),
  ]);

  // Only finished respondents have a matrix worth showing; anything else is a
  // hand-typed URL.
  const respondent = (evaluationRes.data.evaluations ?? []).find(
    (entry) => entry.documentId === memberDocumentId && entry.progress?.complete,
  );
  if (!respondent) notFound();

  const reportHref = `/dashboard/organizatii/${documentId}/evaluari/${reportDocumentId}`;
  // From the list's users tab this page was opened directly, so back leads to
  // the list. From its organizations tab it was reached through the report,
  // which keeps the list's address so the next step back still ends there.
  const back =
    from == null
      ? { href: reportHref, label: "Înapoi la evaluare" }
      : evaluariFromTab(from) === "organizatii"
        ? { href: withEvaluariFrom(reportHref, from), label: "Înapoi la evaluare" }
        : { href: from, label: "Înapoi la evaluări" };

  return (
    <EvaluationRespondentContent
      evaluation={evaluationRes.data}
      respondent={respondent}
      dimensions={dimensionsRes}
      backHref={back.href}
      backLabel={back.label}
    />
  );
}

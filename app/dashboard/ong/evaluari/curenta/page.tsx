import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/api/server";
import { getIndependentStartLock } from "@/lib/api/reports";
import type { OngMember, ReportListItem, ReportsCurrent } from "@/lib/api/reports";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";
import { NoActiveEvaluationBanner } from "@/components/features/dashboard-ong/NoActiveEvaluationBanner";

const BASE_PATH = "/dashboard/evaluari";
const CURRENT_PATH = `${BASE_PATH}/curenta`;

/**
 * "Evaluare curentă" for the ngo-admin. There is no separate view for it: the
 * organization's unfinished report already has a detail page, so this route
 * only resolves which report that is and hands over to it.
 */
export default async function OngEvaluareCurentaPage() {
  const listRes = await serverApiFetch<{ data: ReportListItem[] }>("/api/reports");
  const current = (listRes.data ?? []).find((report) => !report.finished) ?? null;

  if (current) {
    redirect(`${BASE_PATH}/${current.documentId}`);
  }

  // Fetched only here, past the redirect, so the common case stays one request.
  const [currentRes, membersRes] = await Promise.all([
    serverApiFetch<{ data: ReportsCurrent }>("/api/reports/current"),
    serverApiFetch<{ data: OngMember[] }>("/api/ongs/members"),
  ]);

  return (
    <div>
      <EvaluationTabs
        active="current"
        basePath={BASE_PATH}
        currentEvaluationHref={CURRENT_PATH}
        comparisonHref={`${BASE_PATH}/comparatie`}
      />

      <NoActiveEvaluationBanner
        ongMembers={membersRes.data}
        lock={getIndependentStartLock(
          currentRes.data.programRounds,
          currentRes.data.standaloneReports,
        )}
      />
    </div>
  );
}

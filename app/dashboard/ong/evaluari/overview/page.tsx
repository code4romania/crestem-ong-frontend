import { serverApiFetch } from "@/lib/api/server";
import {
  findActiveReport,
  findCurrentProgramRound,
  getIndependentStartLock,
  getProgramOverviewStats,
} from "@/lib/api/reports";
import type { OngMember, ReportsCurrent } from "@/lib/api/reports";
import type { AssignedMentor } from "@/lib/api/programs";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";
import { OverviewSections } from "@/components/features/overview/OverviewSections";
import { NoActiveEvaluationBanner } from "@/components/features/dashboard-ong/NoActiveEvaluationBanner";

const BASE_PATH = "/dashboard/evaluari";

export default async function OngEvaluariOverviewPage() {
  const currentRes = await serverApiFetch<{ data: ReportsCurrent }>("/api/reports/current");
  const round = findCurrentProgramRound(currentRes.data.programRounds);

  const mentors: AssignedMentor[] = round
    ? (
        await serverApiFetch<{ data: AssignedMentor[] }>(
          `/api/programs/${encodeURIComponent(round.program.documentId)}/ong-mentors`,
        )
      ).data
    : [];

  const stats = round ? getProgramOverviewStats(round) : null;
  const activeReport = findActiveReport(currentRes.data.programRounds, currentRes.data.standaloneReports);
  // Only needed by the start-evaluation modal, which is offered only when nothing is in progress.
  const ongMembers: OngMember[] = activeReport
    ? []
    : (await serverApiFetch<{ data: OngMember[] }>("/api/ongs/members")).data;

  return (
    <div>
      <EvaluationTabs
        active="overview"
        basePath={BASE_PATH}
        currentEvaluationHref={
          activeReport ? `${BASE_PATH}/${activeReport.documentId}` : `${BASE_PATH}/curenta`
        }
        comparisonHref={`${BASE_PATH}/comparatie`}
      />

      {!activeReport && (
        <NoActiveEvaluationBanner
          ongMembers={ongMembers}
          lock={getIndependentStartLock(
            currentRes.data.programRounds,
            currentRes.data.standaloneReports,
          )}
        />
      )}

      <OverviewSections
        round={round}
        mentors={mentors}
        totalSessions={stats?.totalEvaluationSessions ?? 0}
        historyHref={BASE_PATH}
        currentEvaluationHref={
          stats?.currentReport ? `${BASE_PATH}/${stats.currentReport.documentId}` : null
        }
        showMentorMessage
      />
    </div>
  );
}

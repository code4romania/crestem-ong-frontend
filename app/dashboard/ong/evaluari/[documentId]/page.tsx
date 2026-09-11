import { serverApiFetch } from "@/lib/api/server";
import { getCurrentUser } from "@/lib/api/session-server";
import { EvaluationTabs } from "@/components/features/overview/EvaluationTabs";
import { findActiveReport } from "@/lib/api/reports";
import type { ReportDetail, ReportMembers, OngMember, ReportsCurrent } from "@/lib/api/reports";
import type { Dimension } from "@/lib/api/dimensions";
import { DimensionsBreakdown } from "@/components/features/evaluari/DimensionsBreakdown";
import { ReportDetailActions } from "@/components/features/dashboard-ong/ReportDetailActions";
import { ReportMembersTable } from "@/components/features/dashboard-ong/ReportMembersTable";
import { SelfEvaluationBanner } from "@/components/features/dashboard-ong/SelfEvaluationBanner";

const BASE_PATH = "/dashboard/evaluari";

function formatDate(iso: string) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

export default async function OngEvaluareDetailPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;

  const [reportRes, membersRes, ongMembersRes, dimensionsRes, currentRes, currentUser] = await Promise.all([
    serverApiFetch<{ data: ReportDetail }>(`/api/reports/${documentId}`),
    serverApiFetch<{ data: ReportMembers }>(`/api/reports/${documentId}/members`),
    serverApiFetch<{ data: OngMember[] }>("/api/ongs/members"),
    serverApiFetch<Dimension[]>("/api/dimensions"),
    serverApiFetch<{ data: ReportsCurrent }>("/api/reports/current"),
    getCurrentUser(),
  ]);

  const report = reportRes.data;
  const activeReport = findActiveReport(currentRes.data.programRounds, currentRes.data.standaloneReports);
  const invitedIds = new Set(membersRes.data.invited.map((entry) => entry.user?.documentId).filter(Boolean));
  const candidates = ongMembersRes.data.filter(
    (member) => member.accountStatus === "active" && !invitedIds.has(member.documentId),
  );
  const phase = report.phases[0] ?? null;
  const programName = phase?.program?.name ?? "Evaluare independentă";
  const canFinish = !report.finished && report.phases.length === 0;

  const periodDays =
    phase != null
      ? Math.round(
          (new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) / 86_400_000,
        ) + 1
      : null;

  const independentPeriod =
    phase == null
      ? `${formatDate(report.createdAt)} - ${report.finished && report.finishedAt ? formatDate(report.finishedAt) : "prezent"}`
      : null;

  const completion = report.invitedCount > 0 ? Math.round((report.completedCount / report.invitedCount) * 100) : 0;

  const myEntry = currentUser
    ? (membersRes.data.invited.find((entry) => entry.user?.documentId === currentUser.documentId) ?? null)
    : null;

  return (
    <div>
      <EvaluationTabs
        active={report.finished ? "evaluations" : "current"}
        basePath={BASE_PATH}
        currentEvaluationHref={
          activeReport ? `${BASE_PATH}/${activeReport.documentId}` : `${BASE_PATH}/curenta`
        }
        comparisonHref={`${BASE_PATH}/comparatie`}
      />

      {currentUser && (
        <SelfEvaluationBanner
          reportId={documentId}
          currentUserDocumentId={currentUser.documentId}
          myEntry={myEntry}
          canSelfInvite={!report.finished}
        />
      )}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
            {report.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {programName} · {report.finished ? "Finalizată" : "În desfășurare"}
          </p>
        </div>
        <ReportDetailActions
          reportId={documentId}
          candidates={candidates}
          canFinish={canFinish}
          canAddMembers={!report.finished}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Perioadă de completare</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {periodDays != null ? `${periodDays} ${periodDays === 1 ? "zi" : "zile"}` : independentPeriod}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {phase != null ? `${formatDate(phase.startDate)} – ${formatDate(phase.endDate)}` : "Evaluare independentă"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Total completări</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {report.completedCount}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">din {report.invitedCount} invitați</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Scor total</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {report.scores.overall != null ? `${report.scores.overall}%` : "—"}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {report.scores.overall != null ? "" : "disponibil la finalizare"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ color: "#162040" }}>
            Progres completare matrice
          </h2>
          <span className="text-2xl font-extrabold font-heading" style={{ color: "#2dbe8f" }}>
            {completion}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "#e2e8f0" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${completion}%`, background: "linear-gradient(90deg, #2dbe8f, #1a9e77)" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {report.completedCount} din {report.invitedCount} {report.invitedCount === 1 ? "membru a finalizat" : "membri au finalizat"} evaluarea
        </p>
      </div>

      <DimensionsBreakdown
        dimensions={dimensionsRes}
        scores={report.scores}
        comments={report.comments}
      />

      <ReportMembersTable
        reportId={documentId}
        invited={membersRes.data.invited}
        candidates={candidates}
        canAddMembers={!report.finished}
      />
    </div>
  );
}

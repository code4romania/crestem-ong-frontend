import type { OngEvaluationDetail } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import { DimensionsBreakdown } from "@/components/features/evaluari/DimensionsBreakdown";
import { EvaluationRespondentsTable } from "./EvaluationRespondentsTable";
import { collectComments } from "./evaluation-comments";

function formatDate(iso: string) {
  if (!iso) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
}

/**
 * `anonymous` withholds who answered what: arguments lose their author and the
 * respondents table becomes a numbered list of evaluations. Mentors read the
 * evaluation this way; FDSC staff see the real people.
 */
export function EvaluationDetailContent({
  evaluation,
  dimensions,
  anonymous = false,
}: {
  evaluation: OngEvaluationDetail;
  dimensions: Dimension[];
  anonymous?: boolean;
}) {
  const phase = evaluation.phases?.[0] ?? null;
  const programName = phase?.program?.name ?? "Evaluare independentă";

  const periodDays =
    phase != null
      ? Math.round(
          (new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) / 86_400_000,
        ) + 1
      : null;

  const independentPeriod =
    phase == null
      ? `${formatDate(evaluation.createdAt)} - ${evaluation.finished && evaluation.finishedAt ? formatDate(evaluation.finishedAt) : "prezent"}`
      : null;

  const completion =
    evaluation.invitedCount > 0
      ? Math.round((evaluation.completedCount / evaluation.invitedCount) * 100)
      : 0;

  const respondents = evaluation.evaluations ?? [];
  // Report-wide arguments come only from finished respondents — a half-filled
  // evaluation has nothing to average in.
  const completed = respondents.filter((respondent) => respondent.progress?.complete);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#1c1c81" }}>
          {evaluation.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {programName} · {evaluation.finished ? "Finalizată" : "În desfășurare"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Perioadă de completare</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#1c1c81" }}>
            {periodDays != null ? `${periodDays} ${periodDays === 1 ? "zi" : "zile"}` : independentPeriod}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {phase != null ? `${formatDate(phase.startDate)} – ${formatDate(phase.endDate)}` : "Evaluare independentă"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Total completări</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#1c1c81" }}>
            {evaluation.completedCount}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">din {evaluation.invitedCount} invitați</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Scor total</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#1c1c81" }}>
            {evaluation.scores.overall != null ? `${evaluation.scores.overall}%` : "—"}
          </p>
          <p className="text-xs mt-1 text-muted-foreground">
            {evaluation.scores.overall != null ? "" : "disponibil la finalizare"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base" style={{ color: "#1c1c81" }}>
            Progres completare matrice
          </h2>
          <span className="text-2xl font-extrabold font-heading" style={{ color: "#007d58" }}>
            {completion}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: "#e2e8f0" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${completion}%`, background: "linear-gradient(90deg, #00d495, #1a9e77)" }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {evaluation.completedCount} din {evaluation.invitedCount}{" "}
          {evaluation.invitedCount === 1 ? "membru a finalizat" : "membri au finalizat"} evaluarea
        </p>
      </div>

      <DimensionsBreakdown
        dimensions={dimensions}
        scores={evaluation.scores}
        comments={collectComments(completed, { attributed: !anonymous })}
      />

      <EvaluationRespondentsTable respondents={respondents} anonymous={anonymous} />
    </>
  );
}

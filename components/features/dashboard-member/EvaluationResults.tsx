import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Dimension } from "@/lib/api/dimensions";
import type { EvaluationDetail } from "@/lib/api/evaluations";
import { DimensionsBreakdown, type SelectedAnswers } from "@/components/features/evaluari/DimensionsBreakdown";
import { collectComments } from "@/components/features/organizatii/evaluation-comments";

const MONTHS_RO = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "noi", "dec"];

function formatShortDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return `${day} ${MONTHS_RO[month - 1]} ${year}`;
}

function formatPeriod(startIso: string, endIso: string) {
  const [startYear, startMonth, startDay] = startIso.slice(0, 10).split("-").map(Number);
  const [endYear, endMonth, endDay] = endIso.slice(0, 10).split("-").map(Number);
  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay}–${endDay} ${MONTHS_RO[startMonth - 1]} ${startYear}`;
  }
  return `${startDay} ${MONTHS_RO[startMonth - 1]} ${startYear} – ${endDay} ${MONTHS_RO[endMonth - 1]} ${endYear}`;
}

function formatIndependentPeriod(createdAt: string, finished: boolean, finishedAt: string | null) {
  const end = finished && finishedAt ? formatShortDate(finishedAt) : "prezent";
  return `${formatShortDate(createdAt)} – ${end}`;
}

export function EvaluationResults({
  evaluation,
  dimensions,
  backHref,
}: {
  evaluation: EvaluationDetail;
  dimensions: Dimension[];
  backHref: string;
}) {
  const phase = evaluation.report?.phases[0] ?? null;
  const programName = phase?.program?.name ?? null;

  // Same shape the FDSC/mentor single-respondent view uses (EvaluationRespondentContent) —
  // the member should see the same sub-indicator scores and picked answers on their own matrix.
  const answers: SelectedAnswers = {};
  for (const block of evaluation.dimensions ?? []) {
    for (const entry of block.quiz ?? []) {
      answers[entry.questionId] = { answer: entry.answer, answerLabel: entry.answerLabel };
    }
  }
  const comments = collectComments([evaluation], { attributed: false });

  return (
    <div>
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: "#94a3b8" }}>
        <ArrowLeft size={14} /> Înapoi la evaluările mele
      </Link>

      <h1 className="text-3xl font-heading font-extrabold mb-1" style={{ color: "#162040" }}>
        {evaluation.report?.name ?? "Evaluare"}
      </h1>
      {programName && (
        <p className="text-sm font-semibold mb-6" style={{ color: "#2dbe8f" }}>
          Program: {programName}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Perioadă</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {phase
              ? formatPeriod(phase.startDate, phase.endDate)
              : evaluation.report
                ? formatIndependentPeriod(
                    evaluation.report.createdAt,
                    evaluation.report.finished,
                    evaluation.report.finishedAt,
                  )
                : "Evaluare independentă"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Completat la</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {evaluation.completedAt ? formatShortDate(evaluation.completedAt) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-5">
          <p className="text-xs mb-2 text-muted-foreground">Scorul meu</p>
          <p className="text-3xl font-extrabold font-heading" style={{ color: "#162040" }}>
            {evaluation.scores.overall != null ? `${evaluation.scores.overall}%` : "—"}
          </p>
        </div>
      </div>

      <DimensionsBreakdown
        dimensions={dimensions}
        scores={evaluation.scores}
        comments={comments}
        commentsOpen
        answers={answers}
      />
    </div>
  );
}

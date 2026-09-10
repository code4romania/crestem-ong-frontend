import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { OngEvaluationDetail, OngEvaluationRespondent } from "@/lib/api/ongs";
import type { Dimension } from "@/lib/api/dimensions";
import {
  DimensionsBreakdown,
  type SelectedAnswers,
} from "@/components/features/evaluari/DimensionsBreakdown";
import { collectComments } from "./evaluation-comments";
import { respondentIndex, respondentLabel } from "./respondent-label";

/**
 * One respondent's own matrix, reached from the invited-users table on the
 * evaluation page. Deliberately bare — the matrix and the arguments the member
 * wrote, nothing else; the report-wide statistics stay on the page linking here.
 */
export function EvaluationRespondentContent({
  evaluation,
  respondent,
  dimensions,
  backHref,
  anonymous = false,
}: {
  evaluation: OngEvaluationDetail;
  respondent: OngEvaluationRespondent;
  dimensions: Dimension[];
  backHref: string;
  anonymous?: boolean;
}) {
  const respondents = evaluation.evaluations ?? [];
  const heading = respondentLabel(
    respondent,
    respondentIndex(respondents, respondent.documentId),
    anonymous,
  );

  // This page exists to show what this one member answered — FDSC staff and the
  // resource person need the picked options, not the percentages the aggregate
  // report already carries.
  const answers: SelectedAnswers = {};
  for (const block of respondent.dimensions ?? []) {
    for (const entry of block.quiz ?? []) {
      answers[entry.questionId] = {
        answer: entry.answer,
        answerLabel: entry.answerLabel,
      };
    }
  }
  return (
    <div>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6"
        style={{ color: "#94a3b8" }}
      >
        <ArrowLeft size={14} /> Înapoi la evaluare
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-heading font-extrabold" style={{ color: "#162040" }}>
          {heading}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{evaluation.name}</p>
      </div>

      <DimensionsBreakdown
        dimensions={dimensions}
        scores={respondent.scores}
        comments={collectComments([respondent], { attributed: false })}
        commentsOpen
        answers={answers}
      />
    </div>
  );
}

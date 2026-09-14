"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Circle, MessageSquare } from "lucide-react";
import type { Dimension, DimensionQuestion } from "@/lib/api/dimensions";
import type { EvaluationAnswer } from "@/lib/api/evaluations";
import type { DimensionComment, ReportScores } from "@/lib/api/reports";
import { dimensionColor, dimensionPillStyle } from "@/lib/api/dimension-colors";

/** Selected option per question, keyed by `questionId` — see `answers` below. */
export type SelectedAnswers = Record<
  string,
  Pick<EvaluationAnswer, "answer" | "answerLabel">
>;

/**
 * The option a single respondent picked for one sub-indicator, shown in the
 * expanded details. FDSC staff and the resource person open a member's own matrix
 * to read these; the chip alone only carries the score, not which answer it came from.
 */
function SelectedAnswer({
  entry,
}: {
  entry: Pick<EvaluationAnswer, "answer" | "answerLabel"> | undefined;
}) {
  if (!entry || entry.answer == null) {
    return (
      <div className="mt-1.5 px-3 py-2 rounded-xl" style={{ background: "#f8fafc" }}>
        <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>
          Fără răspuns
        </span>
      </div>
    );
  }
  return (
    <div
      className="mt-1.5 flex items-start gap-2 px-3 py-2 rounded-xl"
      style={{ background: "#f0faf6" }}
    >
      <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: "#2dbe8f" }} />
      <span className="text-xs" style={{ color: "#162040" }}>
        <span className="font-bold">{entry.answer}</span>
        {entry.answerLabel ? (
          <span className="font-medium"> · {entry.answerLabel}</span>
        ) : null}
      </span>
    </div>
  );
}

function ScoreBar({
  score,
  width,
  height,
}: {
  score: number | null;
  width: string;
  height: string;
}) {
  return (
    <div className={`${width} ${height} rounded-full overflow-hidden`} style={{ background: "#e2e8f0" }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${score ?? 0}%`, background: dimensionColor(score) }}
      />
    </div>
  );
}

/** One sub-indicator, rendered as a pill carrying its own tag/label and score. */
function SubindicatorChip({ question, score }: { question: DimensionQuestion; score: number | null }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold leading-none"
      style={dimensionPillStyle(score)}
    >
      {question.tag ?? question.question}
      <span className="opacity-70">· {score != null ? `${score}%` : "—"}</span>
    </span>
  );
}

/**
 * One dimension card: name + description + overall score, the sub-indicators as
 * chips with their full question text listed below (the chip's tag alone isn't
 * descriptive enough to place the sub-indicator), and (when there's anything to
 * show) a "Detalii" toggle revealing the picked answer per sub-indicator and the
 * free-text arguments respondents wrote.
 */
function DimensionCard({
  dimension,
  score,
  questionScores,
  comments,
  defaultOpen,
  answers,
}: {
  dimension: Dimension;
  score: number | null;
  questionScores: ReportScores["questions"];
  comments: DimensionComment[];
  defaultOpen: boolean;
  answers?: SelectedAnswers;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasDetails = Boolean(answers) || comments.length > 0;

  return (
    <div className="py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        {score != null ? (
          <CheckCircle2 size={16} className="flex-shrink-0" style={{ color: "#2dbe8f" }} />
        ) : (
          <Circle size={16} className="flex-shrink-0" style={{ color: "#cbd5e1" }} />
        )}
        <span className="flex-1 text-sm font-semibold" style={{ color: "#162040" }}>
          {dimension.name}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreBar score={score} width="w-28" height="h-2" />
          <span className="text-sm font-bold w-12 text-right" style={{ color: dimensionColor(score) }}>
            {score != null ? `${score}%` : "—"}
          </span>
        </div>
      </div>

      {dimension.description && (
        <p className="ml-7 mt-1 text-xs" style={{ color: "#94a3b8" }}>
          {dimension.description}
        </p>
      )}

      <div className="ml-7 mt-3 flex flex-wrap gap-2">
        {(dimension.quiz ?? []).map((question) => (
          <SubindicatorChip key={question.id} question={question} score={questionScores?.[question.id] ?? null} />
        ))}
      </div>

      <div className="ml-7 mt-2 space-y-1">
        {(dimension.quiz ?? []).map((question) => (
          <p key={question.id} className="text-xs" style={{ color: "#64748b" }}>
            {question.tag && (
              <span className="font-semibold" style={{ color: "#94a3b8" }}>
                {question.tag}
                {" · "}
              </span>
            )}
            {question.question}
          </p>
        ))}
      </div>

      {hasDetails && (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="ml-7 mt-3 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
          style={{ color: "#64748b" }}
        >
          <MessageSquare size={13} />
          Detalii{comments.length > 0 ? ` (${comments.length} ${comments.length === 1 ? "comentariu" : "comentarii"})` : ""}
          <ChevronDown
            size={13}
            className="transition-transform"
            style={{ transform: open ? "rotate(180deg)" : undefined }}
          />
        </button>
      )}

      {open && hasDetails && (
        <div className="ml-7 mt-3 space-y-4">
          {answers && (
            <div className="space-y-3">
              {(dimension.quiz ?? []).map((question) => (
                <div key={question.id}>
                  {question.tag && (
                    <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                      {question.tag}
                    </p>
                  )}
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    {question.question}
                  </p>
                  <SelectedAnswer entry={answers[question.id]} />
                </div>
              ))}
            </div>
          )}

          {comments.length > 0 && (
            <div className="space-y-2">
              {comments.map((comment, index) => (
                <div
                  key={index}
                  className="rounded-lg px-3 py-2.5 text-xs"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155" }}
                >
                  {comment.author && (
                    <p className="font-semibold mb-1" style={{ color: "#162040" }}>
                      {comment.author}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The "Dimensiuni evaluate" panel: one card per dimension with its description,
 * sub-indicators as scored chips, and an overall score. Shared by the ONG admin
 * report page and the FDSC/mentor organization pages, which differ only in the
 * data they hand in — the ONG admin's `comments` never carry an author.
 *
 * `detailsOpen` expands every card's details on mount, for the single-respondent
 * page where the text a member wrote is the point of the page rather than an aside.
 *
 * `answers` adds, inside each card's details, the option the respondent actually
 * chose per sub-indicator. Passed only on a single member's own matrix (FDSC /
 * resource-person view); omitted on the aggregate report, where a raw answer
 * would mean nothing.
 */
export function DimensionsBreakdown({
  dimensions,
  scores,
  comments,
  detailsOpen = false,
  answers,
}: {
  dimensions: Dimension[];
  scores: ReportScores;
  comments: Record<string, DimensionComment[]>;
  detailsOpen?: boolean;
  answers?: SelectedAnswers;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 mb-8">
      <h2 className="font-bold text-base mb-5" style={{ color: "#162040" }}>
        Dimensiuni evaluate
      </h2>
      <div className="space-y-0">
        {dimensions.map((dimension) => (
          <DimensionCard
            key={dimension.key}
            dimension={dimension}
            score={scores.dimensions?.[dimension.key] ?? null}
            questionScores={scores.questions}
            comments={comments[dimension.key] ?? []}
            defaultOpen={detailsOpen}
            answers={answers}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Circle, MessageSquare } from "lucide-react";
import type { Dimension } from "@/lib/api/dimensions";
import type { EvaluationAnswer } from "@/lib/api/evaluations";
import type { DimensionComment, ReportScores } from "@/lib/api/reports";
import { dimensionColor } from "@/lib/api/dimension-colors";

/** Selected option per question, keyed by `questionId` — see `answers` below. */
export type SelectedAnswers = Record<
  string,
  Pick<EvaluationAnswer, "answer" | "answerLabel">
>;

/**
 * The option a single respondent picked for one sub-indicator, shown under the
 * percentage bar. FDSC staff and the resource person open a member's own matrix
 * to read these; the bar alone never says which of the five answers was given.
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

function CommentsToggle({
  comments,
  defaultOpen,
}: {
  comments: DimensionComment[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="ml-7 mt-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
        style={{ color: "#64748b" }}
      >
        <MessageSquare size={13} />
        Argumente ({comments.length})
        <ChevronDown
          size={13}
          className="transition-transform"
          style={{ transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>
      {open && (
        <div className="mt-2 space-y-2">
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
  );
}

/**
 * The "Dimensiuni evaluate" panel: one row per dimension, the sub-indicator
 * (per-question) scores under it, and the arguments respondents wrote. Shared by
 * the ONG admin report page and the FDSC/mentor organization pages, which differ
 * only in the data they hand in — the ONG admin's `comments` never carry an
 * author.
 *
 * `commentsOpen` expands every argument on mount, for the single-respondent page
 * where the text a member wrote is the point of the page rather than an aside.
 *
 * `answers` adds, under each sub-indicator's percentage bar, the option the
 * respondent actually chose. Passed only on a single member's own matrix
 * (FDSC / resource-person view); omitted on the aggregate report, where a raw
 * answer would mean nothing.
 */
export function DimensionsBreakdown({
  dimensions,
  scores,
  comments,
  commentsOpen = false,
  answers,
}: {
  dimensions: Dimension[];
  scores: ReportScores;
  comments: Record<string, DimensionComment[]>;
  commentsOpen?: boolean;
  answers?: SelectedAnswers;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 mb-8">
      <h2 className="font-bold text-base mb-5" style={{ color: "#162040" }}>
        Dimensiuni evaluate
      </h2>
      <div className="space-y-0">
        {dimensions.map((dimension) => {
          const score = scores.dimensions?.[dimension.key] ?? null;
          return (
            <div key={dimension.key} className="py-4 border-b border-border last:border-0">
              <div className="flex items-center gap-3 mb-3">
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
                  <span
                    className="text-sm font-bold w-12 text-right"
                    style={{ color: dimensionColor(score) }}
                  >
                    {score != null ? `${score}%` : "—"}
                  </span>
                </div>
              </div>

              <div className={answers ? "ml-7 space-y-3" : "ml-7 space-y-1.5"}>
                {(dimension.quiz ?? []).map((question) => {
                  const questionScore = scores.questions?.[question.id] ?? null;
                  if (answers) {
                    return (
                      <div key={question.id}>
                        {question.tag && (
                          <p
                            className="text-[11px] font-semibold uppercase tracking-wide"
                            style={{ color: "#94a3b8" }}
                          >
                            {question.tag}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="flex-1 text-xs" style={{ color: "#64748b" }}>
                            {question.question}
                          </span>
                          <ScoreBar score={questionScore} width="w-24" height="h-1.5" />
                          <span
                            className="text-xs font-semibold w-12 text-right"
                            style={{ color: dimensionColor(questionScore) }}
                          >
                            {questionScore != null ? `${questionScore}%` : "—"}
                          </span>
                        </div>
                        <SelectedAnswer entry={answers[question.id]} />
                      </div>
                    );
                  }
                  return (
                    <div key={question.id} className="flex items-center gap-2">
                      <span className="flex-1 text-xs" style={{ color: "#64748b" }}>
                        {question.tag ?? question.question}
                      </span>
                      <ScoreBar score={questionScore} width="w-24" height="h-1.5" />
                      <span
                        className="text-xs font-semibold w-12 text-right"
                        style={{ color: dimensionColor(questionScore) }}
                      >
                        {questionScore != null ? `${questionScore}%` : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <CommentsToggle comments={comments[dimension.key] ?? []} defaultOpen={commentsOpen} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

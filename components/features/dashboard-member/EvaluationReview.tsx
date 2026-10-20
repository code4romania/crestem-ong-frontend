"use client";

import { useEffect } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { Dimension } from "@/lib/api/dimensions";
import type { EvaluationDimensionBlock } from "@/lib/api/evaluations";

const DIMENSION_LETTERS = "ABCDEFGHIJ";

export function EvaluationReview({
  dimensions,
  blockByKey,
  saving,
  error,
  onEditDimension,
  onFinalize,
}: {
  dimensions: Dimension[];
  blockByKey: Map<string, EvaluationDimensionBlock>;
  saving: boolean;
  error: string | null;
  onEditDimension: (dimensionKey: string) => void;
  onFinalize: () => void;
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const lastDimensionKey = dimensions[dimensions.length - 1]?.key;

  return (
    <div>
      <button
        type="button"
        onClick={() => lastDimensionKey && onEditDimension(lastDimensionKey)}
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 hover:underline"
        style={{ color: "#5b6779" }}
      >
        <ArrowLeft size={14} /> Înapoi la ultima dimensiune
      </button>

      <h1 className="text-2xl font-heading font-extrabold mb-3" style={{ color: "#1c1c81" }}>
        Verifică răspunsurile tale
      </h1>
      <p className="text-sm mb-6" style={{ color: "#475569" }}>
        Revizuiește selecțiile de mai jos înainte de a trimite evaluarea. Poți modifica orice răspuns dând click pe
        dimensiunea corespunzătoare.
      </p>

      <div className="space-y-4 mb-20">
        {dimensions.map((dimension, index) => {
          const letter = DIMENSION_LETTERS[index] ?? String(index + 1);
          const block = blockByKey.get(dimension.key);
          const answeredCount = block?.quiz.filter((q) => q.answer != null).length ?? 0;
          return (
            <div key={dimension.key} className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 border-b border-border">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: "#1c1c81" }}
                >
                  {letter}
                </span>
                <span className="font-semibold" style={{ color: "#1c1c81" }}>
                  {dimension.name}
                </span>
                <span className="text-sm font-semibold" style={{ color: "#007d58" }}>
                  {answeredCount}/{dimension.quiz.length} completate
                </span>
                <button
                  type="button"
                  onClick={() => onEditDimension(dimension.key)}
                  className="ml-auto text-sm font-semibold hover:underline"
                  style={{ color: "#007d58" }}
                >
                  Modifică →
                </button>
              </div>

              {dimension.quiz.map((question, questionIndex) => {
                const answer = block?.quiz.find((q) => q.questionId === question.id);
                return (
                  <div
                    key={question.id}
                    className={`px-5 py-4 ${questionIndex > 0 ? "border-t border-border" : ""}`}
                  >
                    <p className="text-sm mb-2 flex gap-2" style={{ color: "#334155" }}>
                      <span style={{ color: "#5b6779" }}>{questionIndex + 1}.</span> {question.question}
                    </p>
                    {answer?.answerLabel ? (
                      <div
                        className="flex items-start gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "#e5f9e5" }}
                      >
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: "#007d58" }} />
                        <span className="text-sm font-semibold" style={{ color: "#1c1c81" }}>
                          {answer.answerLabel}
                        </span>
                      </div>
                    ) : (
                      <div
                        className="px-3 py-2 rounded-xl"
                        style={{ background: "#f8fafc" }}
                      >
                        <span className="text-sm font-medium" style={{ color: "#5b6779" }}>
                          Fără răspuns
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="mb-4 text-sm" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}

      <div className="sticky bottom-0 bg-white border border-border rounded-2xl px-5 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => lastDimensionKey && onEditDimension(lastDimensionKey)}
          className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors"
          style={{ color: "#475569" }}
        >
          Înapoi
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onFinalize}
          className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:brightness-90 transition-opacity disabled:opacity-60"
          style={{ background: "#00d495", boxShadow: "0 4px 16px rgba(0,212,149,0.3)" }}
        >
          {saving ? "Se finalizează..." : "Finalizează evaluarea"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ChevronRight, Play } from "lucide-react";
import { toast } from "sonner";
import type { Dimension } from "@/lib/api/dimensions";
import type { EvaluationDimensionBlock } from "@/lib/api/evaluations";
import { ModalOverlay } from "@/components/ui/ModalOverlay";

const DIMENSION_LETTERS = "ABCDEFGHIJ";

export function DimensionStep({
  dimension,
  dimensionIndex,
  totalDimensions,
  block,
  saving,
  savingDraft = false,
  error,
  backLabel = "Înapoi la instrucțiuni",
  submitLabel = "Dimensiunea următoare",
  savingLabel = "Se trimite...",
  showSubmitIcon = true,
  onBack,
  onSubmit,
  onSaveDraft,
  onSaveDraftAndBack,
}: {
  dimension: Dimension;
  dimensionIndex: number;
  totalDimensions: number;
  block?: EvaluationDimensionBlock;
  saving: boolean;
  savingDraft?: boolean;
  error: string | null;
  backLabel?: string;
  submitLabel?: string;
  savingLabel?: string;
  showSubmitIcon?: boolean;
  onBack: () => void;
  onSubmit: (input: { comment: string; quiz: { questionId: string; answer: number }[] }) => void;
  onSaveDraft: (input: { comment: string; quiz: { questionId: string; answer: number }[] }) => void;
  onSaveDraftAndBack?: (input: { comment: string; quiz: { questionId: string; answer: number }[] }) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      (block?.quiz ?? [])
        .filter((q): q is typeof q & { answer: number } => q.answer != null)
        .map((q) => [q.questionId, q.answer]),
    ),
  );
  const [comment, setComment] = useState(block?.comment ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const letter = DIMENSION_LETTERS[dimensionIndex] ?? String(dimensionIndex + 1);
  const stepNumber = dimensionIndex + 1;
  const progressPercent = Math.min(100, (stepNumber / Math.max(totalDimensions, 1)) * 100);
  const answeredCount = dimension.quiz.filter((question) => answers[question.id] != null).length;
  const allAnswered = answeredCount === dimension.quiz.length;
  const hasComment = comment.trim().length > 0;
  const canSubmit = allAnswered;

  const handleSubmit = () => {
    if (!allAnswered) {
      const message = "Răspunde la toate întrebările înainte de a trimite.";
      setValidationError(message);
      toast.error(message);
      return;
    }
    if (!hasComment) {
      const message = "Adaugă un comentariu înainte de a trimite.";
      setValidationError(message);
      toast.error(message);
      return;
    }
    setValidationError(null);
    onSubmit({
      comment: comment.trim(),
      quiz: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
    });
  };

  const handleSaveDraft = () => {
    setValidationError(null);
    onSaveDraft({
      comment: comment.trim(),
      quiz: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
    });
  };

  const handleSaveDraftAndBack = () => {
    setValidationError(null);
    onSaveDraftAndBack?.({
      comment: comment.trim(),
      quiz: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex-1 h-2 rounded-full overflow-hidden"
          style={{ background: "#e2e8f0" }}
          role="progressbar"
          aria-valuenow={stepNumber}
          aria-valuemin={1}
          aria-valuemax={totalDimensions}
          aria-label={`Dimensiunea ${stepNumber} din ${totalDimensions}`}
        >
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${progressPercent}%`, background: "#00d495" }}
          />
        </div>
        <span className="text-xs shrink-0" style={{ color: "#5b6779" }}>
          {stepNumber}/{totalDimensions} dimensiuni
        </span>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#007d58" }}>
        Dimensiunea {letter}
      </p>
      <h1 className="text-2xl font-heading font-extrabold mb-4" style={{ color: "#1c1c81" }}>
        {letter}) {dimension.name}
      </h1>

      {dimension.description && (
        <p className="text-sm leading-relaxed mb-6" style={{ color: "#475569" }}>
          {dimension.description}
        </p>
      )}

      {(dimension.tips || dimension.action) && (
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {dimension.tips && (
            <div className="rounded-2xl border p-4" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
              <p
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "#b45309" }}
              >
                <AlertTriangle size={13} aria-hidden="true" /> Atenție
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#b45309" }}>
                {dimension.tips}
              </p>
            </div>
          )}
          {dimension.action && (
            <div className="rounded-2xl border p-4" style={{ background: "#dcfafb", borderColor: "#bfdbfe" }}>
              <p
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "#1d4ed8" }}
              >
                <Play size={13} fill="currentColor" aria-hidden="true" /> Acțiune
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "#1d4ed8" }}>
                {dimension.action}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 mb-4">
        {dimension.quiz.map((question, index) => {
          const selected = answers[question.id];
          return (
            <div key={question.id} className="bg-white rounded-2xl border border-border p-5">
              {question.tag && (
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#007d58" }}>
                  {question.tag}
                </p>
              )}
              <p className="text-sm font-semibold mb-4" style={{ color: "#1c1c81" }}>
                Q{index + 1}. {question.question}
              </p>
              <div className="space-y-1">
                {question.options.map((option) => {
                  const isSelected = selected === option.value;
                  return (
                    <label
                      key={option.value}
                      className="flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
                      style={{ background: isSelected ? "#e5f9e5" : "transparent" }}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        className="sr-only"
                        checked={isSelected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: option.value }))}
                      />
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{
                          background: isSelected ? "#00d495" : "#f1f5f9",
                          color: isSelected ? "#ffffff" : "#5b6779",
                        }}
                      >
                        {option.value}
                      </span>
                      <span
                        className="text-sm"
                        style={{ color: isSelected ? "#1c1c81" : "#475569", fontWeight: isSelected ? 600 : 400 }}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 mb-20">
        <label htmlFor="dimension-comment" className="block text-sm font-semibold mb-3" style={{ color: "#1c1c81" }}>
          Te rugăm să argumentezi selecția făcută pentru indicatorul „{dimension.name}”
          <span style={{ color: "#b91c1c" }}> *</span>
        </label>
        <textarea
          id="dimension-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          required
          aria-required="true"
          className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58]"
          placeholder="Descrie pe scurt raționamentul din spatele răspunsurilor tale..."
        />
        {(validationError || error) && (
          <p className="mt-3 text-sm" style={{ color: "#b91c1c" }}>
            {validationError ?? error}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border border-border rounded-2xl px-5 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowBackConfirm(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: "#5b6779" }}
        >
          <ArrowLeft size={14} /> {backLabel}
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: "#5b6779" }}>
            {answeredCount}/{dimension.quiz.length} răspunsuri
          </span>
          <button
            type="button"
            disabled={saving || savingDraft}
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "#475569" }}
          >
            {savingDraft ? "Se salvează..." : "Salvează ca draft"}
          </button>
          <button
            type="button"
            disabled={!canSubmit || saving || savingDraft}
            onClick={handleSubmit}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#1c1c81" }}
          >
            {saving ? savingLabel : submitLabel} {showSubmitIcon && <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {showBackConfirm && (
        <ModalOverlay labelledBy="back-confirm-title">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 id="back-confirm-title" className="font-heading font-extrabold text-lg mb-2" style={{ color: "#1c1c81" }}>
              {onSaveDraftAndBack ? "Salvezi progresul înainte de a pleca?" : "Renunți la modificări?"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {onSaveDraftAndBack
                ? "Dacă pleci acum fără să salvezi, răspunsurile completate la această dimensiune se vor pierde."
                : "Modificările nesalvate pentru această dimensiune vor fi pierdute. Răspunsul salvat anterior rămâne neschimbat."}
            </p>
            <div className="flex flex-col gap-2">
              {onSaveDraftAndBack && (
                <button
                  type="button"
                  disabled={savingDraft}
                  onClick={handleSaveDraftAndBack}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:brightness-90"
                  style={{ background: "#00d495" }}
                >
                  {savingDraft ? "Se salvează..." : "Salvează ca draft"}
                </button>
              )}
              <button
                type="button"
                disabled={savingDraft}
                onClick={onBack}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
                style={{ color: "#5b6779" }}
              >
                {onSaveDraftAndBack ? "Renunță la răspunsuri" : "Renunță la modificări"}
              </button>
              <button
                type="button"
                disabled={savingDraft}
                onClick={() => setShowBackConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "#475569" }}
              >
                Anulează
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

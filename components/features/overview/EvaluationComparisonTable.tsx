"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import type { Dimension } from "@/lib/api/dimensions";
import { dimensionColor, dimensionLabel, dimensionPillStyle } from "@/lib/api/dimension-colors";

const MAX_SELECTED = 5;
const COLUMN_COLORS = ["#1c1c81", "#007d58", "#5656e5", "#c2410c", "#7c3aed"];

/**
 * The columns are fed by two endpoints that describe the same reports for
 * different roles — `/api/ongs/:id/evaluations` (`OngEvaluation`, super admin)
 * and `/api/reports` (`ReportListItem`, ngo admin). Only these four fields are
 * ever read, so the prop is typed on them rather than on either role's DTO.
 */
export interface ComparableEvaluation {
  documentId: string;
  createdAt: string;
  finishedAt: string | null;
  scores: { dimensions: Record<string, number | null>; overall: number | null };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
}

function evaluationDate(evaluation: ComparableEvaluation) {
  return evaluation.finishedAt ?? evaluation.createdAt;
}

export function EvaluationComparisonTable({
  evaluations,
  dimensions,
  emptyMessage = "Nu există evaluări finalizate pentru această organizație.",
}: {
  evaluations: ComparableEvaluation[];
  dimensions: Dimension[];
  /** Overridden by the ngo-member page, whose columns are one person's own evaluations. */
  emptyMessage?: string;
}) {
  const sortedByDateDesc = [...evaluations].sort(
    (a, b) => new Date(evaluationDate(b)).getTime() - new Date(evaluationDate(a)).getTime(),
  );

  const defaultSelectedIds = sortedByDateDesc[0] ? [sortedByDateDesc[0].documentId] : [];

  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelectedIds);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = selectedIds
    .map((id) => evaluations.find((evaluation) => evaluation.documentId === id))
    .filter((evaluation): evaluation is ComparableEvaluation => !!evaluation)
    .sort((a, b) => new Date(evaluationDate(a)).getTime() - new Date(evaluationDate(b)).getTime());

  const available = sortedByDateDesc.filter((evaluation) => !selectedIds.includes(evaluation.documentId));

  const canAddMore = selected.length < MAX_SELECTED;

  const removeEvaluation = (documentId: string) => {
    setSelectedIds((prev) => prev.filter((id) => id !== documentId));
  };

  const addEvaluation = (documentId: string) => {
    setSelectedIds((prev) => [...prev, documentId]);
    setDropdownOpen(false);
  };

  const resetSelection = () => {
    setSelectedIds(defaultSelectedIds);
    setDropdownOpen(false);
  };

  const isDefaultSelection =
    selectedIds.length === defaultSelectedIds.length &&
    selectedIds.every((id, index) => id === defaultSelectedIds[index]);

  if (evaluations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {!isDefaultSelection && (
        <div className="flex justify-end px-6 py-3 border-b border-border print:hidden">
          <button
            type="button"
            onClick={resetSelection}
            className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline"
            style={{ color: "#5b6779" }}
          >
            <RotateCcw size={13} /> Resetează comparația
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th
                className="text-left align-top px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b border-border"
                style={{ color: "#5b6779", background: "#f8fafc", minWidth: 220 }}
              >
                Dimensiune
              </th>
              {selected.map((evaluation, index) => (
                <th
                  key={evaluation.documentId}
                  className="text-center align-top px-6 py-4 border-b border-l border-border"
                  style={{ background: "#f8fafc", minWidth: 180 }}
                >
                  <div className="flex items-center justify-center gap-1.5 text-sm font-medium" style={{ color: "#334155" }}>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: COLUMN_COLORS[index % COLUMN_COLORS.length] }}
                    />
                    {formatDate(evaluationDate(evaluation))}
                  </div>
                  <p
                    className="mt-1 text-2xl font-heading font-extrabold"
                    style={{ color: COLUMN_COLORS[index % COLUMN_COLORS.length] }}
                  >
                    {evaluation.scores.overall != null ? `${evaluation.scores.overall}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">scor total</p>
                  {selected.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEvaluation(evaluation.documentId)}
                      className="mt-1 text-xs font-medium hover:underline print:hidden"
                      style={{ color: "#5b6779" }}
                    >
                      Elimină ×
                    </button>
                  )}
                </th>
              ))}
              {canAddMore && (
                <th
                  className="text-center align-top px-4 py-4 border-b border-l border-border relative print:hidden"
                  style={{ background: "#f8fafc", minWidth: 160 }}
                >
                  <div ref={dropdownRef} className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen((open) => !open)}
                      className="w-full flex flex-col items-center gap-1 px-3 py-2 rounded-xl border border-dashed transition-colors hover:bg-slate-50"
                      style={{ borderColor: "#cbd5e1", color: "#5b6779" }}
                    >
                      <Plus size={16} />
                      <span className="text-xs font-semibold">Adaugă evaluare</span>
                      <span className="text-[11px] text-muted-foreground">
                        {selected.length}/{MAX_SELECTED} selectate
                      </span>
                    </button>

                    {dropdownOpen && (
                      <div
                        className="absolute right-0 top-full mt-2 z-20 w-56 bg-white rounded-xl border border-border shadow-lg py-2"
                        role="menu"
                      >
                        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "#5b6779" }}>
                          Selectează evaluare
                        </p>
                        {available.length > 0 ? (
                          <div className="max-h-64 overflow-y-auto">
                            {available.map((evaluation) => (
                              <button
                                key={evaluation.documentId}
                                type="button"
                                onClick={() => addEvaluation(evaluation.documentId)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                                style={{ color: "#334155" }}
                              >
                                {formatDate(evaluationDate(evaluation))}
                                {evaluation.scores.overall != null ? ` — ${evaluation.scores.overall}%` : ""}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="px-3 py-2 text-sm text-muted-foreground">
                            Nu mai sunt evaluări disponibile.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {dimensions.map((dimension) => (
              <tr key={dimension.key} className="border-b border-border last:border-0">
                <td
                  className="px-6 py-5 text-sm font-semibold"
                  style={{ color: "#1c1c81", background: "#f8fafc" }}
                >
                  {dimension.name}
                </td>
                {selected.map((evaluation, index) => {
                  const score = evaluation.scores.dimensions[dimension.key] ?? null;
                  const previous = index > 0 ? selected[index - 1] : null;
                  const previousScore = previous ? previous.scores.dimensions[dimension.key] ?? null : null;
                  const delta = previousScore != null && score != null ? round1(score - previousScore) : null;
                  return (
                    <td key={evaluation.documentId} className="px-6 py-5 border-l border-border text-center">
                      <p className="text-2xl font-heading font-extrabold" style={{ color: dimensionColor(score) }}>
                        {score != null ? `${score}%` : "—"}
                      </p>
                      <span
                        className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={dimensionPillStyle(score)}
                      >
                        {dimensionLabel(score)}
                      </span>
                      {delta != null && (
                        <p
                          className="mt-1 text-xs font-semibold"
                          style={{ color: delta >= 0 ? "#15803d" : "#dc2626" }}
                        >
                          {delta >= 0 ? "▲" : "▼"} {delta >= 0 ? "+" : ""}
                          {delta}%
                        </p>
                      )}
                    </td>
                  );
                })}
                {canAddMore && <td className="border-l border-border print:hidden" />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Dimension } from "@/lib/api/dimensions";

const DIMENSION_LETTERS = "ABCDEFGHIJ";

/**
 * Read-only reference view of the organizational development matrix: every
 * dimension, its questions, and the five maturity levels each question can be
 * answered with. Sections are accordions so the whole model stays scannable;
 * the first dimension is expanded on arrival.
 */
export function MatrixModelView({ dimensions }: { dimensions: Dimension[] }) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(dimensions[0] ? [dimensions[0].key] : []),
  );

  const toggle = (key: string) =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  return (
    <div className="space-y-3">
      {dimensions.map((dimension, dimensionIndex) => {
        const letter = DIMENSION_LETTERS[dimensionIndex] ?? String(dimensionIndex + 1);
        const isOpen = openKeys.has(dimension.key);
        const panelId = `matrix-panel-${dimension.key}`;

        return (
          <section key={dimension.key} className="bg-white rounded-2xl border border-border overflow-hidden">
            <h2>
              <button
                type="button"
                onClick={() => toggle(dimension.key)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#007d58]"
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: "#00d495" }}
                >
                  {letter}
                </span>
                <span className="flex-1 text-base font-heading font-extrabold" style={{ color: "#1c1c81" }}>
                  {dimension.name}
                </span>
                <span className="text-xs shrink-0" style={{ color: "#5b6779" }}>
                  {dimension.quiz.length} {dimension.quiz.length === 1 ? "întrebare" : "întrebări"}
                </span>
                <ChevronDown
                  size={16}
                  className="shrink-0 transition-transform"
                  style={{ color: "#5b6779", transform: isOpen ? "rotate(180deg)" : "none" }}
                />
              </button>
            </h2>

            {isOpen && (
              <div id={panelId} className="px-5 pb-5 space-y-4 border-t border-border pt-5">
                {dimension.quiz.map((question, index) => (
                  <div key={question.id} className="rounded-2xl border border-border p-5">
                    {question.tag && (
                      <p
                        className="text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: "#007d58" }}
                      >
                        {question.tag}
                      </p>
                    )}
                    <p className="text-sm font-semibold mb-4" style={{ color: "#1c1c81" }}>
                      Q{index + 1}. {question.question}
                    </p>
                    <ul className="space-y-1">
                      {question.options.map((option) => (
                        <li key={option.value} className="flex items-start gap-3 px-3 py-2.5">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                            style={{ background: "#f1f5f9", color: "#5b6779" }}
                          >
                            {option.value}
                          </span>
                          <span className="text-sm" style={{ color: "#475569" }}>
                            {option.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

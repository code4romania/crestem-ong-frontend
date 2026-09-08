"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { EMPTY_STEP, type ProcessStep } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

/**
 * The "Pași" repeater: add / reorder / delete rows, each with a Titlu and a
 * Text. Co-located with the block.
 */
export function StepList({
  value,
  onChange,
  error,
}: {
  value: ProcessStep[];
  onChange: (next: ProcessStep[]) => void;
  error?: string;
}) {
  const update = (index: number, patch: Partial<ProcessStep>) =>
    onChange(value.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const remove = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Pași
        </span>
        <span className="text-xs text-[#94a3b8]">{value.length} adăugați</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Niciun pas adăugat încă.
        </p>
      ) : (
        <ul className="space-y-3">
          {value.map((step, index) => (
            <li
              key={index}
              className="rounded-xl border border-border bg-slate-50/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-[#162040]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#162040] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="truncate">
                    {step.titlu || "fără titlu"}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Mută mai sus"
                    className="rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    aria-label="Mută mai jos"
                    className="rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Elimină pasul"
                    className="rounded-lg p-1.5 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              </div>

              <div>
                <label htmlFor={`step-${index}-titlu`} className={labelClass}>
                  Titlu
                </label>
                <input
                  id={`step-${index}-titlu`}
                  className={inputClass}
                  value={step.titlu}
                  onChange={(e) => update(index, { titlu: e.target.value })}
                  placeholder="Aplicații"
                />
              </div>
              <div className="mt-3">
                <label htmlFor={`step-${index}-text`} className={labelClass}>
                  Text (opțional)
                </label>
                <textarea
                  id={`step-${index}-text`}
                  rows={2}
                  className={inputClass}
                  value={step.text}
                  onChange={(e) => update(index, { text: e.target.value })}
                  placeholder="Completezi formularul online, anexezi raportul de activitate și descrii modelul de impact al organizației tale."
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}

      <button
        type="button"
        onClick={() => onChange([...value, { ...EMPTY_STEP }])}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040]"
      >
        <Plus size={16} /> Adaugă pas
      </button>
    </div>
  );
}

"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { EMPTY_STAT, type ProgramHeaderStat } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

/**
 * The dark bar's repeater: add / reorder / delete value+label pairs, both typed
 * by the admin. Nothing is prescribed — no heading, no seeded rows, no fixed
 * labels — so the bar can say whatever a given programme needs. Narrower than
 * `hero-statistics/StatList` on purpose: the bar has no room for the third
 * "descriere" line, so the field isn't offered.
 */
export function StatList({
  value,
  onChange,
  error,
}: {
  value: ProgramHeaderStat[];
  onChange: (next: ProgramHeaderStat[]) => void;
  error?: string;
}) {
  const update = (index: number, patch: Partial<ProgramHeaderStat>) =>
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
      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Nicio statistică adăugată încă.
        </p>
      ) : (
        <ul className="space-y-3">
          {value.map((stat, index) => (
            <li
              key={index}
              className="rounded-xl border border-border bg-slate-50/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-[#162040]">
                  {stat.eticheta || "fără etichetă"}
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
                    aria-label="Elimină statistica"
                    className="rounded-lg p-1.5 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Valoare</label>
                  <input
                    className={inputClass}
                    value={stat.valoare}
                    onChange={(e) => update(index, { valoare: e.target.value })}
                    placeholder="30+"
                  />
                </div>
                <div>
                  <label className={labelClass}>Etichetă</label>
                  <input
                    className={inputClass}
                    value={stat.eticheta}
                    onChange={(e) => update(index, { eticheta: e.target.value })}
                    placeholder="Mentori disponibili"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}

      <button
        type="button"
        onClick={() => onChange([...value, { ...EMPTY_STAT }])}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040]"
      >
        <Plus size={16} /> Adaugă statistică
      </button>
    </div>
  );
}

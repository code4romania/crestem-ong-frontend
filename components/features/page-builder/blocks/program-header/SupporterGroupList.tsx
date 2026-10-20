"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp, FolderPlus, Trash2 } from "lucide-react";
import { SupporterList } from "./SupporterList";
import {
  EMPTY_SUPPORTER_GROUP,
  MAX_SUPPORTER_GROUPS,
  type ProgramSupporterGroup,
} from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors";

/**
 * Up to `MAX_SUPPORTER_GROUPS` named supporter categories ("Finanțatori",
 * "Parteneri", …), each with its own `SupporterList`. Groups render as stacked
 * rows in the header's supporter band, in this order.
 */
export function SupporterGroupList({
  value,
  onChange,
  error,
}: {
  value: ProgramSupporterGroup[];
  onChange: (next: ProgramSupporterGroup[]) => void;
  error?: string;
}) {
  const baseId = useId();
  const atLimit = value.length >= MAX_SUPPORTER_GROUPS;

  // Stable React keys, so a supporter sub-form that is open in one group stays
  // with that group when groups are moved or removed. Every change to `value`
  // goes through the handlers below, which keep `keys` aligned with it.
  const [keys, setKeys] = useState(() => value.map((_, i) => i));
  const [nextKey, setNextKey] = useState(value.length);

  const update = (index: number, patch: Partial<ProgramSupporterGroup>) =>
    onChange(value.map((g, i) => (i === index ? { ...g, ...patch } : g)));

  const add = () => {
    setKeys((k) => [...k, nextKey]);
    setNextKey((n) => n + 1);
    onChange([...value, { ...EMPTY_SUPPORTER_GROUP }]);
  };

  const remove = (index: number) => {
    setKeys((k) => k.filter((_, i) => i !== index));
    onChange(value.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const swap = <T,>(list: T[]) => {
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    };
    setKeys(swap);
    onChange(swap(value));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Categorii de susținători
        </span>
        <span className="text-xs text-[#5b6779]">
          {value.length} / {MAX_SUPPORTER_GROUPS}
        </span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#5b6779]">
          Nicio categorie adăugată încă.
        </p>
      ) : (
        <ol className="space-y-3">
          {value.map((group, index) => {
            const key = keys[index] ?? `extra-${index}`;
            const titleId = `${baseId}-grup-${key}`;
            return (
              <li
                key={key}
                className="space-y-4 rounded-xl border border-border p-4"
              >
                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <label htmlFor={titleId} className={labelClass}>
                      Etichetă categorie {index + 1}
                    </label>
                    <input
                      id={titleId}
                      className={inputClass}
                      value={group.titlu}
                      onChange={(e) => update(index, { titlu: e.target.value })}
                      placeholder="ex. Finanțatori"
                    />
                  </div>
                  <span className="flex shrink-0 items-center gap-1 pb-1.5">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Mută categoria mai sus"
                      className="rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === value.length - 1}
                      aria-label="Mută categoria mai jos"
                      className="rounded-lg p-1.5 text-[#475569] transition-colors hover:bg-slate-200 disabled:opacity-40"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label="Elimină categoria"
                      className="rounded-lg p-1.5 text-[#b91c1c] transition-colors hover:bg-[#fef2f2]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </span>
                </div>

                <SupporterList
                  value={group.sustinatori}
                  onChange={(sustinatori) => update(index, { sustinatori })}
                />
              </li>
            );
          })}
        </ol>
      )}

      {error && <p className="mt-1 text-xs text-[#b91c1c]">{error}</p>}

      <button
        type="button"
        onClick={add}
        disabled={atLimit}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#5656e5]/30 bg-[#5656e5]/5 px-4 py-3 text-sm font-semibold text-[#5656e5] transition-colors hover:border-[#5656e5]/60 hover:bg-[#5656e5]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5656e5]/40 disabled:cursor-not-allowed disabled:border-border disabled:bg-slate-50 disabled:text-[#5b6779]"
      >
        <FolderPlus size={16} aria-hidden />
        {atLimit
          ? `Maximum ${MAX_SUPPORTER_GROUPS} categorii`
          : "Adaugă categorie"}
      </button>
    </div>
  );
}

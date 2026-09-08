"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  Plus,
  Quote,
  Trash2,
} from "lucide-react";
import { EMPTY_TESTIMONIAL, type Testimonial } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

/**
 * The "Adaugă testimonial" repeater. Same master-detail flow as
 * `feature-cards/CardList`: a list of added items and a separate draft sub-form
 * that only commits on "Salvează testimonialul".
 */
export function TestimonialList({
  value,
  onChange,
  error,
}: {
  value: Testimonial[];
  onChange: (next: Testimonial[]) => void;
  error?: string;
}) {
  // `editing === value.length` means a brand-new item is being drafted.
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Testimonial>(EMPTY_TESTIMONIAL);

  const canSave = Boolean(draft.testimonial.trim() && draft.nume.trim());

  const openNew = () => {
    setDraft({ ...EMPTY_TESTIMONIAL });
    setEditing(value.length);
  };

  const openExisting = (index: number) => {
    setDraft({ ...value[index] });
    setEditing(index);
  };

  const closeForm = () => setEditing(null);

  const saveDraft = () => {
    if (!canSave) return;
    const clean: Testimonial = {
      testimonial: draft.testimonial.trim(),
      nume: draft.nume.trim(),
      functie: draft.functie.trim(),
      organizatie: draft.organizatie.trim(),
    };
    onChange(
      editing === value.length
        ? [...value, clean]
        : value.map((t, i) => (i === editing ? clean : t)),
    );
    setEditing(null);
  };

  const remove = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  if (editing !== null) {
    const setField = (patch: Partial<Testimonial>) =>
      setDraft((d) => ({ ...d, ...patch }));

    return (
      <div className="rounded-xl border border-border p-4">
        <button
          type="button"
          onClick={closeForm}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          <ChevronLeft size={16} /> Înapoi la lista de testimoniale
        </button>

        <p className="mb-4 text-sm font-bold text-[#162040]">
          {editing === value.length
            ? "Testimonial nou"
            : "Editează testimonialul"}
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="ts-item-text" className={labelClass}>
              Testimonial <span className="text-[#ef4444]">*</span>
            </label>
            <textarea
              id="ts-item-text"
              rows={4}
              className={inputClass}
              value={draft.testimonial}
              onChange={(e) => setField({ testimonial: e.target.value })}
              placeholder="Citatul persoanei..."
            />
          </div>

          <div>
            <label htmlFor="ts-item-nume" className={labelClass}>
              Nume <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="ts-item-nume"
              className={inputClass}
              value={draft.nume}
              onChange={(e) => setField({ nume: e.target.value })}
              placeholder="ex. Ana Moldovan"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="ts-item-functie" className={labelClass}>
                Funcție
              </label>
              <input
                id="ts-item-functie"
                className={inputClass}
                value={draft.functie}
                onChange={(e) => setField({ functie: e.target.value })}
                placeholder="ex. Director executiv"
              />
            </div>
            <div>
              <label htmlFor="ts-item-organizatie" className={labelClass}>
                Organizație
              </label>
              <input
                id="ts-item-organizatie"
                className={inputClass}
                value={draft.organizatie}
                onChange={(e) => setField({ organizatie: e.target.value })}
                placeholder="ex. Asociația X"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={saveDraft}
            disabled={!canSave}
            className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvează testimonialul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Testimoniale
        </span>
        <span className="text-xs text-[#94a3b8]">{value.length} adăugate</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Niciun testimonial adăugat încă.
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2 rounded-xl border border-border bg-slate-50/60 p-2 pl-3"
            >
              <button
                type="button"
                onClick={() => openExisting(index)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                  <Quote size={16} />
                </span>
                <span className="truncate text-sm font-semibold text-[#162040]">
                  {item.nume || "fără nume"}
                </span>
              </button>
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
                  aria-label="Elimină testimonialul"
                  className="rounded-lg p-1.5 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
                >
                  <Trash2 size={16} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}

      <button
        type="button"
        onClick={openNew}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040]"
      >
        <Plus size={16} /> Adaugă testimonial
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  HelpCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { EMPTY_FAQ_ITEM, type FaqItem } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

/**
 * The "Adaugă întrebare" repeater. Same master-detail flow as
 * `testimonials/TestimonialList`: a list of added items and a separate draft
 * sub-form that only commits on "Salvează întrebarea".
 */
export function FaqList({
  value,
  onChange,
  error,
}: {
  value: FaqItem[];
  onChange: (next: FaqItem[]) => void;
  error?: string;
}) {
  // `editing === value.length` means a brand-new item is being drafted.
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<FaqItem>(EMPTY_FAQ_ITEM);

  const canSave = Boolean(draft.intrebare.trim() && draft.raspuns.trim());

  const openNew = () => {
    setDraft({ ...EMPTY_FAQ_ITEM });
    setEditing(value.length);
  };

  const openExisting = (index: number) => {
    setDraft({ ...value[index] });
    setEditing(index);
  };

  const closeForm = () => setEditing(null);

  const saveDraft = () => {
    if (!canSave) return;
    const clean: FaqItem = {
      intrebare: draft.intrebare.trim(),
      raspuns: draft.raspuns.trim(),
    };
    onChange(
      editing === value.length
        ? [...value, clean]
        : value.map((q, i) => (i === editing ? clean : q)),
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
    const setField = (patch: Partial<FaqItem>) =>
      setDraft((d) => ({ ...d, ...patch }));

    return (
      <div className="rounded-xl border border-border p-4">
        <button
          type="button"
          onClick={closeForm}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          <ChevronLeft size={16} /> Înapoi la lista de întrebări
        </button>

        <p className="mb-4 text-sm font-bold text-[#162040]">
          {editing === value.length ? "Întrebare nouă" : "Editează întrebarea"}
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="faq-item-intrebare" className={labelClass}>
              Întrebare <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="faq-item-intrebare"
              className={inputClass}
              value={draft.intrebare}
              onChange={(e) => setField({ intrebare: e.target.value })}
              placeholder="ex. Trebuie să plătesc pentru a participa?"
            />
          </div>

          <div>
            <label htmlFor="faq-item-raspuns" className={labelClass}>
              Răspuns <span className="text-[#ef4444]">*</span>
            </label>
            <textarea
              id="faq-item-raspuns"
              rows={4}
              className={inputClass}
              value={draft.raspuns}
              onChange={(e) => setField({ raspuns: e.target.value })}
              placeholder="Răspunsul la întrebare..."
            />
          </div>

          <button
            type="button"
            onClick={saveDraft}
            disabled={!canSave}
            className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvează întrebarea
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Întrebări
        </span>
        <span className="text-xs text-[#94a3b8]">{value.length} adăugate</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Nicio întrebare adăugată.
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
                  <HelpCircle size={16} />
                </span>
                <span className="truncate text-sm font-semibold text-[#162040]">
                  {item.intrebare || "fără întrebare"}
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
                  aria-label="Elimină întrebarea"
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
        <Plus size={16} /> Adaugă întrebare
      </button>
    </div>
  );
}

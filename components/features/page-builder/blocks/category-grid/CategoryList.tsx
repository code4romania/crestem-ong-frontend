"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { IconPicker } from "./IconPicker";
import { CATEGORY_ICONS } from "./icons";
import { CtaTargetField } from "../shared/CtaTargetField";
import { EMPTY_CATEGORY, type Category } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

/**
 * The "Categorii" repeater for Category Grid. Master-detail flow cloned from
 * Programme Grid's `ProgramList`: a list of added categories, plus a separate
 * sub-form ("Categorie nouă" / edit) with its own draft buffer that only
 * commits on "Salvează categoria".
 */
export function CategoryList({
  value,
  onChange,
  error,
}: {
  value: Category[];
  onChange: (next: Category[]) => void;
  error?: string;
}) {
  // `editing === value.length` means a brand-new category is being drafted.
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Category>(EMPTY_CATEGORY);

  const openNew = () => {
    setDraft({ ...EMPTY_CATEGORY });
    setEditing(value.length);
  };

  const openExisting = (index: number) => {
    setDraft({ ...value[index] });
    setEditing(index);
  };

  const closeForm = () => setEditing(null);

  const canSave = Boolean(draft.titlu.trim());

  const saveDraft = () => {
    if (!canSave) return;
    const clean: Category = {
      ...draft,
      titlu: draft.titlu.trim(),
      href: draft.href.trim(),
    };
    onChange(
      editing === value.length
        ? [...value, clean]
        : value.map((c, i) => (i === editing ? clean : c)),
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
    const setField = (patch: Partial<Category>) =>
      setDraft((d) => ({ ...d, ...patch }));

    return (
      <div className="rounded-xl border border-border p-4">
        <button
          type="button"
          onClick={closeForm}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          <ChevronLeft size={16} /> Înapoi la lista de categorii
        </button>

        <p className="mb-4 text-sm font-bold text-[#162040]">
          {editing === value.length ? "Categorie nouă" : "Editează categoria"}
        </p>

        <div className="space-y-4">
          <div>
            <span className={labelClass}>Iconiță</span>
            <IconPicker
              value={draft.icon}
              onChange={(icon) => setField({ icon })}
            />
          </div>

          <div>
            <label htmlFor="cl-cat-titlu" className={labelClass}>
              Titlu <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="cl-cat-titlu"
              className={inputClass}
              value={draft.titlu}
              onChange={(e) => setField({ titlu: e.target.value })}
              placeholder="ex. Managementul ONG"
            />
          </div>

          <div>
            <label htmlFor="cl-cat-descriere" className={labelClass}>
              Descriere
            </label>
            <textarea
              id="cl-cat-descriere"
              rows={3}
              className={inputClass}
              value={draft.descriere}
              onChange={(e) => setField({ descriere: e.target.value })}
              placeholder="Scurtă descriere a categoriei..."
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="cl-cat-numar" className={labelClass}>
                Număr resurse
              </label>
              <input
                id="cl-cat-numar"
                type="number"
                min={0}
                inputMode="numeric"
                className={inputClass}
                value={draft.numarResurse ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  const n = Number(raw);
                  setField({
                    numarResurse:
                      raw === "" || Number.isNaN(n)
                        ? null
                        : Math.max(0, Math.trunc(n)),
                  });
                }}
                placeholder="ex. 6"
              />
            </div>
            <div>
              <span className={labelClass}>Link</span>
              <CtaTargetField
                value={draft}
                onChange={(next) => setField({ href: next.href, pagina: next.pagina })}
                ariaLabel="Link"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={saveDraft}
            disabled={!canSave}
            className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvează categoria
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Categorii
        </span>
        <span className="text-xs text-[#94a3b8]">{value.length} adăugate</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Nicio categorie adăugată încă.
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((category, index) => {
            const Icon = CATEGORY_ICONS[category.icon];
            return (
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
                    <Icon size={16} />
                  </span>
                  <span className="truncate text-sm font-semibold text-[#162040]">
                    {category.titlu || "fără titlu"}
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
                    aria-label="Elimină categoria"
                    className="rounded-lg p-1.5 text-[#ef4444] transition-colors hover:bg-[#fef2f2]"
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}

      <button
        type="button"
        onClick={openNew}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040]"
      >
        <Plus size={16} /> Adaugă categorie
      </button>
    </div>
  );
}

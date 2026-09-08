"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { IconPicker } from "./IconPicker";
import { FEATURE_ICONS } from "./icons";
import { CtaTargetField } from "../shared/CtaTargetField";
import { EMPTY_CARD, type FeatureCard } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

/**
 * The "Carduri" repeater for Feature Cards. Follows the mockup's master-detail
 * flow: a list of added cards, and a separate sub-form ("Card nou" / edit) with
 * its own draft buffer that only commits on "Salvează cardul". Co-located with
 * the block since no other block needs it.
 */
export function CardList({
  value,
  onChange,
  error,
}: {
  value: FeatureCard[];
  onChange: (next: FeatureCard[]) => void;
  error?: string;
}) {
  // `editing === value.length` means a brand-new card is being drafted.
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<FeatureCard>(EMPTY_CARD);

  const openNew = () => {
    setDraft({ ...EMPTY_CARD });
    setEditing(value.length);
  };

  const openExisting = (index: number) => {
    setDraft({ ...value[index] });
    setEditing(index);
  };

  const closeForm = () => setEditing(null);

  const saveDraft = () => {
    if (!draft.titlu.trim()) return;
    const clean: FeatureCard = { ...draft, titlu: draft.titlu.trim() };
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
    const setField = (patch: Partial<FeatureCard>) =>
      setDraft((d) => ({ ...d, ...patch }));

    return (
      <div className="rounded-xl border border-border p-4">
        <button
          type="button"
          onClick={closeForm}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          <ChevronLeft size={16} /> Înapoi la lista de carduri
        </button>

        <p className="mb-4 text-sm font-bold text-[#162040]">
          {editing === value.length ? "Card nou" : "Editează cardul"}
        </p>

        <div className="space-y-4">
          <div>
            <span className={labelClass}>Pictogramă</span>
            <IconPicker
              value={draft.icon}
              onChange={(icon) => setField({ icon })}
            />
          </div>

          <div>
            <label htmlFor="fc-card-titlu" className={labelClass}>
              Titlu <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="fc-card-titlu"
              className={inputClass}
              value={draft.titlu}
              onChange={(e) => setField({ titlu: e.target.value })}
              placeholder="ex. Resurse pentru organizații"
            />
          </div>

          <div>
            <label htmlFor="fc-card-descriere" className={labelClass}>
              Descriere
            </label>
            <textarea
              id="fc-card-descriere"
              rows={3}
              className={inputClass}
              value={draft.descriere}
              onChange={(e) => setField({ descriere: e.target.value })}
              placeholder="Scurtă descriere a funcționalității..."
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <span className={labelClass}>Link</span>
              <CtaTargetField
                value={draft}
                onChange={(next) => setField({ href: next.href, pagina: next.pagina })}
                ariaLabel="Link"
              />
            </div>
            <div>
              <label htmlFor="fc-card-cta" className={labelClass}>
                Label CTA
              </label>
              <input
                id="fc-card-cta"
                className={inputClass}
                value={draft.ctaLabel}
                onChange={(e) => setField({ ctaLabel: e.target.value })}
                placeholder="Descoperă mai mult"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={saveDraft}
            disabled={!draft.titlu.trim()}
            className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvează cardul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Carduri
        </span>
        <span className="text-xs text-[#94a3b8]">{value.length} adăugate</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Niciun card adăugat încă.
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((card, index) => {
            const Icon = FEATURE_ICONS[card.icon];
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
                    {card.titlu || "fără titlu"}
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
                    aria-label="Elimină cardul"
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
        <Plus size={16} /> Adaugă card
      </button>
    </div>
  );
}

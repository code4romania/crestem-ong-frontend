"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { IconPicker } from "./IconPicker";
import { FEATURE_ICONS } from "./icons";
import { CtaTargetField } from "../shared/CtaTargetField";
import { EMPTY_CARD, type FeatureCard } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#00d495]/30 focus:border-[#007d58] transition-colors";

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
  bindHandle,
}: {
  value: FeatureCard[];
  onChange: (next: FeatureCard[]) => void;
  error?: string;
  /** See `BlockEditorHandle` — lets a parent flush the open card draft (e.g. before the block-level Save runs) or check for one before a discard. */
  bindHandle?: (
    handle: {
      flush: () => FeatureCard[];
      hasUnsavedNestedDraft: () => boolean;
    } | null,
  ) => void;
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

  /** Same rule the "Salvează cardul" button enforces: a blank title isn't worth keeping. */
  const commitDraft = (
    current: FeatureCard,
    editingIndex: number,
    list: FeatureCard[],
  ): FeatureCard[] | null => {
    if (!current.titlu.trim()) return null;
    const clean: FeatureCard = { ...current, titlu: current.titlu.trim() };
    return editingIndex === list.length
      ? [...list, clean]
      : list.map((c, i) => (i === editingIndex ? clean : c));
  };

  const saveDraft = () => {
    if (editing === null) return;
    const next = commitDraft(draft, editing, value);
    if (!next) return;
    onChange(next);
    setEditing(null);
  };

  useEffect(() => {
    if (!bindHandle) return;
    bindHandle({
      flush: () => {
        if (editing === null) return value;
        return commitDraft(draft, editing, value) ?? value;
      },
      hasUnsavedNestedDraft: () => {
        if (editing === null) return false;
        const original = editing === value.length ? EMPTY_CARD : value[editing];
        return JSON.stringify(draft) !== JSON.stringify(original);
      },
    });
    return () => bindHandle(null);
  }, [bindHandle, editing, draft, value]);

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
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#5656e5] hover:underline"
        >
          <ChevronLeft size={16} /> Înapoi la lista de carduri
        </button>

        <p className="mb-4 text-sm font-bold text-[#1c1c81]">
          {editing === value.length ? "Card nou" : "Editează cardul"}
        </p>

        <div className="space-y-4">
          <div>
            <span className={labelClass}>Pictogramă</span>
            <IconPicker
              value={draft.icon}
              onChange={(icon) => setField({ icon })}
              iconImage={draft.iconImage}
              onIconImageChange={(iconImage) => setField({ iconImage })}
            />
          </div>

          <div>
            <label htmlFor="fc-card-titlu" className={labelClass}>
              Titlu <span className="text-[#b91c1c]">*</span>
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
            className="rounded-xl bg-[#5656e5] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
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
        <span className="text-xs text-[#5b6779]">{value.length} adăugate</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#5b6779]">
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
                  {card.iconImage ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getMediaUrl(card.iconImage.url)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dcfafb] text-[#5656e5]">
                      <Icon size={16} />
                    </span>
                  )}
                  <span className="truncate text-sm font-semibold text-[#1c1c81]">
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
                    className="rounded-lg p-1.5 text-[#b91c1c] transition-colors hover:bg-[#fef2f2]"
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-[#b91c1c]">{error}</p>}

      <button
        type="button"
        onClick={openNew}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-semibold text-[#475569] transition-colors hover:border-[#00d495] hover:text-[#1c1c81]"
      >
        <Plus size={16} /> Adaugă card
      </button>
    </div>
  );
}

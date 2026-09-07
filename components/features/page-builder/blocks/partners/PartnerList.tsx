"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { IconPicker } from "../feature-cards/IconPicker";
import { FEATURE_ICONS } from "../feature-cards/icons";
import { EMPTY_PARTNER, type Partner } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";

/**
 * The "Parteneri" repeater. Master-detail flow cloned from Feature Cards'
 * `CardList`: a list of added partners, plus a separate sub-form ("Partener nou"
 * / edit) with its own draft buffer that only commits on "Salvează partenerul".
 */
export function PartnerList({
  value,
  onChange,
  error,
}: {
  value: Partner[];
  onChange: (next: Partner[]) => void;
  error?: string;
}) {
  // `editing === value.length` means a brand-new partner is being drafted.
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partner>(EMPTY_PARTNER);

  const openNew = () => {
    setDraft({ ...EMPTY_PARTNER });
    setEditing(value.length);
  };

  const openExisting = (index: number) => {
    setDraft({ ...value[index] });
    setEditing(index);
  };

  const closeForm = () => setEditing(null);

  const saveDraft = () => {
    if (!draft.nume.trim()) return;
    const clean: Partner = { ...draft, nume: draft.nume.trim() };
    onChange(
      editing === value.length
        ? [...value, clean]
        : value.map((p, i) => (i === editing ? clean : p)),
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
    const setField = (patch: Partial<Partner>) =>
      setDraft((d) => ({ ...d, ...patch }));

    return (
      <div className="rounded-xl border border-border p-4">
        <button
          type="button"
          onClick={closeForm}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          <ChevronLeft size={16} /> Înapoi la lista de parteneri
        </button>

        <p className="mb-4 text-sm font-bold text-[#162040]">
          {editing === value.length ? "Partener nou" : "Editează partenerul"}
        </p>

        <div className="space-y-4">
          <div>
            <span className={labelClass}>Iconiță</span>
            <IconPicker
              value={draft.icon}
              onChange={(icon) => setField({ icon })}
              iconImage={draft.iconImage}
              onIconImageChange={(iconImage) => setField({ iconImage })}
            />
          </div>

          <div>
            <label htmlFor="partner-nume" className={labelClass}>
              Nume <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="partner-nume"
              className={inputClass}
              value={draft.nume}
              onChange={(e) => setField({ nume: e.target.value })}
              placeholder="ex. Fundația pentru Parteneriat"
            />
          </div>

          <div>
            <label htmlFor="partner-subtitlu" className={labelClass}>
              Subtitlu
            </label>
            <input
              id="partner-subtitlu"
              className={inputClass}
              value={draft.subtitlu}
              onChange={(e) => setField({ subtitlu: e.target.value })}
              placeholder="ex. Partener strategic"
            />
          </div>

          <button
            type="button"
            onClick={saveDraft}
            disabled={!draft.nume.trim()}
            className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvează partenerul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Parteneri
        </span>
        <span className="text-xs text-[#94a3b8]">{value.length} adăugați</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Niciun partener adăugat încă.
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((partner, index) => {
            const Icon = FEATURE_ICONS[partner.icon];
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
                  {partner.iconImage ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getMediaUrl(partner.iconImage.url)}
                        alt=""
                        className="h-full w-full object-contain p-1"
                      />
                    </span>
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                      <Icon size={16} />
                    </span>
                  )}
                  <span className="truncate text-sm font-semibold text-[#162040]">
                    {partner.nume || "fără nume"}
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
                    aria-label="Elimină partenerul"
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
        <Plus size={16} /> Adaugă partener
      </button>
    </div>
  );
}

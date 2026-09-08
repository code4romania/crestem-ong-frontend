"use client";

import { useRef, useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { uploadPageImageAction } from "@/lib/api/page-blocks-actions";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { IconPicker } from "./IconPicker";
import { PROGRAM_HEADER_ICONS } from "./icons";
import { EMPTY_SUPPORTER, type ProgramSupporter } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const errorClass = "mt-1 text-xs text-[#ef4444]";

/**
 * The "Susținut de" repeater. Master-detail flow cloned from
 * `partner-collection/PartnerList`: a list of added supporters, plus a separate
 * sub-form with its own draft buffer that only commits on save. The logo comes
 * either from the preconfigured icon palette or from an uploaded image.
 */
export function SupporterList({
  value,
  onChange,
  error,
}: {
  value: ProgramSupporter[];
  onChange: (next: ProgramSupporter[]) => void;
  error?: string;
}) {
  // `editing === value.length` means a brand-new supporter is being drafted.
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<ProgramSupporter>(EMPTY_SUPPORTER);
  const [isUploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setDraft({ ...EMPTY_SUPPORTER });
    setUploadError(null);
    setEditing(value.length);
  };

  const openExisting = (index: number) => {
    setDraft({ ...value[index] });
    setUploadError(null);
    setEditing(index);
  };

  const usesImage = draft.sursaIcon === "imagine";
  const missingImage = usesImage && !draft.imagine;
  const missingAlt = Boolean(draft.imagine) && !draft.imagineAlt.trim();
  const canSave = Boolean(draft.nume.trim()) && !missingImage && !missingAlt;

  const saveDraft = () => {
    if (!canSave) return;
    const clean: ProgramSupporter = {
      ...draft,
      nume: draft.nume.trim(),
      imagineAlt: draft.imagineAlt.trim(),
    };
    onChange(
      editing === value.length
        ? [...value, clean]
        : value.map((s, i) => (i === editing ? clean : s)),
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
    const setField = (patch: Partial<ProgramSupporter>) =>
      setDraft((d) => ({ ...d, ...patch }));

    const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      setUploadError(null);
      startUpload(async () => {
        const form = new FormData();
        form.append("files", file);
        const result = await uploadPageImageAction(form);
        if (result.error || !result.image) {
          setUploadError(result.error ?? "Nu am putut încărca imaginea.");
          return;
        }
        setField({ imagine: result.image });
      });
    };

    return (
      <div className="rounded-xl border border-border p-4">
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          <ChevronLeft size={16} /> Înapoi la lista de susținători
        </button>

        <p className="mb-4 text-sm font-bold text-[#162040]">
          {editing === value.length ? "Susținător nou" : "Editează susținătorul"}
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="ph-sustinator-nume" className={labelClass}>
              Nume <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="ph-sustinator-nume"
              className={inputClass}
              value={draft.nume}
              onChange={(e) => setField({ nume: e.target.value })}
              placeholder="ex. Fundația pentru Parteneriat"
            />
          </div>

          <div>
            <span className={labelClass}>Logo</span>
            <SegmentedControl
              ariaLabel="Sursa logo-ului"
              value={draft.sursaIcon}
              onChange={(sursaIcon) => setField({ sursaIcon })}
              options={[
                { value: "predefinita", label: "Din listă" },
                { value: "imagine", label: "Imagine proprie" },
              ]}
            />
          </div>

          {usesImage ? (
            <div>
              {draft.imagine ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getMediaUrl(draft.imagine.url)}
                    alt=""
                    className="h-32 w-full bg-slate-50 object-contain"
                  />
                  <div className="flex items-center justify-between gap-3 border-t border-border bg-white px-4 py-2.5">
                    <span className="truncate text-sm text-[#475569]">
                      {draft.imagine.name || "imagine"}
                    </span>
                    <span className="flex shrink-0 items-center gap-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="text-sm font-semibold text-[#2563eb] hover:opacity-80 disabled:opacity-60"
                      >
                        {isUploading ? "Se încarcă..." : "Schimbă imaginea"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setField({ imagine: null })}
                        className="text-sm font-semibold text-[#ef4444] hover:opacity-80"
                      >
                        Elimină imaginea
                      </button>
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-sm font-semibold text-[#475569] transition-colors hover:border-[#2dbe8f] hover:text-[#162040] disabled:opacity-60"
                >
                  {isUploading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ImagePlus size={20} />
                  )}
                  {isUploading ? "Se încarcă..." : "Selectează imagine"}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              {uploadError && <p className={errorClass}>{uploadError}</p>}
            </div>
          ) : (
            <IconPicker
              value={draft.icon}
              onChange={(icon) => setField({ icon })}
              ariaLabel="Iconiță susținător"
            />
          )}

          {usesImage && draft.imagine ? (
            <div>
              <label htmlFor="ph-sustinator-alt" className={labelClass}>
                Text alternativ imagine <span className="text-[#ef4444]">*</span>
              </label>
              <input
                id="ph-sustinator-alt"
                className={inputClass}
                value={draft.imagineAlt}
                onChange={(e) => setField({ imagineAlt: e.target.value })}
                placeholder="ex. Logo Fundația pentru Parteneriat"
                aria-invalid={missingAlt}
              />
              {missingAlt && (
                <p className={errorClass}>
                  Adaugă un text alternativ pentru imagine.
                </p>
              )}
            </div>
          ) : null}

          <button
            type="button"
            onClick={saveDraft}
            disabled={!canSave}
            className="rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Salvează susținătorul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Susținători
        </span>
        <span className="text-xs text-[#94a3b8]">{value.length} adăugați</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Niciun susținător adăugat încă.
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((supporter, index) => {
            const Icon = PROGRAM_HEADER_ICONS[supporter.icon];
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
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eff6ff] text-[#2563eb]">
                    {supporter.sursaIcon === "imagine" && supporter.imagine ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getMediaUrl(supporter.imagine.url)}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Icon size={16} />
                    )}
                  </span>
                  <span className="truncate text-sm font-semibold text-[#162040]">
                    {supporter.nume || "fără nume"}
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
                    aria-label="Elimină susținătorul"
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
        <Plus size={16} /> Adaugă susținător
      </button>
    </div>
  );
}

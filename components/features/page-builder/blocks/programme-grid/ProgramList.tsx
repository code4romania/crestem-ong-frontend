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
import { CtaTargetField } from "../shared/CtaTargetField";
import { getMediaUrl } from "@/lib/api/client";
import { uploadPageImageAction } from "@/lib/api/page-blocks-actions";
import { MediaLibraryPicker } from "@/components/features/page-builder/MediaLibraryPicker";
import { IconPicker } from "./IconPicker";
import { PROGRAMME_ICONS } from "./icons";
import { EMPTY_PROGRAM, type Program } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const errorClass = "mt-1 text-xs text-[#ef4444]";

/**
 * The "Programe" repeater for Programme Grid. Master-detail flow cloned from
 * Feature Cards' `CardList`: a list of added programmes, plus a separate
 * sub-form ("Program nou" / edit) with its own draft buffer that only commits
 * on "Salvează programul". Image handling matches the Hero blocks
 * (`uploadPageImageAction` + preview).
 */
export function ProgramList({
  value,
  onChange,
  error,
}: {
  value: Program[];
  onChange: (next: Program[]) => void;
  error?: string;
}) {
  // `editing === value.length` means a brand-new programme is being drafted.
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Program>(EMPTY_PROGRAM);
  const [isUploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setDraft({ ...EMPTY_PROGRAM });
    setUploadError(null);
    setPickerOpen(false);
    setEditing(value.length);
  };

  const openExisting = (index: number) => {
    setDraft({ ...value[index] });
    setUploadError(null);
    setPickerOpen(false);
    setEditing(index);
  };

  const closeForm = () => setEditing(null);

  const missingAlt = Boolean(draft.imagine) && !draft.imagineAlt.trim();
  const canSave = Boolean(draft.titlu.trim()) && !missingAlt;

  const saveDraft = () => {
    if (!canSave) return;
    const clean: Program = {
      ...draft,
      titlu: draft.titlu.trim(),
      imagineAlt: draft.imagineAlt.trim(),
    };
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
    const setField = (patch: Partial<Program>) =>
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
          onClick={closeForm}
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#2563eb] hover:underline"
        >
          <ChevronLeft size={16} /> Înapoi la lista de programe
        </button>

        <p className="mb-4 text-sm font-bold text-[#162040]">
          {editing === value.length ? "Program nou" : "Editează programul"}
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
            <span className={labelClass}>Imagine</span>
            {draft.imagine ? (
              <div className="overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(draft.imagine.url)}
                  alt=""
                  className="h-40 w-full object-cover"
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
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="mt-2 text-xs font-semibold text-[#2563eb] hover:opacity-80"
            >
              Alege din bibliotecă
            </button>
            <MediaLibraryPicker
              open={pickerOpen}
              multiple={false}
              accept="image"
              onClose={() => setPickerOpen(false)}
              onPick={([file]) => {
                setField({
                  imagine: { id: file.id, url: file.url, name: file.name },
                  ...(file.alternativeText && !draft.imagineAlt
                    ? { imagineAlt: file.alternativeText }
                    : {}),
                });
                setPickerOpen(false);
              }}
            />
            {uploadError && <p className={errorClass}>{uploadError}</p>}
          </div>

          {draft.imagine ? (
            <div>
              <label htmlFor="pg-prog-alt" className={labelClass}>
                Text alternativ imagine <span className="text-[#ef4444]">*</span>
              </label>
              <input
                id="pg-prog-alt"
                className={inputClass}
                value={draft.imagineAlt}
                onChange={(e) => setField({ imagineAlt: e.target.value })}
                placeholder="Descriere accesibilă a imaginii"
                aria-invalid={missingAlt}
              />
              {missingAlt && (
                <p className={errorClass}>
                  Adaugă un text alternativ pentru imagine.
                </p>
              )}
            </div>
          ) : null}

          <div>
            <label htmlFor="pg-prog-titlu" className={labelClass}>
              Titlu <span className="text-[#ef4444]">*</span>
            </label>
            <input
              id="pg-prog-titlu"
              className={inputClass}
              value={draft.titlu}
              onChange={(e) => setField({ titlu: e.target.value })}
              placeholder="ex. Social Change Accelerator"
            />
          </div>

          <div>
            <label htmlFor="pg-prog-subtitlu" className={labelClass}>
              Subtitlu
            </label>
            <input
              id="pg-prog-subtitlu"
              className={inputClass}
              value={draft.subtitlu}
              onChange={(e) => setField({ subtitlu: e.target.value })}
              placeholder="ex. 12 săptămâni care îți transformă organizația"
            />
          </div>

          <div>
            <label htmlFor="pg-prog-descriere" className={labelClass}>
              Descriere
            </label>
            <textarea
              id="pg-prog-descriere"
              rows={3}
              className={inputClass}
              value={draft.descriere}
              onChange={(e) => setField({ descriere: e.target.value })}
              placeholder="Scurtă descriere a programului..."
            />
          </div>

          <div>
            <label htmlFor="pg-prog-perioada" className={labelClass}>
              Perioadă
            </label>
            <input
              id="pg-prog-perioada"
              className={inputClass}
              value={draft.perioada}
              onChange={(e) => setField({ perioada: e.target.value })}
              placeholder="ex. 01.09.2024 – 26.11.2024"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="pg-prog-cta" className={labelClass}>
                Text buton
              </label>
              <input
                id="pg-prog-cta"
                className={inputClass}
                value={draft.ctaLabel}
                onChange={(e) => setField({ ctaLabel: e.target.value })}
                placeholder="Află mai multe"
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
            Salvează programul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#475569]">
          Programe
        </span>
        <span className="text-xs text-[#94a3b8]">{value.length} adăugate</span>
      </div>

      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-[#94a3b8]">
          Niciun program adăugat încă.
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((program, index) => {
            const Icon = PROGRAMME_ICONS[program.icon];
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
                    {program.titlu || "fără titlu"}
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
                    aria-label="Elimină programul"
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
        <Plus size={16} /> Adaugă program
      </button>
    </div>
  );
}

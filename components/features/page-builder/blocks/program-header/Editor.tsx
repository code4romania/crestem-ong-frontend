"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { getMediaUrl } from "@/lib/api/client";
import { uploadPageImageAction } from "@/lib/api/page-blocks-actions";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MediaLibraryPicker } from "@/components/features/page-builder/MediaLibraryPicker";
import { IconPicker } from "./IconPicker";
import { ProgramSelect } from "./ProgramSelect";
import { StatList } from "./StatList";
import { SupporterList } from "./SupporterList";
import type { DirectoryProgram } from "@/lib/api/people";
import type { BlockFieldErrors } from "../../types";
import type { ProgramHeaderData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function ProgramHeaderEditor({
  value,
  onChange,
  errors,
}: {
  value: ProgramHeaderData;
  onChange: (next: ProgramHeaderData) => void;
  errors: BlockFieldErrors;
}) {
  const [isUploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<ProgramHeaderData>) =>
    onChange({ ...value, ...patch });

  /**
   * Picking a programme fills the title only while it is still empty, and never
   * touches the stats — those are the admin's own free-form rows. The
   * "Reimportă" button is the deliberate overwrite of the title.
   */
  const selectProgram = (program: DirectoryProgram | null) => {
    if (!program) {
      set({ program: { documentId: "", nume: "" } });
      return;
    }
    set({
      program: { documentId: program.documentId, nume: program.name },
      titlu: value.titlu || program.name,
    });
  };

  const reimportProgram = (program: DirectoryProgram) =>
    set({
      program: { documentId: program.documentId, nume: program.name },
      titlu: program.name,
    });

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
      set({ imagine: result.image });
    });
  };

  const usesImage = value.sursaVizual === "imagine";

  return (
    <div className="space-y-5">
      <ProgramSelect
        value={value.program}
        onSelect={selectProgram}
        onReimport={reimportProgram}
      />

      <div>
        <span className={labelClass}>Vizual program</span>
        <SegmentedControl
          ariaLabel="Sursa vizualului"
          value={value.sursaVizual}
          onChange={(sursaVizual) => set({ sursaVizual })}
          options={[
            { value: "predefinita", label: "Iconiță din listă" },
            { value: "imagine", label: "Imagine proprie" },
          ]}
        />
      </div>

      {usesImage ? (
        <div>
          {value.imagine ? (
            <div className="overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getMediaUrl(value.imagine.url)}
                alt=""
                className="h-32 w-full bg-slate-50 object-contain"
              />
              <div className="flex items-center justify-between gap-3 border-t border-border bg-white px-4 py-2.5">
                <span className="truncate text-sm text-[#475569]">
                  {value.imagine.name || "imagine"}
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
                    onClick={() => set({ imagine: null })}
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
          {errors.imagine && <p className={errorClass}>{errors.imagine}</p>}

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
              set({
                imagine: { id: file.id, url: file.url, name: file.name },
                ...(file.alternativeText && !value.imagineAlt
                  ? { imagineAlt: file.alternativeText }
                  : {}),
              });
              setPickerOpen(false);
            }}
          />
        </div>
      ) : (
        <IconPicker
          value={value.icon}
          onChange={(icon) => set({ icon })}
          ariaLabel="Iconiță program"
        />
      )}

      {usesImage && value.imagine ? (
        <div>
          <label htmlFor="ph-imagine-alt" className={labelClass}>
            Text alternativ imagine <span className="text-[#ef4444]">*</span>
          </label>
          <input
            id="ph-imagine-alt"
            className={inputClass}
            value={value.imagineAlt}
            onChange={(e) => set({ imagineAlt: e.target.value })}
            placeholder="ex. Logo Social Change Accelerator"
            aria-invalid={Boolean(errors.imagine)}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="ph-titlu" className={labelClass}>
          Titlu <span className="text-[#ef4444]">*</span>
        </label>
        <input
          id="ph-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="Social Change Accelerator"
          aria-invalid={Boolean(errors.titlu)}
        />
        {errors.titlu && <p className={errorClass}>{errors.titlu}</p>}
      </div>

      <div>
        <label htmlFor="ph-subtitlu" className={labelClass}>
          Subtitlu (opțional)
        </label>
        <textarea
          id="ph-subtitlu"
          rows={2}
          className={inputClass}
          value={value.subtitlu}
          onChange={(e) => set({ subtitlu: e.target.value })}
          placeholder="12 săptămâni care îți transformă organizația"
        />
      </div>

      <div>
        <label htmlFor="ph-sustinut-de" className={labelClass}>
          Etichetă susținători
        </label>
        <input
          id="ph-sustinut-de"
          className={inputClass}
          value={value.sustinutDeTitlu}
          onChange={(e) => set({ sustinutDeTitlu: e.target.value })}
          placeholder="Susținut de:"
        />
      </div>

      <SupporterList
        value={value.sustinatori}
        onChange={(sustinatori) => set({ sustinatori })}
        error={errors.sustinatori}
      />

      <StatList
        value={value.statistici}
        onChange={(statistici) => set({ statistici })}
        error={errors.statistici}
      />
    </div>
  );
}

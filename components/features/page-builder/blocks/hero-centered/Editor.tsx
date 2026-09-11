"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { BackgroundPicker } from "./BackgroundPicker";
import { MediaLibraryPicker } from "@/components/features/page-builder/MediaLibraryPicker";
import { getMediaUrl } from "@/lib/api/client";
import { uploadPageImageAction } from "@/lib/api/page-blocks-actions";
import { CtaTargetField } from "../shared/CtaTargetField";
import type { BlockFieldErrors } from "../../types";
import type { HeroCenteredData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function HeroCenteredEditor({
  value,
  onChange,
  errors,
}: {
  value: HeroCenteredData;
  onChange: (next: HeroCenteredData) => void;
  errors: BlockFieldErrors;
}) {
  const [isUploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (patch: Partial<HeroCenteredData>) => onChange({ ...value, ...patch });

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
      set({ image: result.image });
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="hc-supratitlu" className={labelClass}>
          Supratitlu
        </label>
        <input
          id="hc-supratitlu"
          className={inputClass}
          value={value.supratitlu}
          onChange={(e) => set({ supratitlu: e.target.value })}
          placeholder="Instrument juridic interactiv"
        />
      </div>

      <div>
        <label htmlFor="hc-titlu" className={labelClass}>
          Titlu <span className="text-[#ef4444]">*</span>
        </label>
        <input
          id="hc-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="LexiXplore ONG"
          aria-invalid={Boolean(errors.titlu)}
        />
        {errors.titlu && <p className={errorClass}>{errors.titlu}</p>}
      </div>

      <div>
        <label htmlFor="hc-subtitlu" className={labelClass}>
          Subtitlu (opțional)
        </label>
        <textarea
          id="hc-subtitlu"
          rows={3}
          className={inputClass}
          value={value.subtitlu}
          onChange={(e) => set({ subtitlu: e.target.value })}
          placeholder="Navighează prin întrebări și primești răspunsuri juridice clare, adaptate situației organizației tale — fără jargon legal."
        />
      </div>

      <div>
        <span className={labelClass}>Aliniere orizontală</span>
        <SegmentedControl
          ariaLabel="Aliniere orizontală"
          value={value.horizontalAlign}
          onChange={(horizontalAlign) => set({ horizontalAlign })}
          options={[
            { value: "stanga", label: "Stânga" },
            { value: "centru", label: "Centrat" },
            { value: "dreapta", label: "Dreapta" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Fundal</span>
        <BackgroundPicker
          value={value.background}
          onChange={(background) => set({ background })}
        />
      </div>

      {value.background === "imagine" && (
        <div>
          <span className={labelClass}>Imagine</span>
          {value.image ? (
            <div className="overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getMediaUrl(value.image.url)}
                alt=""
                className="h-48 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-3 border-t border-border bg-white px-4 py-2.5">
                <span className="truncate text-sm text-[#475569]">
                  {value.image.name || "imagine"}
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
                    onClick={() => set({ image: null })}
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
          {errors.image && <p className={errorClass}>{errors.image}</p>}
          {uploadError && <p className={errorClass}>{uploadError}</p>}

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
              set({ image: { id: file.id, url: file.url, name: file.name } });
              setPickerOpen(false);
            }}
          />

          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-[#162040]">
                Overlay pentru lizibilitate
              </span>
              <span className="block text-xs text-[#94a3b8]">
                Adaugă un strat semi-transparent pentru contrast
              </span>
            </span>
            <Toggle
              ariaLabel="Overlay pentru lizibilitate"
              checked={value.overlay}
              onChange={(overlay) => set({ overlay })}
            />
          </div>
        </div>
      )}

      <fieldset>
        <legend className={labelClass}>Primul buton</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            value={value.primaryCta.label}
            onChange={(e) => set({ primaryCta: { ...value.primaryCta, label: e.target.value } })}
            placeholder="Start"
            aria-label="Text primul buton"
          />
          <CtaTargetField
            value={value.primaryCta}
            onChange={(primaryCta) => set({ primaryCta })}
            ariaLabel="Link primul buton"
          />
        </div>
        {errors.primaryCta && <p className={errorClass}>{errors.primaryCta}</p>}
      </fieldset>

      <fieldset>
        <legend className={labelClass}>Al doilea buton (opțional)</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            value={value.secondaryCta.label}
            onChange={(e) => set({ secondaryCta: { ...value.secondaryCta, label: e.target.value } })}
            placeholder="Află mai multe"
            aria-label="Text al doilea buton"
          />
          <CtaTargetField
            value={value.secondaryCta}
            onChange={(secondaryCta) => set({ secondaryCta })}
            ariaLabel="Link al doilea buton"
          />
        </div>
        {errors.secondaryCta && <p className={errorClass}>{errors.secondaryCta}</p>}
      </fieldset>
    </div>
  );
}

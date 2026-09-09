"use client";

import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MediaLibraryPicker } from "@/components/features/page-builder/MediaLibraryPicker";
import { getMediaUrl } from "@/lib/api/client";
import { usePageImageUpload } from "../../upload";
import { CtaTargetField } from "../shared/CtaTargetField";
import type { BlockFieldErrors } from "../../types";
import type { HeroLargeSplitData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function HeroLargeSplitEditor({
  value,
  onChange,
  errors,
}: {
  value: HeroLargeSplitData;
  onChange: (next: HeroLargeSplitData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<HeroLargeSplitData>) => onChange({ ...value, ...patch });

  const {
    onFileInputChange,
    isUploading,
    error: uploadError,
    fileInputRef,
  } = usePageImageUpload((image) => set({ image }));

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="hls-supratitlu" className={labelClass}>
          Supratitlu
        </label>
        <input
          id="hls-supratitlu"
          className={inputClass}
          value={value.supratitlu}
          onChange={(e) => set({ supratitlu: e.target.value })}
          placeholder="Platforma #1 pentru organizații din România"
        />
      </div>

      <div>
        <label htmlFor="hls-titlu" className={labelClass}>
          Titlu <span className="text-[#ef4444]">*</span>
        </label>
        <input
          id="hls-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="Creștem capacitatea organizațiilor care schimbă România"
          aria-invalid={Boolean(errors.titlu)}
        />
        {errors.titlu && <p className={errorClass}>{errors.titlu}</p>}
      </div>

      <div>
        <label htmlFor="hls-subtitlu" className={labelClass}>
          Subtitlu (opțional)
        </label>
        <textarea
          id="hls-subtitlu"
          rows={3}
          className={inputClass}
          value={value.subtitlu}
          onChange={(e) => set({ subtitlu: e.target.value })}
          placeholder="Instrumente, resurse și sprijin pentru organizații care construiesc comunități mai puternice."
        />
      </div>

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
          onChange={onFileInputChange}
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
            set({ image: file });
            setPickerOpen(false);
          }}
        />
        {uploadError && <p className={errorClass}>{uploadError}</p>}
      </div>

      <div>
        <label htmlFor="hls-alt" className={labelClass}>
          Alt text imagine
        </label>
        <input
          id="hls-alt"
          className={inputClass}
          value={value.imageAlt}
          onChange={(e) => set({ imageAlt: e.target.value })}
          placeholder="Descriere accesibilă a imaginii"
          aria-invalid={Boolean(errors.imageAlt)}
        />
        {errors.imageAlt && <p className={errorClass}>{errors.imageAlt}</p>}
      </div>

      <div>
        <span className={labelClass}>Poziție imagine</span>
        <SegmentedControl
          ariaLabel="Poziție imagine"
          value={value.imagePosition}
          onChange={(imagePosition) => set({ imagePosition })}
          options={[
            { value: "dreapta", label: "Imagine dreapta" },
            { value: "stanga", label: "Imagine stânga" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Aliniere verticală</span>
        <SegmentedControl
          ariaLabel="Aliniere verticală"
          value={value.verticalAlign}
          onChange={(verticalAlign) => set({ verticalAlign })}
          options={[
            { value: "centru", label: "Centru" },
            { value: "sus", label: "Sus" },
          ]}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Primul buton</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            value={value.primaryCta.label}
            onChange={(e) => set({ primaryCta: { ...value.primaryCta, label: e.target.value } })}
            placeholder="Descoperă programele"
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

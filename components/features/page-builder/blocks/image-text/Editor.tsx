"use client";

import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { MediaLibraryPicker } from "@/components/features/page-builder/MediaLibraryPicker";
import { getMediaUrl } from "@/lib/api/client";
import { RichTextField } from "../../rich-text/RichTextField";
import { usePageImageUpload } from "../../upload";
import { CtaTargetField } from "../shared/CtaTargetField";
import type { BlockFieldErrors } from "../../types";
import type { ImageTextData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";
const optionalHint = "ml-1.5 font-normal normal-case text-[#94a3b8]";

export function ImageTextEditor({
  value,
  onChange,
  errors,
}: {
  value: ImageTextData;
  onChange: (next: ImageTextData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<ImageTextData>) => onChange({ ...value, ...patch });

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
        {errors.image && <p className={errorClass}>{errors.image}</p>}
        {uploadError && <p className={errorClass}>{uploadError}</p>}
      </div>

      <div>
        <label htmlFor="image-text-alt" className={labelClass}>
          Alt text imagine
        </label>
        <input
          id="image-text-alt"
          className={inputClass}
          value={value.altText}
          onChange={(e) => set({ altText: e.target.value })}
          placeholder="Descriere accesibilă a imaginii"
          aria-invalid={Boolean(errors.altText)}
        />
        {errors.altText && <p className={errorClass}>{errors.altText}</p>}
      </div>

      <div>
        <label htmlFor="image-text-supratitlu" className={labelClass}>
          Supratitlu<span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="image-text-supratitlu"
          className={inputClass}
          value={value.supratitlu}
          onChange={(e) => set({ supratitlu: e.target.value })}
          placeholder="ex. Cum funcționează"
        />
      </div>

      <div>
        <label htmlFor="image-text-titlu" className={labelClass}>
          Titlu<span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="image-text-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Un parcurs adaptat fiecărei organizații"
        />
      </div>

      <div>
        <span className={labelClass}>
          Text <span className="text-[#ef4444]">*</span>
        </span>
        <RichTextField
          value={value.text}
          onChange={(text) => set({ text })}
          invalid={Boolean(errors.text)}
        />
        {errors.text && <p className={errorClass}>{errors.text}</p>}
      </div>

      <div>
        <span className={labelClass}>Aliniere</span>
        <SegmentedControl
          ariaLabel="Aliniere"
          value={value.aliniere}
          onChange={(aliniere) => set({ aliniere })}
          options={[
            { value: "stanga", label: "Stânga" },
            { value: "centru", label: "Centru" },
            { value: "dreapta", label: "Dreapta" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Proporție coloane</span>
        <SegmentedControl
          ariaLabel="Proporție coloane"
          value={value.proportie}
          onChange={(proportie) => set({ proportie })}
          options={[
            { value: "50-50", label: "50 / 50" },
            { value: "40-60", label: "40 / 60" },
            { value: "60-40", label: "60 / 40" },
          ]}
        />
        {value.aliniere === "centru" && (
          <p className="mt-1 text-xs text-[#94a3b8]">
            Se aplică doar când imaginea e la stânga sau la dreapta.
          </p>
        )}
      </div>

      <div>
        <span className={labelClass}>Colțuri</span>
        <SegmentedControl
          ariaLabel="Colțuri"
          value={value.colturi}
          onChange={(colturi) => set({ colturi })}
          options={[
            { value: "default", label: "Default" },
            { value: "drepte", label: "Fără rotunjire" },
          ]}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Primul buton</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            value={value.primaryCta.label}
            onChange={(e) =>
              set({ primaryCta: { ...value.primaryCta, label: e.target.value } })
            }
            placeholder="Descoperă programul"
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
        <legend className={labelClass}>
          Al doilea buton<span className={optionalHint}>(opțional)</span>
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={inputClass}
            value={value.secondaryCta.label}
            onChange={(e) =>
              set({
                secondaryCta: { ...value.secondaryCta, label: e.target.value },
              })
            }
            placeholder="Află mai multe"
            aria-label="Text al doilea buton"
          />
          <CtaTargetField
            value={value.secondaryCta}
            onChange={(secondaryCta) => set({ secondaryCta })}
            ariaLabel="Link al doilea buton"
          />
        </div>
        {errors.secondaryCta && (
          <p className={errorClass}>{errors.secondaryCta}</p>
        )}
      </fieldset>
    </div>
  );
}

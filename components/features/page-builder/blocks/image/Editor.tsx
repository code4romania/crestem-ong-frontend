"use client";

import { ImagePlus, Loader2 } from "lucide-react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { getMediaUrl } from "@/lib/api/client";
import { usePageImageUpload } from "../../upload";
import type { BlockFieldErrors } from "../../types";
import type { ImageData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors disabled:opacity-60";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function ImageEditor({
  value,
  onChange,
  errors,
}: {
  value: ImageData;
  onChange: (next: ImageData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<ImageData>) => onChange({ ...value, ...patch });

  const {
    onFileInputChange,
    isUploading,
    error: uploadError,
    fileInputRef,
  } = usePageImageUpload((image) => set({ image }));

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
          disabled
          title="În curând"
          className="mt-2 text-xs font-semibold text-[#94a3b8]"
        >
          Alege din Media Library · în curând
        </button>
        {errors.image && <p className={errorClass}>{errors.image}</p>}
        {uploadError && <p className={errorClass}>{uploadError}</p>}
      </div>

      <div>
        <label htmlFor="image-alt" className={labelClass}>
          Alt text imagine
        </label>
        <input
          id="image-alt"
          className={inputClass}
          value={value.altText}
          onChange={(e) => set({ altText: e.target.value })}
          placeholder="Descriere accesibilă a imaginii"
          aria-invalid={Boolean(errors.altText)}
        />
        {errors.altText && <p className={errorClass}>{errors.altText}</p>}
      </div>

      <div>
        <span className={labelClass}>Lățime imagine</span>
        <SegmentedControl
          ariaLabel="Lățime imagine"
          value={value.latime}
          onChange={(latime) => set({ latime })}
          options={[
            { value: "compacta", label: "Compactă" },
            { value: "standard", label: "Standard" },
            { value: "lata", label: "Lată" },
            { value: "full", label: "Full width" },
          ]}
        />
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
        <span className={labelClass}>Raport imagine</span>
        <SegmentedControl
          ariaLabel="Raport imagine"
          value={value.raport}
          onChange={(raport) => set({ raport })}
          options={[
            { value: "original", label: "Original" },
            { value: "16:9", label: "16:9" },
            { value: "4:3", label: "4:3" },
            { value: "1:1", label: "1:1" },
          ]}
        />
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

      <div className="rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-[#162040]">
            Imagine cu link
          </span>
          <Toggle
            ariaLabel="Imagine cu link"
            checked={value.areLink}
            onChange={(areLink) => set({ areLink })}
          />
        </div>

        {value.areLink && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="image-link" className={labelClass}>
                Link
              </label>
              <input
                id="image-link"
                className={inputClass}
                value={value.link}
                onChange={(e) => set({ link: e.target.value })}
                placeholder="/pagina sau https://..."
                aria-invalid={Boolean(errors.link)}
              />
              {errors.link && <p className={errorClass}>{errors.link}</p>}
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[#162040]">
                Deschide într-un tab nou
              </span>
              <Toggle
                ariaLabel="Deschide într-un tab nou"
                checked={value.linkTabNou}
                onChange={(linkTabNou) => set({ linkTabNou })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

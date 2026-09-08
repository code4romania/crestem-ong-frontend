"use client";

import { useEffect, useRef } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Toggle } from "@/components/ui/Toggle";
import { GalleryImageList } from "./GalleryImageList";
import type { BlockFieldErrors } from "../../types";
import type { GalleryData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const optionalHint = "ml-1.5 font-normal normal-case text-[#94a3b8]";

export function GalleryEditor({
  value,
  onChange,
  errors,
}: {
  value: GalleryData;
  onChange: (next: GalleryData) => void;
  errors: BlockFieldErrors;
}) {
  // A slow multi-image upload commits asynchronously from `GalleryImageList`;
  // without this ref its stale closure would spread an outdated `value` and wipe
  // any titlu / descriere typed while the upload was running.
  const latestValue = useRef(value);
  useEffect(() => {
    latestValue.current = value;
  });
  const set = (patch: Partial<GalleryData>) =>
    onChange({ ...latestValue.current, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="gallery-titlu" className={labelClass}>
          Titlu<span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="gallery-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Galerie foto — ediția anterioară"
        />
      </div>

      <div>
        <label htmlFor="gallery-descriere" className={labelClass}>
          Descriere<span className={optionalHint}>(opțional)</span>
        </label>
        <textarea
          id="gallery-descriere"
          rows={3}
          className={inputClass}
          value={value.descriere}
          onChange={(e) => set({ descriere: e.target.value })}
          placeholder="Câteva momente din activitățile desfășurate împreună cu organizațiile participante."
        />
      </div>

      <GalleryImageList
        value={value.imagini}
        onChange={(imagini) => set({ imagini })}
        error={errors.imagini}
      />

      <div>
        <span className={labelClass}>Stil galerie</span>
        <SegmentedControl
          ariaLabel="Stil galerie"
          value={value.stil}
          onChange={(stil) => set({ stil })}
          options={[
            { value: "grid", label: "Grid" },
            { value: "masonry", label: "Masonry" },
            { value: "carusel", label: "Carusel" },
          ]}
        />
      </div>

      <div>
        <span className={labelClass}>Coloane</span>
        <SegmentedControl
          ariaLabel="Coloane"
          value={value.coloane}
          onChange={(coloane) => set({ coloane })}
          options={[
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
          ]}
        />
        {value.stil === "carusel" && (
          <p className="mt-1 text-xs text-[#94a3b8]">
            Numărul de imagini vizibile simultan în carusel.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
        <label
          htmlFor="gallery-lightbox"
          className="text-sm font-medium text-[#162040]"
        >
          Deschide imaginile în lightbox
        </label>
        <Toggle
          id="gallery-lightbox"
          checked={value.lightbox}
          onChange={(lightbox) => set({ lightbox })}
          ariaLabel="Deschide imaginile în lightbox"
        />
      </div>
    </div>
  );
}

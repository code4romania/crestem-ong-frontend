"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { BlockFieldErrors } from "../../types";
import type { EmbedData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const errorClass = "mt-1 text-xs text-[#ef4444]";
const hintClass = "mt-1 text-xs text-[#94a3b8]";
const optionalHint = "ml-1.5 font-normal normal-case text-[#94a3b8]";

export function EmbedEditor({
  value,
  onChange,
  errors,
}: {
  value: EmbedData;
  onChange: (next: EmbedData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<EmbedData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="embed-titlu" className={labelClass}>
          Titlu<span className={optionalHint}>(opțional)</span>
        </label>
        <input
          id="embed-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Locație"
        />
      </div>

      <div>
        <label htmlFor="embed-url" className={labelClass}>
          Link <span className="text-[#ef4444]">*</span>
        </label>
        <input
          id="embed-url"
          className={inputClass}
          value={value.url}
          onChange={(e) => set({ url: e.target.value })}
          placeholder="https://www.google.com/maps/embed?..."
          aria-invalid={Boolean(errors.url)}
        />
        {errors.url ? (
          <p className={errorClass}>{errors.url}</p>
        ) : (
          <p className={hintClass}>
            Unele site-uri nu permit afișarea în pagină (antet
            X-Frame-Options) — folosește un link de tip „embed” unde există.
          </p>
        )}
      </div>

      <div>
        <span className={labelClass}>Raport</span>
        <SegmentedControl
          ariaLabel="Raport"
          value={value.raport}
          onChange={(raport) => set({ raport })}
          options={[
            { value: "16:9", label: "16:9" },
            { value: "4:3", label: "4:3" },
            { value: "1:1", label: "1:1" },
          ]}
        />
      </div>
    </div>
  );
}

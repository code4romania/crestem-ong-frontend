"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { RichTextField } from "../../rich-text/RichTextField";
import type { BlockFieldErrors } from "../../types";
import type { RichTextData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const errorClass = "mt-1 text-xs text-[#ef4444]";

export function RichTextEditor({
  value,
  onChange,
  errors,
}: {
  value: RichTextData;
  onChange: (next: RichTextData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<RichTextData>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="rt-titlu" className={labelClass}>
          Titlu (opțional)
        </label>
        <input
          id="rt-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="ex. Cum personalizezi template-ul"
        />
      </div>

      <div>
        <span className={labelClass}>
          Conținut <span className="text-[#ef4444]">*</span>
        </span>
        <RichTextField
          value={value.continut}
          onChange={(continut) => set({ continut })}
          invalid={Boolean(errors.continut)}
        />
        {errors.continut && <p className={errorClass}>{errors.continut}</p>}
      </div>

      <div>
        <span className={labelClass}>Aliniere bloc</span>
        <SegmentedControl
          ariaLabel="Aliniere bloc"
          value={value.aliniere}
          onChange={(aliniere) => set({ aliniere })}
          options={[
            { value: "stanga", label: "Stânga" },
            { value: "centru", label: "Centrat" },
            { value: "dreapta", label: "Dreapta" },
          ]}
        />
      </div>
    </div>
  );
}

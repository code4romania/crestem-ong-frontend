"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { BlockFieldErrors } from "../../types";
import type { SectionHeaderData } from "./schema";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide mb-1.5 text-[#475569]";
const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[#2dbe8f]/30 focus:border-[#2dbe8f] transition-colors";
const optionalHint = "font-normal normal-case text-[#94a3b8]";

export function SectionHeaderEditor({
  value,
  onChange,
  errors,
}: {
  value: SectionHeaderData;
  onChange: (next: SectionHeaderData) => void;
  errors: BlockFieldErrors;
}) {
  const set = (patch: Partial<SectionHeaderData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="section-header-titlu" className={labelClass}>
          Titlu
        </label>
        <input
          id="section-header-titlu"
          className={inputClass}
          value={value.titlu}
          onChange={(e) => set({ titlu: e.target.value })}
          placeholder="Cum funcționează programul"
        />
        {errors.titlu && (
          <p className="mt-1 text-xs text-[#ef4444]">{errors.titlu}</p>
        )}
      </div>

      <div>
        <label htmlFor="section-header-subtitlu" className={labelClass}>
          Subtitlu <span className={optionalHint}>(opțional)</span>
        </label>
        <textarea
          id="section-header-subtitlu"
          rows={2}
          className={inputClass}
          value={value.subtitlu}
          onChange={(e) => set({ subtitlu: e.target.value })}
          placeholder="O privire de ansamblu asupra etapelor prin care trece fiecare organizație."
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
            { value: "centru", label: "Centrat" },
            { value: "dreapta", label: "Dreapta" },
          ]}
        />
      </div>
    </div>
  );
}
